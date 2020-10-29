import React from 'react';
import {
  View,
  ScrollView,
  Image,
  Text,
  TouchableOpacity,
  Linking,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import BaseComponent from '../../components/BaseComponent';
import ThemeStyle from '../../styles/ThemeStyle';
import Header from '../../components/Header';
import Dimensions from '../../styles/Dimensions';
import TextStyles from '../../styles/TextStyles';
import {withStore} from '../../utils/StoreUtils';
import InputField from '../../components/InputField';
import {
  getSessionTypeDetails,
  getLibraryItemsPath,
  errorMessage,
  omitDeep,
  isNullOrEmpty,
} from '../../utils';
import moment from 'moment';
import UploadComponent from '../library/UploadComponent';
import CustomButton from '../../components/Button';
import {
  uploadTypes,
  appTypes,
  appContentTypes,
  s3ProtectionLevel,
  sessionTypes,
  programStatus,
} from '../../constants';
import {appsyncClient} from '../../../App';
import {editProgramTask, editProgramSession} from '../../queries/session';
import {showMessage} from 'react-native-flash-message';
import Card from '../../components/Card';
import _ from 'lodash';
import ImageLibraryItem from '../../components/ImageLibraryItem';
import PDForLinkLibraryItem from '../../components/PDForLinkLibraryItem';
import {Storage} from 'aws-amplify';
import {startVideoSession} from '../../queries/messages';
import Icon from '../../components/Icon';
import LinearGradient from 'react-native-linear-gradient';
import CustomInput from '../../components/CustomInput';
import EditDurationModal from '../../modals/EditDurationModal';
import {
  editCohortTask,
  editCohortSession,
  deleteCohortTaskAndSession,
} from '../../queries/cohort';
import {NoData} from '../../components/NoData';
import ConfirmationModal from '../../modals/ConfirmationModal';
import {deleteProgramTaskAndSession} from '../../queries/program';

class SessionDetailsScreen extends BaseComponent {
  constructor(props) {
    super(props);
    this.state.session = _.cloneDeep(props.navigation.getParam('session', {}));
    this.state.program = props.navigation.getParam('program', {});
    this.state.isCohortSession = props.navigation.getParam(
      'isCohortSession',
      false,
    );
    this.state.isUserProgram = props.user.userId === this.state.program.coachId;
    this.state.isCoCoach =
      this.state.program.coCoach &&
      this.state.program.coCoach
        .map(coCoach => coCoach.userId)
        .includes(props.user.userId);
    this.state.isEditable = false;
    this.state.isTask = this.state.session.type === sessionTypes.TASK;
    this.state.isDatePickerVisible = false;
    this.daysFromStart = this.state.isCohortSession
      ? null
      : `${this.state.session.relativeDays}`;
  }

  getSessionInput = () => {
    const {session, isCohortSession, isTask} = this.state;
    const sessionInput = {
      name: session.name,
      description: session.description,
      startDate: session.startDate,
    };
    if (!isTask) {
      sessionInput.module = session.module;
      sessionInput.type = session.type;
      sessionInput.instructions = session.instructions;
      sessionInput.material = session.material;
    }
    if (!isCohortSession) {
      sessionInput.relativeStartDate = session.relativeStartDate;
    }
    return omitDeep(sessionInput, '__typename');
  };

  onSelectDate = date => {
    const {session} = this.state;
    session.startDate = date.toISOString();
    this.setState({session, isDatePickerVisible: false, isUpdated: true});
  };

  onSelectDocument = selectedItems => {
    console.log('ON SELECT DOCUMENT');
    const {session} = this.state;
    const selectedItemsPaths = getLibraryItemsPath(selectedItems);
    if (!session.material) {
      session.material = {};
    }
    session.material.links = selectedItemsPaths[uploadTypes.LINK];
    session.material.pdfs = selectedItemsPaths[uploadTypes.PDF];
    session.material.images = selectedItemsPaths[uploadTypes.IMAGE];
    console.log('ON SELECT DOCUMENT UPDATE', session.material);
    this.setState({isUpdated: true, session});
  };

  onSelectAppContent = selectedItems => {
    const {session} = this.state;
    if (!session.material) {
      session.material = {};
    }
    session.material.appcontents = selectedItems;
    this.setState({
      isUpdated: true,
      session,
    });
  };

  hasMaterial = type => {
    const {session} = this.state;
    return !!(
      session.material &&
      session.material[type] &&
      session.material[type].length
    );
  };

  renderAppContent = (type, label, content) => {
    if (!content || !content.length) {
      return null;
    }
    return (
      <Card
        style={{marginBottom: Dimensions.marginRegular}}
        contentStyle={{padding: Dimensions.marginLarge}}>
        <Text
          style={[TextStyles.GeneralTextBold, {color: ThemeStyle.mainColor}]}>
          {label}
        </Text>
        {content.map(item => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: Dimensions.marginRegular,
            }}>
            <Image source={require('../../assets/images/tick.png')} />
            <Text
              style={[
                TextStyles.ContentText,
                {marginLeft: Dimensions.marginRegular},
              ]}>
              {item}
            </Text>
          </View>
        ))}
      </Card>
    );
  };

  onUpdate = () => {
    const {session, isCohortSession, isTask} = this.state;
    const {setLoading} = this.props;
    if (!isTask && isNullOrEmpty(session.module)) {
      return showMessage(errorMessage('Please enter valid module name'));
    }
    if (isNullOrEmpty(session.name)) {
      return showMessage(errorMessage('Please enter valid session name'));
    }
    if (!session.startDate) {
      return showMessage(errorMessage('Please enter session time'));
    }
    if (!isCohortSession) {
      if (
        !this.daysFromStart ||
        isNaN(parseInt(this.daysFromStart)) ||
        parseInt(this.daysFromStart) < 1
      ) {
        return showMessage(
          errorMessage('Day from start should be greater than zero'),
        );
      } else {
        session.relativeStartDate = {
          interval: parseInt(this.daysFromStart),
          period: 'DAYS',
        };
      }
    }
    if (session.type === sessionTypes.TASK) {
      if (isNullOrEmpty(session.description)) {
        return showMessage(errorMessage('Please enter a task description'));
      }
    }
    console.log('UPDATE SESSION INPUT', this.getSessionInput());
    setLoading(true);
    let mutation;
    let key;
    const refetchQueries = ['getProgramWithSchedules'];
    const variables = {session: this.getSessionInput()};
    if (isCohortSession) {
      key = isTask ? 'editCohortTask' : 'editCohortSession';
      mutation = isTask ? editCohortTask : editCohortSession;
      refetchQueries.push('getCohort');
    } else {
      key = isTask ? 'editProgramTask' : 'editProgramSession';
      mutation = isTask ? editProgramTask : editProgramSession;
    }
    if (isTask) {
      variables.taskId = session.id;
    } else {
      variables.sessionId = session.id;
    }
    console.log('EDITING SESSION', variables, key);
    appsyncClient
      .mutate({
        mutation,
        variables,
        refetchQueries,
      })
      .then(data => {
        console.log('EDITED SESSION', data);
        setLoading(false);
        showMessage({type: 'success', message: 'Session Updated'});
        this.setState({isUpdated: false});
      })
      .catch(err => {
        console.log('ERROR IN EDITING SESSION', err);
        setLoading(false);
        showMessage(
          errorMessage('Failed to update session. Please try again.'),
        );
      });
  };

  deleteSession = () => {
    const {program, session, isCohortSession} = this.state;
    const {setLoading, navigation} = this.props;
    setLoading(true);
    let mutation,
      key,
      variables = {sessionId: session.id},
      refetchQueries = [];
    if (isCohortSession) {
      mutation = deleteCohortTaskAndSession;
      key = 'deleteCohortTaskAndSession';
      variables.cohortId = program.id;
      refetchQueries.push('getCohort');
    } else {
      mutation = deleteProgramTaskAndSession;
      key = 'deleteProgramTaskAndSession';
      variables.programId = program.id;
      refetchQueries.push('getProgramWithSchedules');
    }
    console.log('DELETE SESSION', key, variables);
    appsyncClient
      .mutate({
        mutation,
        variables,
        refetchQueries,
      })
      .then(data => {
        console.log('DELETED PROGRAM SESSION', data);
        setLoading(false);
        if (data.data && data.data[key] && data.data[key].success) {
          showMessage({
            type: 'success',
            message: data.data[key].message || 'Successfully deleted session',
          });
          navigation.pop();
        } else {
          showMessage(errorMessage(data.data[key].message));
        }
      })
      .catch(err => {
        console.log('ERROR IN DELETING PROGRAM MODULE', err);
        setLoading(false);
        showMessage(errorMessage('Failed to delete module. Please try again'));
      });
  };

  onStartVideoSession = () => {
    const {setLoading, navigation} = this.props;
    const {session, program} = this.state;
    setLoading(true);
    appsyncClient
      .mutate({
        mutation: startVideoSession,
        variables: {
          sessionId: session.id,
          cohortId: program.id,
        },
      })
      .then(data => {
        console.log('CREATED VIDEO SESSION', data);
        setLoading(false);
        if (data.data && data.data.startVideoSession) {
          navigation.navigate('VideoChat', {
            ...data.data.startVideoSession,
            title: session.name,
            isGroup: true,
            isCoach: true,
            coachId: session.coachId,
          });
        }
      })
      .catch(err => {
        console.log('ERROR CREATING VIDEO SESSION', err);
        setLoading(false);
        showMessage(
          errorMessage('Failed to start a video session. Please try again.'),
        );
      });
  };

  onJoinVideoSession = () => {
    const {navigation} = this.props;
    const {session} = this.state;
    navigation.navigate('VideoChat', {
      ...session.videoSession,
      title: session.name,
      isGroup: true,
      isCoach: false,
      coachId: session.coachId,
    });
  };

  renderVideoSessionButton = () => {
    const {
      isUserProgram,
      isCoCoach,
      session,
      isCohortSession,
      isEditable,
    } = this.state;
    if (
      moment().isAfter(moment(session.startDate).add(8, 'hours')) ||
      isEditable
    ) {
      return null;
    }
    if (session.type === sessionTypes.VIDEO && isCohortSession) {
      const title =
        isUserProgram || isCoCoach
          ? 'Start Video Session'
          : 'Join Video Session';
      const info =
        isUserProgram || isCoCoach
          ? 'You will be able to start a video session 15 minutes prior to session time'
          : 'You will be able to join the session when coach starts the video';
      let canShow = false;
      if (isUserProgram || isCoCoach) {
        canShow = moment().isAfter(
          moment(session.startDate).subtract(15, 'minutes'),
        );
      } else {
        canShow = !!session.videoSession;
      }
      return (
        <View style={{marginVertical: Dimensions.marginRegular}}>
          {!canShow && (
            <View
              style={{
                flexDirection: 'row',
                flex: 1,
                marginHorizontal: Dimensions.marginRegular,
              }}>
              <Icon
                size={24}
                color={ThemeStyle.mainColor}
                name="ios-information-circle-outline"
                family="Ionicons"
              />
              <Text
                style={[
                  TextStyles.ContentTextBold,
                  {marginLeft: Dimensions.marginSmall, flex: 1},
                ]}>
                {info}
              </Text>
            </View>
          )}
          <CustomButton
            name={title}
            style={{
              marginVertical: Dimensions.marginSmall,
              opacity: canShow ? 1 : 0.5,
            }}
            onPress={
              isUserProgram || isCoCoach
                ? this.onStartVideoSession
                : this.onJoinVideoSession
            }
            disabled={!canShow}
          />
        </View>
      );
    }
    return null;
  };

  renderLearningMaterial = () => {
    const {session, isUserProgram, isCoCoach, isEditable} = this.state;
    const {navigation} = this.props;
    if (session.type === sessionTypes.TASK) {
      return null;
    }
    return (
      <View>
        <Text
          style={[
            TextStyles.SubHeader2,
            {paddingVertical: Dimensions.marginRegular},
          ]}>
          Learning Materials and Homeworks
        </Text>
        {(isUserProgram || isCoCoach) && isEditable && (
          <UploadComponent
            initialItems={
              session.material && {
                [uploadTypes.LINK]: session.material[uploadTypes.LINK] || [],
                [uploadTypes.PDF]: session.material[uploadTypes.PDF] || [],
                [uploadTypes.IMAGE]: session.material[uploadTypes.IMAGE] || [],
              }
            }
            navigation={navigation}
            hideLibrary={false}
            isSelect={true}
            onSelect={this.onSelectDocument}
          />
        )}
        {this.hasMaterial(uploadTypes.IMAGE) && (
          <View
            style={{
              flexDirection: 'column',
              marginVertical: Dimensions.marginRegular,
            }}>
            <Text
              style={[
                TextStyles.SubHeader2,
                {marginBottom: Dimensions.marginRegular},
              ]}>
              Images
            </Text>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
              }}>
              {session.material[uploadTypes.IMAGE].map(item => (
                <ImageLibraryItem
                  item={item}
                  onPress={() => {
                    navigation.navigate('ViewImage', {
                      uri: item,
                    });
                  }}
                  isSelected={false}
                />
              ))}
            </View>
          </View>
        )}
        {this.hasMaterial(uploadTypes.PDF) && (
          <View
            style={{
              flexDirection: 'column',
              marginVertical: Dimensions.marginRegular,
            }}>
            <Text
              style={[
                TextStyles.SubHeader2,
                {marginBottom: Dimensions.marginRegular},
              ]}>
              Documents
            </Text>
            {session.material[uploadTypes.PDF].map(item => (
              <PDForLinkLibraryItem
                item={item}
                isSelected={true}
                onPress={async () => {
                  Linking.openURL(
                    await Storage.get(item, {
                      level: s3ProtectionLevel.PROTECTED,
                    }),
                  );
                }}
                type={uploadTypes.PDF}
              />
            ))}
          </View>
        )}
        {this.hasMaterial(uploadTypes.LINK) && (
          <View
            style={{
              flexDirection: 'column',
              marginVertical: Dimensions.marginRegular,
            }}>
            <Text
              style={[
                TextStyles.SubHeader2,
                {marginBottom: Dimensions.marginRegular},
              ]}>
              Links
            </Text>
            {session.material[uploadTypes.LINK].map(item => (
              <PDForLinkLibraryItem
                item={item}
                isSelected={false}
                onPress={() => {
                  Linking.openURL(item);
                }}
                type={uploadTypes.LINK}
              />
            ))}
          </View>
        )}
        {!this.hasMaterial(uploadTypes.IMAGE) &&
          !this.hasMaterial(uploadTypes.LINK) &&
          !this.hasMaterial(uploadTypes.PDF) &&
          !isEditable && <NoData message="No learning material" />}
      </View>
    );
  };

  renderAppContentSection = () => {
    const {isUserProgram, isCoCoach, session, program, isEditable} = this.state;
    const {navigation} = this.props;
    if (session.type === sessionTypes.TASK) {
      return null;
    }
    if (
      program.isFree &&
      (program.status === programStatus.PUBLISHED || !isEditable)
    ) {
      return null;
    }
    return (
      <View>
        {program.app && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: Dimensions.marginRegular,
              opacity: program.isFree ? 0.6 : 1,
            }}>
            <Text style={TextStyles.SubHeader2}>App Content:</Text>
            <Image
              source={appTypes[program.app].icon}
              style={{
                width: Dimensions.r28,
                height: Dimensions.r28,
                marginHorizontal: Dimensions.marginSmall,
              }}
              resizeMode="contain"
            />
            <Text>{appTypes[program.app].name}</Text>
            {(isUserProgram || isCoCoach) && isEditable && (
              <TouchableOpacity
                style={{position: 'absolute', right: 0}}
                onPress={() => {
                  if (program.isFree) {
                    return showMessage(
                      errorMessage(
                        'Adding app content is only available in paid programs',
                      ),
                    );
                  }
                  navigation.navigate('AppContent', {
                    app: program.app,
                    onSelect: this.onSelectAppContent,
                    selectedItems:
                      session.material && session.material.appcontents,
                  });
                }}>
                <Image source={require('../../assets/images/edit.png')} />
              </TouchableOpacity>
            )}
          </View>
        )}
        {session.material && session.material.appcontents && !program.isFree && (
          <View>
            {this.renderAppContent(
              appContentTypes.EXERCISE,
              'Exercises',
              session.material.appcontents[appContentTypes.EXERCISE],
            )}
            {this.renderAppContent(
              appContentTypes.MEDITATION,
              'Meditations',
              session.material.appcontents[appContentTypes.MEDITATION],
            )}
            {this.renderAppContent(
              appContentTypes.LESSON,
              'Lessons',
              session.material.appcontents[appContentTypes.LESSON],
            )}
            {this.renderAppContent(
              appContentTypes.PRACTICE_IDEA,
              'Practice Ideas',
              session.material.appcontents[appContentTypes.PRACTICE_IDEA],
            )}
          </View>
        )}
      </View>
    );
  };

  renderType = type => {
    const {session} = this.state;
    const typeDetails = getSessionTypeDetails(type);
    return (
      <TouchableOpacity
        onPress={() => {
          session.type = type;
          this.setState({
            session,
            isUpdated: true,
          });
        }}
        style={{
          flex: 1,
          marginRight: Dimensions.marginRegular,
          ...ThemeStyle.shadow(),
        }}>
        <LinearGradient
          style={{
            borderRadius: Dimensions.r20,
            justifyContent: 'center',
            alignItems: 'center',
            padding: Dimensions.marginExtraLarge,
          }}
          colors={
            session.type === type ? ThemeStyle.gradientColor : ['#fff', '#fff']
          }>
          <Image
            source={typeDetails.image}
            style={{
              height: Dimensions.r48,
              tintColor:
                session.type === type
                  ? ThemeStyle.white
                  : ThemeStyle.textRegular,
            }}
            resizeMode="contain"
          />
          <Text
            style={[
              TextStyles.GeneralTextBold,
              {
                color:
                  session.type === type
                    ? ThemeStyle.white
                    : ThemeStyle.textRegular,
                marginTop: Dimensions.marginSmall,
                textAlign: 'center',
              },
            ]}>
            {typeDetails.name}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  render() {
    const {navigation} = this.props;
    const {
      session,
      isUpdated,
      program,
      isEditable,
      isTask,
      isCohortSession,
      isDatePickerVisible,
      isUserProgram,
      isCoCoach,
    } = this.state;
    const isPastSession =
      isCohortSession && moment().isAfter(moment(session.startDate));
    return this.renderWithSafeArea(
      <View style={ThemeStyle.pageContainer}>
        <Header
          title={session.type === sessionTypes.TASK ? 'Task' : 'Session'}
          goBack={() => {
            navigation.pop();
          }}
          rightIcon={() =>
            (isUserProgram || isCoCoach) && !isEditable && !isPastSession ? (
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity
                  onPress={() => {
                    if (!isUserProgram && !isCoCoach) {
                      return null;
                    }
                    this.setState({isEditable: true}, () => {
                      if (this.nameInput) {
                        this.nameInput.focus();
                      }
                    });
                  }}>
                  <Image
                    source={require('../../assets/images/edit.png')}
                    style={{
                      tintColor: ThemeStyle.mainColor,
                      marginRight: Dimensions.marginRegular,
                    }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    this.confirmationModal.show({
                      message: `Are you sure you want to delete this ${
                        isTask ? 'task' : 'session'
                      }?`,
                      onConfirm: () => {
                        this.deleteSession();
                      },
                    });
                  }}>
                  <Icon
                    size={Dimensions.r24}
                    color={ThemeStyle.red}
                    fontFamily="Ionicons"
                    name="ios-trash"
                  />
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: Dimensions.screenMarginRegular,
            paddingBottom: Dimensions.r72,
          }}>
          {isEditable && !isCohortSession && (
            <Text
              style={
                ([TextStyles.GeneralTextBold],
                {
                  marginBottom: Dimensions.marginRegular,
                  color: ThemeStyle.textLight,
                })
              }>
              ** Details edited will be applied to new cohorts only
            </Text>
          )}
          {isEditable && !isTask ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: Dimensions.marginExtraLarge,
              }}>
              {this.renderType(sessionTypes.PHYSICAL_MEETING)}
              {this.renderType(sessionTypes.VIDEO)}
            </View>
          ) : (
            !isTask && (
              <InputField
                label={getSessionTypeDetails(session.type).name}
                renderInputComponent={() => {
                  return (
                    <Image
                      source={getSessionTypeDetails(session.type).image}
                      style={{
                        width: Dimensions.r32,
                        height: Dimensions.r32,
                        tintColor: getSessionTypeDetails(session.type)
                          .tintColor,
                      }}
                      resizeMode="contain"
                    />
                  );
                }}
              />
            )
          )}
          {!isTask && (
            <InputField
              label="Module"
              onPress={() => {
                if (!isEditable) {
                  return;
                }
                this.moduleInput.focus();
              }}
              renderInputComponent={() => (
                <CustomInput
                  ref={ref => {
                    this.moduleInput = ref;
                  }}
                  defaultValue={session.module}
                  placeholder={`Mindfulness`}
                  underlineColorAndroid="transparent"
                  style={[
                    TextStyles.GeneralTextBold,
                    {
                      color: ThemeStyle.mainColor,
                    },
                  ]}
                  onChangeText={text => {
                    session.module = text;
                    this.setState({
                      session,
                      isUpdated: true,
                    });
                    this.module = text;
                  }}
                  blurOnSubmit={false}
                  editable={isEditable}
                />
              )}
            />
          )}
          <InputField
            label={'Name'}
            onPress={() => {
              if (!isEditable) {
                return;
              }
              this.nameInput.focus();
            }}
            renderInputComponent={() => (
              <CustomInput
                ref={ref => {
                  this.nameInput = ref;
                }}
                defaultValue={session.name}
                placeholder={isTask ? 'Meditate' : `Eg. Week for Week 1`}
                underlineColorAndroid="transparent"
                style={[
                  TextStyles.GeneralTextBold,
                  {
                    color: ThemeStyle.mainColor,
                  },
                ]}
                onChangeText={text => {
                  session.name = text;
                  this.setState({
                    session,
                    isUpdated: true,
                  });
                }}
                blurOnSubmit={false}
                editable={isEditable}
              />
            )}
          />
          {!isCohortSession && (
            <InputField
              label="Day from Start"
              onPress={() => {
                if (!isEditable) {
                  return;
                }
                this.daysFromStartInput.focus();
              }}
              renderInputComponent={() => (
                <CustomInput
                  ref={ref => {
                    this.daysFromStartInput = ref;
                  }}
                  defaultValue={this.daysFromStart}
                  placeholder={`No of days`}
                  keyboardType="number-pad"
                  underlineColorAndroid="transparent"
                  style={[
                    TextStyles.GeneralTextBold,
                    {color: ThemeStyle.mainColor},
                  ]}
                  onChangeText={text => {
                    this.daysFromStart = text;
                    this.setState({isUpdated: true});
                  }}
                  blurOnSubmit={false}
                  editable={isEditable}
                />
              )}
            />
          )}
          <InputField
            label={isCohortSession ? 'Date' : 'Time'}
            onPress={() => {
              if (!isEditable) {
                return;
              }
              this.setState({isDatePickerVisible: true});
            }}
            renderInputComponent={() => (
              <Text
                style={[
                  TextStyles.GeneralTextBold,
                  {color: ThemeStyle.mainColor, textAlign: 'right'},
                ]}>
                {isCohortSession
                  ? `${moment(session.startDate).format(
                      'MMM DD, YYYY',
                    )}\n${moment(session.startDate).format('hh:mm A')}`
                  : `${moment(session.startDate).format('hh:mm A')}`}
              </Text>
            )}
          />

          {(!isNullOrEmpty(session.description) || isEditable) && (
            <TouchableOpacity
              style={{
                backgroundColor: ThemeStyle.foreground,
                borderRadius: Dimensions.r20,
                paddingVertical: Dimensions.r28,
                paddingHorizontal: Dimensions.r24,
                marginBottom: Dimensions.marginRegular,
              }}
              onPress={() => {
                if (!isEditable) {
                  return;
                }
                this.descriptionInput.focus();
              }}>
              <Text style={TextStyles.GeneralTextBold}>{`Description`}</Text>
              <CustomInput
                ref={ref => {
                  this.descriptionInput = ref;
                }}
                defaultValue={session.description}
                placeholder={
                  session.type === sessionTypes.TASK
                    ? `Meditate for 10 minutes`
                    : `(Optional)`
                }
                underlineColorAndroid="transparent"
                style={[
                  session.type === sessionTypes.TASK
                    ? TextStyles.SubHeader2
                    : TextStyles.GeneralTextBold,
                  {
                    color: ThemeStyle.mainColor,
                    marginTop: Dimensions.marginExtraSmall,
                  },
                ]}
                onChangeText={text => {
                  session.description = text;
                  this.setState({
                    session,
                    isUpdated: true,
                  });
                }}
                blurOnSubmit={false}
                editable={isEditable}
              />
            </TouchableOpacity>
          )}
          {this.renderVideoSessionButton()}
          {this.renderLearningMaterial()}
          {this.renderAppContentSection()}
        </ScrollView>
        {isUpdated && (
          <CustomButton
            name={isTask ? 'Update Task' : 'Update Session'}
            style={{
              position: 'absolute',
              bottom: Dimensions.screenMarginRegular,
              left: Dimensions.screenMarginWide,
              right: Dimensions.screenMarginWide,
            }}
            onPress={this.onUpdate}
          />
        )}
        <EditDurationModal
          ref={ref => {
            this.editDurationModal = ref;
          }}
          title={'Day from Start'}
          onDurationSelected={(durationInterval, durationPeriod) => {
            session.relativeStartDate = {
              interval: durationInterval,
              period: durationPeriod,
            };
            this.setState({
              session,
              isUpdated: true,
            });
          }}
        />
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode={isCohortSession ? 'datetime' : 'time'}
          date={new Date(session.startDate)}
          onConfirm={this.onSelectDate}
          minimumDate={
            isCohortSession
              ? moment().isAfter(moment(program.startDate))
                ? new Date()
                : new Date(program.startDate)
              : null
          }
          onCancel={() => {
            this.setState({isDatePickerVisible: false});
          }}
        />
        <ConfirmationModal
          ref={ref => {
            this.confirmationModal = ref;
          }}
        />
      </View>,
    );
  }
}

export default withStore(SessionDetailsScreen);
