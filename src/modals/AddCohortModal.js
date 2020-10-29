import React, {Component} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  Platform,
  Image,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import textStyles from '../styles/TextStyles';
import ThemeStyle from '../styles/ThemeStyle';
import CustomButton from '../components/Button';
import {isNullOrEmpty, errorMessage} from '../utils';
import {showMessage} from 'react-native-flash-message';
import TextStyles from '../styles/TextStyles';
import Dimensions from '../styles/Dimensions';
import InputField from '../components/InputField';
import moment from 'moment';
import {appsyncClient} from '../../App';
import {addCohort} from '../queries/cohort';

export default class AddCohortModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      keyboardHeight: 0,
    };
  }

  componentWillMount() {
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this.onKeyboardDidShow,
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this.onKeyboardDidHide,
    );
  }

  onKeyboardDidShow = e => {
    this.setState({
      keyboardHeight: Platform.OS === 'ios' ? e.endCoordinates.height : 0,
    });
  };

  onKeyboardDidHide = () => {
    this.setState({
      keyboardHeight: 0,
    });
  };

  componentWillUnmount() {
    this.keyboardDidShowListener && this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener && this.keyboardDidHideListener.remove();
  }

  show = options => {
    this.setState({
      visible: true,
      isPublish: options.isPublish,
      selectedDate: moment().toISOString(),
    });
  };

  hide = () => {
    this.setState({
      visible: false,
      isPublish: false,
      selectedDate: null,
    });
  };

  onSelectDate = date => {
    this.setState({
      selectedDate: date.toISOString(),
      isDatePickerVisible: false,
    });
  };

  onConfirm = () => {
    const {selectedDate, isPublish} = this.state;
    const {setLoading, program} = this.props;
    setLoading(true);
    appsyncClient
      .mutate({
        mutation: addCohort,
        variables: {
          programId: program.id,
          startDate: selectedDate,
        },
        refetchQueries: ['getProgramWithSchedules'],
      })
      .then(data => {
        console.log('ADDED COHORT', data);
        setLoading(false);
        if (data.data && data.data.addCohort) {
          showMessage(
            isPublish
              ? 'Successfully published program'
              : 'Successfully added cohort',
          );
          this.hide();
        }
      })
      .catch(err => {
        console.log('ERROR IN ADDING COHORT', err);
        setLoading(false);
        showMessage(errorMessage('Failed to add cohort. Please try again'));
      });
    this.hide();
  };

  render() {
    const {
      keyboardHeight,
      isPublish,
      isDatePickerVisible,
      selectedDate,
    } = this.state;
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.visible}
        onRequestClose={() => {
          this.setState({
            visible: false,
          });
          // this.props.onBack && this.props.onBack();
        }}>
        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.42)'}}>
          <View
            style={{
              flex: 1,
              position: 'absolute',
              bottom: keyboardHeight,
              left: 0,
              right: 0,
            }}>
            <View
              style={{
                backgroundColor: ThemeStyle.foreground,
                shadowColor: 'grey',
                shadowOffset: {width: 15, height: 5},
                shadowOpacity: 0.5,
                shadowRadius: 10,
                paddingVertical: 24,
                paddingHorizontal: Dimensions.screenMarginRegular,
                borderTopLeftRadius: Dimensions.r24,
                borderTopRightRadius: Dimensions.r24,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: Dimensions.marginLarge,
                  justifyContent: 'space-between',
                }}>
                <Text style={[textStyles.SubHeaderBold]}>
                  {isPublish ? 'Publish Program' : 'Add Cohort'}
                </Text>
                <TouchableOpacity onPress={this.hide}>
                  <Image source={require('../assets/images/cross-icon.png')} />
                </TouchableOpacity>
              </View>
              <Text style={TextStyles.GeneralTextBold}>
                {isPublish
                  ? 'Publishing a program will create a cohort with the selected start date'
                  : 'Adding a cohort will publish the program'}
              </Text>
              <InputField
                style={{
                  backgroundColor: ThemeStyle.divider,
                  marginTop: Dimensions.marginLarge,
                }}
                label="Start Date"
                onPress={() => {
                  this.setState({isDatePickerVisible: true});
                }}
                renderInputComponent={() => (
                  <Text
                    style={[
                      TextStyles.GeneralTextBold,
                      {color: ThemeStyle.mainColor, textAlign: 'right'},
                    ]}>
                    {`${moment(selectedDate).format('MMM DD, YYYY')}`}
                  </Text>
                )}
              />
              <CustomButton
                onPress={this.onConfirm}
                name="Confirm"
                style={{marginTop: Dimensions.marginLarge}}
              />
            </View>
          </View>
        </View>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode={'date'}
          date={new Date(selectedDate)}
          onConfirm={this.onSelectDate}
          minimumDate={new Date()}
          onCancel={() => {
            this.setState({isDatePickerVisible: false});
          }}
        />
      </Modal>
    );
  }
}
