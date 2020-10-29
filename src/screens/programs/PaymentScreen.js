import React from 'react';
import {View, Image, Text} from 'react-native';
import BaseComponent from '../../components/BaseComponent';
import ThemeStyle from '../../styles/ThemeStyle';
import Dimensions from '../../styles/Dimensions';
import TextStyles from '../../styles/TextStyles';
import {isNullOrEmpty, errorMessage} from '../../utils';
import {showMessage} from 'react-native-flash-message';
import InputField from '../../components/InputField';
import {appsyncClient} from '../../../App';
import {addSchedule} from '../../queries/session';
import {resetToProgramDetails} from '../../navigators/actions';
import AddPaymentModal from '../../modals/AddPaymentModal';
import CustomInput from '../../components/CustomInput';

export default class PaymentScreen extends BaseComponent {
  constructor(props) {
    super(props);
    this.state.program = props.program;
    this.state.schedule = props.navigation.getParam('schedule', {});
    this.state.isSessionPayment = props.navigation.getParam(
      'isSessionPayment',
      false,
    );
    this.state.amount = props.program.payment
      ? `${props.program.payment / 100}`
      : null;
  }

  addSessionSchedule = () => {
    const {schedule} = this.state;
    const {setLoading, navigation} = this.props;
    setLoading(true);
    appsyncClient
      .mutate({
        mutation: addSchedule,
        variables: {
          schedule,
        },
      })
      .then(data => {
        console.log('ADDED SCHEDULE', data);
        setLoading(false);
        if (data.data && data.data.addSchedule) {
          navigation.dispatch(
            resetToProgramDetails({
              id: schedule.programId,
            }),
          );
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
    const {onContinue} = this.props;
    const {program, amount, isSessionPayment, schedule} = this.state;
    if (!isNullOrEmpty(amount)) {
      if (isNaN(parseFloat(amount)) || !parseFloat(amount)) {
        return showMessage(errorMessage('Please enter a valid amount'));
      }
      if (Math.round(parseFloat(amount) * 100) < 1500) {
        return showMessage(errorMessage('Min amount should be $15'));
      }
      if (isSessionPayment) {
        schedule.payment = Math.round(parseFloat(amount) * 100);
        schedule.isFree = false;
      } else {
        program.payment = Math.round(parseFloat(amount) * 100);
        program.isFree = false;
      }
    } else {
      if (isSessionPayment) {
        schedule.payment = 0;
        schedule.isFree = true;
      } else {
        program.payment = 0;
        program.isFree = true;
      }
    }
    if (isSessionPayment) {
      console.log('ADDING SCHEDULE', schedule);
      this.addSessionSchedule();
    } else {
      onContinue(program);
    }
  };

  render() {
    const {navigation, user} = this.props;
    const {amount, program, isSessionPayment} = this.state;
    return this.renderWithSafeArea(
      <View style={ThemeStyle.pageContainer}>
        <View style={{padding: Dimensions.screenMarginRegular}}>
          <Text
            style={[
              TextStyles.ContentTextBold,
              {marginVertical: Dimensions.marginLarge},
            ]}>
            TOTAL AMOUNT PAYABLE
          </Text>
          <InputField
            label="FREE"
            onPress={() => {
              this.setState({
                amount: null,
              });
            }}
            renderInputComponent={() =>
              amount ? null : (
                <Image
                  source={require('../../assets/images/selected-icon.png')}
                />
              )
            }
          />
          <InputField
            label="Enter Amount($):"
            onPress={() => {
              if (user.payment) {
                this.amountInput && this.amountInput.focus();
              } else {
                this.addPaymentModal.show();
              }
            }}
            renderInputComponent={() =>
              user.payment ? (
                <CustomInput
                  ref={ref => {
                    this.amountInput = ref;
                  }}
                  defaultValue={amount || program.payment}
                  value={amount}
                  placeholder={`Min $15`}
                  keyboardType="numeric"
                  underlineColorAndroid="transparent"
                  style={[
                    TextStyles.GeneralTextBold,
                    {color: ThemeStyle.mainColor},
                  ]}
                  onChangeText={text => {
                    this.setState({
                      amount: text,
                    });
                  }}
                  blurOnSubmit={false}
                />
              ) : (
                <Text
                  style={[
                    TextStyles.GeneralTextBold,
                    {color: ThemeStyle.textExtraLight},
                  ]}>
                  Min $15
                </Text>
              )
            }
          />
          <Text style={[TextStyles.ContentText]}>
            {isSessionPayment
              ? 'This is the amount the client will pay if they are want to join just this module instead of the whole program'
              : 'This is the price your clients will pay for this program'}
          </Text>
        </View>
        <AddPaymentModal
          ref={ref => {
            this.addPaymentModal = ref;
          }}
          navigation={navigation}
        />
      </View>,
    );
  }
}
