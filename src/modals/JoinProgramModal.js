import React from 'react';
import {Modal, Image, Linking, Keyboard, Platform} from 'react-native';
import {View, Text} from 'react-native-animatable';
import Dimensions from '../styles/Dimensions';
import TextStyles from '../styles/TextStyles';
import CustomButton from '../components/Button';
import ThemeStyle from '../styles/ThemeStyle';
import {
  getDisplayPrice,
  getProgramDisplayDuration,
  getProgramDisplayType,
  errorMessage,
} from '../utils';
import S3Image from '../components/S3Image';
import {s3ProtectionLevel, APP} from '../constants';
import {LiteCreditCardInput} from 'react-native-credit-card-input';
import FlashMessage, {showMessage} from 'react-native-flash-message';
import stripe from '../utils/Stripe';

export default class JoinProgramModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      program: {},
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

  getCurrentPrice = () => {
    const {program} = this.state;
    let price = {payment: program.payment, isFree: program.isFree};
    return price;
  };

  showMessage = message => {
    this.flashMessage && this.flashMessage.showMessage(errorMessage(message));
  };

  isValidField = field => {
    return field === 'valid';
  };

  generateStripeToken = async () => {
    if (this.cardInput) {
      const {status, values} = this.cardInput;
      if (!this.isValidField(status.number)) {
        this.showMessage('Please enter a valid card number');
        return null;
      }
      if (!this.isValidField(status.expiry)) {
        this.showMessage('Your card expiry date is invalid');
        return null;
      }
      if (!this.isValidField(status.cvc)) {
        this.showMessage('Your card CVC number is invalid');
        return null;
      }
      if (this.cardInput.valid) {
        const stripeCard = {
          number: values.number,
          cvc: values.cvc,
          expMonth: parseInt(values.expiry.split('/')[0]),
          expYear: parseInt(values.expiry.split('/')[1]),
        };
        console.log('stripeCard', stripeCard);
        try {
          const token = await stripe.createTokenWithCard(stripeCard);
          console.log('TOKEN', token);
          return token.tokenId;
        } catch (err) {
          console.log(err);
          return null;
        }
      } else {
        this.showMessage('Please enter valid card details');
      }
    } else {
      this.showMessage('Please enter your card details');
    }
  };

  show = (program, cohort) => {
    this.setState({
      visible: true,
      program,
      cohort,
    });
  };

  hide = () => {
    this.setState({visible: false, program: null, cohort: null});
  };

  render() {
    const {program, cohort, visible, keyboardHeight} = this.state;
    const {onJoin} = this.props;
    if (!visible) {
      return null;
    }
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.visible}
        onRequestClose={() => {}}>
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
                backgroundColor: '#fff',
                shadowColor: 'grey',
                shadowOffset: {width: 15, height: 5},
                shadowOpacity: 0.5,
                shadowRadius: 10,
                borderRadius: Dimensions.r24,
                padding: Dimensions.marginExtraLarge,
                margin: Dimensions.marginRegular,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                }}>
                <View
                  style={{
                    backgroundColor: ThemeStyle.red,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: Dimensions.r32,
                    width: Dimensions.r64,
                    height: Dimensions.r64,
                    overflow: 'hidden',
                  }}>
                  {program.image ? (
                    <S3Image
                      filePath={program.image}
                      level={s3ProtectionLevel.PUBLIC}
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: ThemeStyle.disabledLight,
                      }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text
                      style={[
                        TextStyles.GeneralTextBold,
                        {color: ThemeStyle.white},
                      ]}>
                      {program.name.substring(0, 2).toUpperCase()}
                    </Text>
                  )}
                </View>
                <View
                  style={{
                    marginLeft: Dimensions.marginRegular,
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={[
                      TextStyles.HeaderBold,
                      {color: ThemeStyle.mainColor},
                    ]}>
                    {program.name}
                  </Text>
                  <Text
                    style={[
                      TextStyles.GeneralTextBold,
                      {
                        color: ThemeStyle.textExtraLight,
                        marginBottom: Dimensions.marginRegular,
                      },
                    ]}>{`${getProgramDisplayType(
                    program.type,
                  )}, ${getProgramDisplayDuration(program.duration)}`}</Text>
                  {cohort && (
                    <Text
                      style={[
                        TextStyles.GeneralText,
                        {
                          color: ThemeStyle.red,
                          borderRadius: Dimensions.r14,
                          paddingVertical: Dimensions.marginExtraSmall,
                          paddingHorizontal: Dimensions.marginRegular,
                          borderWidth: Dimensions.r1,
                          borderColor: ThemeStyle.red,
                          textAlign: 'center',
                        },
                      ]}>
                      {cohort.name}
                    </Text>
                  )}
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: Dimensions.marginExtraLarge,
                  marginVertical: Dimensions.marginExtraLarge,
                  borderTopWidth: Dimensions.r1,
                  borderBottomWidth: Dimensions.r1,
                  borderColor: ThemeStyle.divider,
                }}>
                <Text style={TextStyles.GeneralTextBold}>Payment</Text>
                <Text
                  style={
                    ([TextStyles.GeneralTextBold],
                    {
                      color: ThemeStyle.green,
                    })
                  }>
                  {getDisplayPrice(this.getCurrentPrice().payment)}
                </Text>
              </View>
              {!this.getCurrentPrice().isFree && (
                <View style={{marginBottom: Dimensions.marginExtraLarge}}>
                  <Text
                    style={[
                      TextStyles.GeneralTextBold,
                      {marginBottom: Dimensions.marginRegular},
                    ]}>
                    Enter Card Details
                  </Text>
                  <LiteCreditCardInput
                    onChange={cardInput => (this.cardInput = cardInput)}
                    inputStyle={[TextStyles.GeneralTextBold]}
                    validColor={ThemeStyle.mainColor}
                    invalidColor={ThemeStyle.red}
                    placeholderColor={ThemeStyle.textExtraLight}
                  />
                </View>
              )}
              <Text style={[TextStyles.ContentText, {textAlign: 'center'}]}>
                {`By joining you agree to our `}
                <Text
                  onPress={() => {
                    Linking.openURL(APP.tnc);
                  }}
                  style={[
                    TextStyles.ContentText,
                    {textAlign: 'center', color: ThemeStyle.mainColor},
                  ]}>
                  terms and conditions
                </Text>
              </Text>
              <CustomButton
                style={{width: '100%', marginTop: Dimensions.marginExtraLarge}}
                onPress={async () => {
                  if (!this.getCurrentPrice().isFree) {
                    const tokenId = await this.generateStripeToken();
                    if (tokenId) {
                      onJoin(program, cohort, tokenId);
                    }
                  } else {
                    onJoin(program, cohort, null);
                  }
                }}
                name="Join"
              />
              <CustomButton
                style={{
                  width: '100%',
                  marginTop: Dimensions.marginRegular,
                  backgroundColor: ThemeStyle.disabledLight,
                }}
                noGradient
                onPress={() => {
                  this.setState({visible: false});
                }}
                textStyle={{
                  color: ThemeStyle.textLight,
                }}
                name="Cancel"
              />
            </View>
          </View>
          <FlashMessage
            ref={ref => {
              this.flashMessage = ref;
            }}
          />
        </View>
      </Modal>
    );
  }
}
