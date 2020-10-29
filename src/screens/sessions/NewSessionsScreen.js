import React from 'react';
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import BaseComponent from '../../components/BaseComponent';
import ThemeStyle from '../../styles/ThemeStyle';
import Header from '../../components/Header';
import Dimensions from '../../styles/Dimensions';
import TextStyles from '../../styles/TextStyles';
import CustomButton from '../../components/Button';
import LinearGradient from 'react-native-linear-gradient';
import {
  sessionTypes,
  sessionRepeatTypes,
  uploadTypes,
  s3ProtectionLevel,
} from '../../constants';
import {updateProgramDetails} from '../../redux/actions/CreateProgramActions';
import {withStore} from '../../utils/StoreUtils';
import {
  isNullOrEmpty,
  errorMessage,
  getSessionTypeDetails,
  generateFilePath,
} from '../../utils';
import {showMessage} from 'react-native-flash-message';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import InputField from '../../components/InputField';
import CustomInput from '../../components/CustomInput';
import {appsyncClient} from '../../../App';
import {
  addProgramSchedule,
  addProgramTaskSchedule,
} from '../../queries/session';
import EditSessionRepeatModal from '../../modals/EditSessionRepeatModal';
import EditDurationModal from '../../modals/EditDurationModal';
import {addCohortSchedule, addCohortTaskSchedule} from '../../queries/cohort';
import AddScheduleToProgramModal from '../../modals/AddScheduleToProgramModal';
import {Storage} from 'aws-amplify';
import S3Image from '../../components/S3Image';

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: ThemeStyle.foreground,
    borderRadius: Dimensions.r20,
    paddingVertical: Dimensions.r28,
    paddingHorizontal: Dimensions.r24,
    marginBottom: Dimensions.marginRegular,
  },
});

class NewSessionsScreen extends BaseComponent {
  constructor(props) {
    super(props);
    this.state.isTask = props.navigation.getParam('isTask', false);
    this.state.program = props.navigation.getParam('program', {});
    this.state.isCohortSchedule = props.navigation.getParam(
      'isCohortSchedule',
      false,
    );
    this.state.schedule = {
      session: {
        startDate: this.state.isCohortSchedule
          ? this.state.program.startDate
          : moment().toISOString(),
      },
    };
    if (!this.state.isTask) {
      this.state.schedule.session.type = sessionTypes.VIDEO;
    }
    if (!this.state.isCohortSchedule) {
      this.state.schedule.session.relativeStartDate = {};
    }
  }

  onSelectDate = date => {
    const {schedule} = this.state;
    schedule.session.startDate = date.toISOString();
    this.setState({schedule, isDatePickerVisible: false});
  };

  pickImage = () => {
    const {schedule} = this.state;
    this.props.setLoading(true);
    const options = {
      title: 'Select Program Image',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    ImagePicker.showImagePicker(options, async response => {
      if (!response.didCancel && response.data) {
        console.log('RESPONSE', response.fileName, response.type);
        this.props.setLoading(true);
        let fileName = response.fileName;
        if (!fileName) {
          var getFilename = response.uri.split('/');
          fileName = getFilename[getFilename.length - 1];
        }
        const filePath = generateFilePath(this.props.user, uploadTypes.IMAGE);
        console.log('AWS UPLOAD', filePath, fileName);
        const data = await Storage.put(
          `${filePath}/${fileName}`,
          new Buffer(response.data, 'base64'),
          {
            contentType: 'image/png',
            level: s3ProtectionLevel.PUBLIC,
          },
        );
        schedule.session.image = `${filePath}/${fileName}`;
        this.setState({schedule});
        this.props.setLoading(false);
      } else {
        this.props.setLoading(false);
        showMessage(errorMessage('Please select an image'));
      }
    });
  };

  addSessionSchedule = (schedule, addToProgram = false) => {
    const {isCohortSchedule, isTask, program} = this.state;
    const {setLoading, navigation} = this.props;
    setLoading(true);
    let mutation;
    let key;
    const refetchQueries = ['getProgramWithSchedules'];
    const variables = {schedule};
    if (isCohortSchedule) {
      key = isTask ? 'addCohortTaskSchedule' : 'addCohortSchedule';
      mutation = isTask ? addCohortTaskSchedule : addCohortSchedule;
      variables.cohortId = program.id;
      variables.addToProgram = addToProgram;
      refetchQueries.push('getCohort');
    } else {
      key = isTask ? 'addProgramTaskSchedule' : 'addProgramSchedule';
      mutation = isTask ? addProgramTaskSchedule : addProgramSchedule;
      variables.programId = program.id;
    }
    console.log('ADDING SESSION SCHEDULE', variables, key);
    appsyncClient
      .mutate({
        mutation,
        variables,
        refetchQueries,
      })
      .then(data => {
        console.log('ADDED SCHEDULE', data);
        setLoading(false);
        if (data.data && data.data[key]) {
          navigation.pop();
        }
      })
      .catch(err => {
        console.log('ERROR IN ADDING SCHEDULE', err);
        setLoading(false);
        showMessage(
          errorMessage('Failed to add session schedule. Please try again'),
        );
      });
  };

  onContinue = () => {
    const {schedule, isTask, isCohortSchedule} = this.state;
    if (!isTask && isNullOrEmpty(this.module)) {
      return showMessage(errorMessage('Please enter valid module name'));
    }
    if (isNullOrEmpty(this.sessionName)) {
      return showMessage(errorMessage('Please enter valid session name'));
    }
    if (!schedule.session.startDate) {
      return showMessage(errorMessage('Please enter session time'));
    }
    if (!isCohortSchedule) {
      if (
        !this.daysFromStart ||
        isNaN(parseInt(this.daysFromStart)) ||
        parseInt(this.daysFromStart) < 1
      ) {
        return showMessage(
          errorMessage('Day from start should be greater than zero'),
        );
      } else {
        schedule.session.relativeStartDate = {
          interval: parseInt(this.daysFromStart),
          period: 'DAYS',
        };
      }
    }
    if (!schedule.repeat) {
      return showMessage(
        errorMessage('Please select a repeat type for sessions'),
      );
    } else if (schedule.repeat === sessionRepeatTypes.NONE) {
      this.numberOfSessions = '1';
    }
    if (!this.numberOfSessions || isNaN(parseInt(this.numberOfSessions))) {
      return showMessage(errorMessage('Please enter valid number of sessions'));
    }
    if (isTask) {
      if (isNullOrEmpty(this.description)) {
        return showMessage(errorMessage('Please enter a task description'));
      }
    }
    schedule.numberOfSessions = parseInt(this.numberOfSessions);
    schedule.session.name = this.sessionName;
    if (!isTask) {
      schedule.session.module = this.module;
    }
    schedule.session.description = this.description;
    if (isCohortSchedule) {
      this.addToProgramModal.show({
        title: isTask ? 'Add Task' : 'Add Session',
        onContinue: addToProgram => {
          this.addSessionSchedule(schedule, addToProgram);
        },
      });
    } else {
      this.addSessionSchedule(schedule);
    }
  };

  renderType = type => {
    const {schedule} = this.state;
    const typeDetails = getSessionTypeDetails(type);
    return (
      <TouchableOpacity
        onPress={() => {
          schedule.session.type = type;
          this.setState({
            schedule,
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
            schedule.session.type === type
              ? ThemeStyle.gradientColor
              : ['#fff', '#fff']
          }>
          <Image
            source={typeDetails.image}
            style={{
              height: Dimensions.r48,
              tintColor:
                schedule.session.type === type
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
                  schedule.session.type === type
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
      schedule,
      isDatePickerVisible,
      isCohortSchedule,
      isTask,
      program,
    } = this.state;
    return this.renderWithSafeArea(
      <View style={ThemeStyle.pageContainer}>
        <Header
          title={isTask ? 'Add Task' : 'Add Session'}
          goBack={() => navigation.pop()}
        />
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: Dimensions.screenMarginRegular,
            paddingBottom: Dimensions.r72,
          }}>
          {!isTask && (
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
          )}
          {!isTask && (
            <InputField
              label="Module"
              onPress={() => {
                this.moduleInput.focus();
              }}
              renderInputComponent={() => (
                <CustomInput
                  ref={ref => {
                    this.moduleInput = ref;
                  }}
                  defaultValue={this.module}
                  placeholder={`Mindfulness`}
                  underlineColorAndroid="transparent"
                  style={[
                    TextStyles.GeneralTextBold,
                    {
                      color: ThemeStyle.mainColor,
                    },
                  ]}
                  onChangeText={text => {
                    this.module = text;
                  }}
                  blurOnSubmit={false}
                />
              )}
            />
          )}
          {!isTask && (
            <InputField
              label="Module Image"
              onPress={this.pickImage}
              renderInputComponent={() =>
                schedule.session.image ? (
                  <S3Image
                    key={schedule.session.image}
                    filePath={schedule.session.image}
                    level={s3ProtectionLevel.PUBLIC}
                    style={{
                      width: Dimensions.r48,
                      height: Dimensions.r48,
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <Image source={require('../../assets/images/Add-icon.png')} />
                )
              }
            />
          )}
          <InputField
            label={isTask ? 'Name' : 'Name Prefix'}
            onPress={() => {
              this.nameInput.focus();
            }}
            renderInputComponent={() => (
              <CustomInput
                ref={ref => {
                  this.nameInput = ref;
                }}
                defaultValue={this.sessionName}
                placeholder={isTask ? 'Eg. Meditate' : `Eg. Week for Week 1`}
                underlineColorAndroid="transparent"
                style={[
                  TextStyles.GeneralTextBold,
                  {
                    color: ThemeStyle.mainColor,
                  },
                ]}
                onChangeText={text => {
                  this.sessionName = text;
                }}
                blurOnSubmit={false}
              />
            )}
          />
          <InputField
            onPress={() => {
              this.sessionRepeatModal.show({
                repeat: schedule.repeat,
              });
            }}
            label="Repeats"
            renderInputComponent={() => (
              <Text
                style={[
                  TextStyles.GeneralTextBold,
                  {color: ThemeStyle.mainColor},
                ]}>
                {schedule.repeat || 'Please select..'}
              </Text>
            )}
          />
          {!isCohortSchedule && (
            <InputField
              label="Day from Start"
              onPress={() => {
                this.daysFromStartInput.focus();
              }}
              renderInputComponent={() => (
                <CustomInput
                  ref={ref => {
                    this.daysFromStartInput = ref;
                  }}
                  defaultValue={schedule.session.relativeStartDate.interval}
                  placeholder={`No of days`}
                  keyboardType="number-pad"
                  underlineColorAndroid="transparent"
                  style={[
                    TextStyles.GeneralTextBold,
                    {color: ThemeStyle.mainColor},
                  ]}
                  onChangeText={text => {
                    this.daysFromStart = text;
                  }}
                  blurOnSubmit={false}
                />
              )}
            />
          )}
          <InputField
            label={isCohortSchedule ? 'Start Date and Time' : 'Time'}
            onPress={() => {
              this.setState({isDatePickerVisible: true});
            }}
            renderInputComponent={() => (
              <Text
                style={[
                  TextStyles.GeneralTextBold,
                  {color: ThemeStyle.mainColor, textAlign: 'right'},
                ]}>
                {isCohortSchedule
                  ? `${moment(schedule.session.startDate).format(
                      'MMM DD, YYYY',
                    )}\n${moment(schedule.session.startDate).format('hh:mm A')}`
                  : `${moment(schedule.session.startDate).format('hh:mm A')}`}
              </Text>
            )}
          />
          {schedule.repeat !== sessionRepeatTypes.NONE && (
            <InputField
              label={isTask ? 'Number of occurrences' : `Number of Sessions`}
              style={styles.itemContainer}
              onPress={() => {
                this.sizeInput.focus();
              }}
              renderInputComponent={() => (
                <CustomInput
                  ref={ref => {
                    this.sizeInput = ref;
                  }}
                  defaultValue={this.numberOfSessions}
                  placeholder={`30`}
                  keyboardType="number-pad"
                  underlineColorAndroid="transparent"
                  style={[
                    TextStyles.GeneralTextBold,
                    {color: ThemeStyle.mainColor},
                  ]}
                  onChangeText={text => {
                    this.numberOfSessions = text;
                  }}
                  blurOnSubmit={false}
                />
              )}
            />
          )}
          <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => {
              this.descriptionInput.focus();
            }}>
            <Text style={TextStyles.GeneralTextBold}>{`Description`}</Text>
            <CustomInput
              ref={ref => {
                this.descriptionInput = ref;
              }}
              defaultValue={this.description}
              placeholder={isTask ? `Meditate for 10 minutes` : `(Optional)`}
              underlineColorAndroid="transparent"
              style={[
                TextStyles.GeneralText,
                {
                  //color: ThemeStyle.mainColor,
                  marginTop: Dimensions.marginSmall,
                },
              ]}
              onChangeText={text => {
                this.description = text;
              }}
              blurOnSubmit={false}
            />
          </TouchableOpacity>
        </ScrollView>
        <CustomButton
          name={`Continue`}
          style={{
            position: 'absolute',
            bottom: Dimensions.screenMarginRegular,
            left: Dimensions.screenMarginRegular,
            right: Dimensions.screenMarginRegular,
          }}
          onPress={this.onContinue}
        />
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode={isCohortSchedule ? 'datetime' : 'time'}
          date={new Date(schedule.session.startDate)}
          onConfirm={this.onSelectDate}
          minimumDate={
            isCohortSchedule
              ? moment().isAfter(moment(program.startDate))
                ? new Date()
                : new Date(program.startDate)
              : null
          }
          onCancel={() => {
            this.setState({isDatePickerVisible: false});
          }}
        />
        <EditSessionRepeatModal
          ref={ref => {
            this.sessionRepeatModal = ref;
          }}
          onRepeatSelected={value => {
            schedule.repeat = value;
            this.setState({
              schedule,
            });
          }}
        />
        <EditDurationModal
          ref={ref => {
            this.editDurationModal = ref;
          }}
          title={'Day from Start'}
          onDurationSelected={(durationInterval, durationPeriod) => {
            schedule.session.relativeStartDate = {
              interval: durationInterval,
              period: durationPeriod,
            };
            this.setState({
              schedule,
            });
          }}
        />
        <AddScheduleToProgramModal
          ref={ref => {
            this.addToProgramModal = ref;
          }}
        />
      </View>,
    );
  }
}

const mapStateToProps = state => ({
  program: state.createProgram.program,
});

const mapDispatchToProps = dispatch => ({
  updateProgramDetails: program => dispatch(updateProgramDetails(program)),
});

export default withStore(
  NewSessionsScreen,
  mapStateToProps,
  mapDispatchToProps,
);
