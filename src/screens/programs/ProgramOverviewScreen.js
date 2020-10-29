import React from 'react';
import {View, Image, TouchableOpacity, Text, StyleSheet} from 'react-native';
import BaseComponent from '../../components/BaseComponent';
import ThemeStyle from '../../styles/ThemeStyle';
import Dimensions from '../../styles/Dimensions';
import TextStyles from '../../styles/TextStyles';
import LinearGradient from 'react-native-linear-gradient';
import {
  programTypes,
  uploadTypes,
  appTypes,
  programStatus,
} from '../../constants';
import {
  errorMessage,
  getLibraryItemsPath,
  getFileDetailsFromUrl,
  getDisplayPrice,
  isNullOrEmpty,
} from '../../utils';
import {showMessage} from 'react-native-flash-message';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import EditProgramTagsModal from '../../modals/EditProgramTagsModal';
import CustomInput from '../../components/CustomInput';
import EditDurationModal from '../../modals/EditDurationModal';
import EditAppModal from '../../modals/EditAppModal';

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: ThemeStyle.foreground,
    borderRadius: Dimensions.r20,
    paddingVertical: Dimensions.r28,
    paddingHorizontal: Dimensions.r24,
    marginBottom: Dimensions.marginRegular,
    alignItems: 'center',
  },
  itemContainerColumn: {
    backgroundColor: ThemeStyle.foreground,
    borderRadius: Dimensions.r20,
    paddingVertical: Dimensions.r28,
    paddingHorizontal: Dimensions.r24,
    marginBottom: Dimensions.marginRegular,
  },
});

export default class ProgramOverviewScreen extends BaseComponent {
  constructor(props) {
    super(props);
    this.state.program = {
      // startDate: moment().toISOString(),
      type: programTypes.INDIVIDUAL,
      duration: {},
      ...props.program,
    };
    this.appIcons = {
      ACT: require('../../assets/images/ACT-coach-logo.png'),
      CBT: require('../../assets/images/CBT-companion-logo.png'),
      DBT: require('../../assets/images/DBT-coach-logo.png'),
    };
    if (props.program) {
      this.sessionSize = props.program.programSize
        ? `${props.program.programSize}`
        : '1';
      this.programName = props.program.name;
      this.programDescription = props.program.description;
    }
    this.state.isEditAfterPublish = this.isEditAfterPublish();
  }

  isEditAfterPublish = () => {
    const {isCohort, editable} = this.props;
    const {program} = this.state;
    return editable && (isCohort || program.status === programStatus.PUBLISHED);
  };

  onSelectDate = date => {
    const {program} = this.state;
    program.startDate = date.toISOString();
    this.setState({program, isDatePickerVisible: false});
  };

  onContinue = () => {
    const {onContinue, editable} = this.props;
    const {program} = this.state;
    if (isNullOrEmpty(this.programName)) {
      return showMessage(errorMessage('Please enter a program name'));
    }
    if (
      program.type === programTypes.GROUP &&
      (!this.sessionSize ||
        isNaN(parseInt(this.sessionSize)) ||
        parseInt(this.sessionSize) < 2)
    ) {
      return showMessage(
        errorMessage('Please enter valid number of clients for session size'),
      );
    }
    // if (!program.startDate) {
    //   return showMessage(errorMessage('Please enter program start date'));
    // }
    if (!program.duration.interval) {
      return showMessage(
        errorMessage('Please enter valid interval for duration'),
      );
    }
    if (!program.duration.period) {
      return showMessage(
        errorMessage('Please enter valid period for duration'),
      );
    }
    program.programSize = parseInt(this.sessionSize);
    program.name = this.programName;
    program.description = this.programDescription;
    onContinue(program);
  };

  renderChips = (list, isEdit, type) => {
    const Component = isEdit ? TouchableOpacity : View;
    let elementsList = [];
    list.map(data => {
      elementsList.push(
        <Component
          key={data}
          style={{
            paddingHorizontal: 15,
            borderWidth: 1,
            marginBottom: 12,
            borderRadius: 25,
            paddingVertical: 7,
            marginRight: Dimensions.r8,
            borderColor: ThemeStyle.mainColor,
            backgroundColor: ThemeStyle.foreground,
          }}
          onPress={() => {
            list.splice(list.indexOf(data), 1);
          }}>
          <Text
            style={[TextStyles.GeneralText, {color: ThemeStyle.mainColor}]}
            numberOfLines={1}>
            {type === 'docs' ? getFileDetailsFromUrl(data).fileName : data}
          </Text>
        </Component>,
      );
    });
    return (
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          marginTop: Dimensions.marginSmall,
        }}>
        {elementsList}
      </View>
    );
  };

  render() {
    const {
      navigation,
      isFullView,
      editable,
      onEditPayment,
      isCohort,
    } = this.props;
    const {program, isDatePickerVisible, isEditAfterPublish} = this.state;
    return (
      <View style={ThemeStyle.pageContainer}>
        <View
          style={{
            paddingHorizontal: Dimensions.screenMarginRegular,
            paddingVertical: Dimensions.screenMarginRegular,
            overflow: 'hidden',
          }}
          contentContainerStyle={{paddingBottom: Dimensions.r96}}>
          {!isFullView && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: Dimensions.marginExtraLarge,
              }}>
              <TouchableOpacity
                onPress={() => {
                  this.sessionSize = null;
                  program.type = programTypes.GROUP;
                  this.setState({
                    program,
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
                    program.type === programTypes.GROUP
                      ? ThemeStyle.gradientColor
                      : ['#fff', '#fff']
                  }>
                  <Image
                    source={require('../../assets/images/Group-icon.png')}
                    style={{height: Dimensions.r48}}
                    resizeMode="contain"
                  />
                  <Text
                    style={[
                      TextStyles.GeneralTextBold,
                      {
                        color:
                          program.type === programTypes.GROUP
                            ? ThemeStyle.white
                            : ThemeStyle.textRegular,
                        marginTop: Dimensions.marginSmall,
                      },
                    ]}>
                    Group
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  program.type = programTypes.INDIVIDUAL;
                  this.sessionSize = '1';
                  this.setState({
                    program,
                  });
                }}
                style={{
                  flex: 1,
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
                    program.type === programTypes.INDIVIDUAL
                      ? ThemeStyle.gradientColor
                      : ['#fff', '#fff']
                  }>
                  <Image
                    source={require('../../assets/images/individual-icon.png')}
                    style={{height: Dimensions.r48}}
                    resizeMode="contain"
                  />
                  <Text
                    style={[
                      TextStyles.GeneralTextBold,
                      {
                        color:
                          program.type === programTypes.INDIVIDUAL
                            ? ThemeStyle.white
                            : ThemeStyle.textRegular,
                        marginTop: Dimensions.marginSmall,
                      },
                    ]}>
                    Individual
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
          {isFullView && (
            <View style={{paddingVertical: Dimensions.marginRegular}}>
              <CustomInput
                defaultValue={program.name}
                style={[TextStyles.HeaderBold]}
                editable={editable}
                onChangeText={text => {
                  this.programName = text;
                }}
              />
              <CustomInput
                defaultValue={program.description}
                style={[
                  TextStyles.GeneralText,
                  {marginVertical: Dimensions.marginRegular},
                ]}
                multiline={true}
                editable={editable}
                onChangeText={text => {
                  this.programDescription = text;
                }}
                maxLength={300}
              />
            </View>
          )}
          {(program.type === programTypes.GROUP || isFullView) &&
            !isEditAfterPublish && (
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => {
                  if (!editable) {
                    return;
                  }
                  this.sizeInput.focus();
                }}>
                <Text
                  style={
                    TextStyles.GeneralTextBold
                  }>{`Session Size (Clients)`}</Text>
                <CustomInput
                  ref={ref => {
                    this.sizeInput = ref;
                  }}
                  defaultValue={this.sessionSize}
                  placeholder={`No of clients`}
                  keyboardType="number-pad"
                  underlineColorAndroid="transparent"
                  style={[
                    TextStyles.GeneralTextBold,
                    {color: ThemeStyle.mainColor},
                  ]}
                  onChangeText={text => {
                    this.sessionSize = text;
                  }}
                  blurOnSubmit={false}
                  editable={editable}
                />
              </TouchableOpacity>
            )}
          {/* <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => {
              if (!editable) {
                return;
              }
              this.setState({isDatePickerVisible: true});
            }}>
            <Text style={TextStyles.GeneralTextBold}>{`Start Date`}</Text>
            <Text
              style={[
                TextStyles.GeneralTextBold,
                {color: ThemeStyle.mainColor},
              ]}>
              {moment(program.startDate).format('MMM DD, YYYY')}
            </Text>
          </TouchableOpacity> */}
          {!isEditAfterPublish && (
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() => {
                if (!editable) {
                  return;
                }
                this.editDurationModal.show({
                  durationInterval: program.duration.interval,
                  durationPeriod: program.duration.period,
                });
              }}>
              <Text style={TextStyles.GeneralTextBold}>{`Duration`}</Text>
              <Text
                style={[
                  TextStyles.GeneralTextBold,
                  {color: ThemeStyle.mainColor},
                ]}>
                {program.duration.interval && program.duration.period
                  ? `${program.duration.interval} ${program.duration.period}`
                  : 'Please select...'}
              </Text>
            </TouchableOpacity>
          )}
          {!isCohort && (
            <TouchableOpacity
              style={
                program.documents && program.documents.length
                  ? styles.itemContainerColumn
                  : styles.itemContainer
              }
              onPress={() => {
                if (!editable) {
                  return;
                }
                navigation.navigate('UploadDocument', {
                  onSelect: libraryItems => {
                    console.log('ON SELECT', libraryItems);
                    program.documents = [];
                    const libraryPaths = getLibraryItemsPath(libraryItems);
                    program.documents.push(...libraryPaths[uploadTypes.IMAGE]);
                    program.documents.push(...libraryPaths[uploadTypes.PDF]);
                    program.documents.push(...libraryPaths[uploadTypes.LINK]);
                    console.log('UPDATED PROGRAM', program);
                    this.setState({program});
                  },
                });
              }}>
              <Text
                style={
                  TextStyles.GeneralTextBold
                }>{`Additional Documents`}</Text>
              {program.documents && program.documents.length ? (
                this.renderChips(program.documents, false, 'docs')
              ) : (
                <Image source={require('../../assets/images/Add-icon.png')} />
              )}
            </TouchableOpacity>
          )}
          {isFullView && !isEditAfterPublish && (
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() => {
                if (!editable) {
                  return;
                }
                if (onEditPayment) {
                  onEditPayment();
                }
              }}>
              <Text style={TextStyles.GeneralTextBold}>{`Payment`}</Text>
              <Text
                style={[
                  TextStyles.GeneralTextBold,
                  {color: ThemeStyle.mainColor},
                ]}>
                {getDisplayPrice(program.payment)}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={
              program.tags && program.tags.length
                ? styles.itemContainerColumn
                : styles.itemContainer
            }
            onPress={() => {
              if (!editable) {
                return;
              }
              if (this.editTagsModal) {
                this.editTagsModal.show({tags: program.tags});
              }
            }}>
            <Text style={TextStyles.GeneralTextBold}>{`Tags`}</Text>
            {program.tags && program.tags.length ? (
              this.renderChips(program.tags, false, '')
            ) : (
              <Image source={require('../../assets/images/Add-icon.png')} />
            )}
          </TouchableOpacity>
          {!isEditAfterPublish && (
            <View>
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => {
                  if (!editable) {
                    return;
                  }
                  this.editAppModal.show({
                    selectedApp: program.app,
                  });
                }}>
                <Text style={TextStyles.GeneralTextBold}>{`App to use`}</Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Image
                    source={this.appIcons[program.app]}
                    style={{
                      width: Dimensions.r32,
                      height: Dimensions.r32,
                      marginRight: Dimensions.marginRegular,
                      marginVertical: Dimensions.marginSmall,
                    }}
                    resizeMode="contain"
                  />
                  <Text
                    style={[
                      TextStyles.GeneralTextBold,
                      {color: ThemeStyle.mainColor},
                    ]}>
                    {(appTypes[program.app] && appTypes[program.app].name) ||
                      (editable ? 'Please select..' : 'Not Selected')}
                  </Text>
                </View>
              </TouchableOpacity>
              <Text
                style={[
                  TextStyles.ContentTextBold,
                  {color: ThemeStyle.textLight},
                ]}>
                ** App content (added in App to use) can only be added in paid programs
              </Text>
            </View>
          )}
        </View>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={this.onSelectDate}
          minimumDate={new Date()}
          onCancel={() => {
            this.setState({isDatePickerVisible: false});
          }}
        />
        <EditProgramTagsModal
          ref={ref => {
            this.editTagsModal = ref;
          }}
          isEdit
          onTagsUpdated={tags => {
            program.tags = tags;
            this.setState(program);
          }}
        />
        <EditDurationModal
          ref={ref => {
            this.editDurationModal = ref;
          }}
          onDurationSelected={(durationInterval, durationPeriod) => {
            program.duration = {
              interval: durationInterval,
              period: durationPeriod,
            };
            this.setState({
              program,
            });
          }}
        />
        <EditAppModal
          ref={ref => {
            this.editAppModal = ref;
          }}
          onAppSelected={app => {
            program.app = app;
            this.setState({program});
          }}
        />
      </View>
    );
  }
}
