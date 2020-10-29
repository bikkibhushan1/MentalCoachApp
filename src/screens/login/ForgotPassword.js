import React from 'react';
import {View, Text, TouchableOpacity, TextInput, Image} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {Auth} from 'aws-amplify';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import sha from 'sha.js';
import validator from 'validator';
import ThemeStyle from '../../styles/ThemeStyle';
import {showMessage} from 'react-native-flash-message';
import {errorMessage} from '../../utils';
import TextStyles from '../../styles/TextStyles';
import {withStore} from '../../utils/StoreUtils';
import {recordScreenEvent, screenNames} from '../../utils/AnalyticsUtils';
import {asyncStorageConstants} from '../../constants';
import BaseComponent from '../../components/BaseComponent';
import Dimensions from '../../styles/Dimensions';
import CustomButton from '../../components/Button';

const styles = {
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Dimensions.screenMarginRegular,
    justifyContent: 'space-around',
  },
  title: {
    color: '#fff',
    fontSize: 30,
    textAlign: 'center',
    letterSpacing: 3,
    paddingBottom: 48,
  },
  singleInput: {
    paddingVertical: Dimensions.marginLarge,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#fff3',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    alignSelf: 'stretch',
    paddingBottom: Dimensions.marginRegular,
    borderBottomColor: ThemeStyle.textExtraLight,
    borderBottomWidth: Dimensions.r1,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 24,
  },
  header: {
    marginVertical: 24,
    marginHorizontal: 24,
  },
  form: {
    marginTop: 45,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: TextStyles.GeneralText.fontFamily,
  },
  loginButton: {
    backgroundColor: ThemeStyle.mainColor,
  },
  facebookButton: {
    backgroundColor: '#465EA9',
    marginBottom: 20,
  },
  googleButton: {
    backgroundColor: '#CD5542',
  },
  forgotPassword: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 10,
    marginBottom: 10,
  },
  orText: {
    textAlign: 'center',
    marginVertical: 10,
  },
  bottomText: {
    color: '#000',
    textAlign: 'center',
    fontSize: 13,
    fontFamily: TextStyles.GeneralText.fontFamily,
    marginTop: 30,
    marginBottom: 20,
  },
  confirmText: {
    ...TextStyles.SubHeader2,
    textAlign: 'center',
    marginTop: 10,
  },
  error: {
    color: 'red',
    fontSize: 13,
    textAlign: 'center',
    marginTop: -10,
    marginBottom: 10,
  },
  errorTextContainer: {
    height: 30,
    justifyContent: 'center',
    marginBottom: 10,
  },
  resendCodeContainer: {
    height: 50,
    alignItems: 'center',
    width: '100%',
  },
  resetCodeButton: {
    padding: 10,
  },
  resendCode: {
    color: '#000',
  },
};

class ForgotPasswordScreen extends BaseComponent {
  constructor() {
    super();
    this._validAuthStates = ['forgotPassword'];
    this.username = '';
    this.state = {
      email: '',
      confirmModal: false,
      confirmError: '',
      code: '',
      password: '',
      errorText: null,
      countdown: 0,
      showVerification: false,
    };
  }

  componentDidMount() {
    recordScreenEvent(screenNames.forgotPassword);
  }

  forgotPassword = () => {
    const {email} = this.state;
    if (!(email && email !== '' && validator.isEmail(email))) {
      showMessage(errorMessage('Invalid emailID'));
      this.setState({emailError: true});
    } else {
      this.username = new sha.sha256().update(email).digest('hex');
      this.props.setLoading(true);
      Auth.forgotPassword(this.username)
        .then(data => {
          this.showModal(true);
        })
        .catch(err => {
          console.log('Error: ', err);
          this.setState({emailError: true});
          showMessage(errorMessage(err.message));
        })
        .finally(() => {
          this.props.setLoading(false);
        });
    }
  };

  confirmPassword = () => {
    const {code, password} = this.state;
    const upperexp = /[A-Z]/;
    const lowerexp = /[a-z]/;
    const numberexp = /[0-9]/;
    const specialexp = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

    if (!(code && code !== '' && code.length)) {
      showMessage(errorMessage('Invalid verification code'));
    } else if (!(password && password !== '' && password.length >= 8)) {
      showMessage(errorMessage('Password should contain atleast 8 letters'));
    } else if (!upperexp.test(password)) {
      showMessage(
        errorMessage('Password should contain atleast one uppercase letter'),
      );
    } else if (!lowerexp.test(password)) {
      showMessage(
        errorMessage('Password should contain atleast one lowercase letter'),
      );
    } else if (!numberexp.test(password)) {
      showMessage(errorMessage('Password should contain atleast one number'));
    } else if (!specialexp.test(password)) {
      showMessage(
        errorMessage('Password should contain atleast one special character'),
      );
    } else if (code.trim() !== '' && password.trim !== '') {
      this.props.setLoading(true);
      Auth.forgotPasswordSubmit(this.username, code, password)
        .then(data => {
          showMessage({
            type: 'success',
            title: 'Success',
            message: 'Your password has been successfully changed!',
          });
          this.signInUser();
        })
        .catch(err => {
          showMessage(errorMessage(err.msg));
        })
        .finally(() => {
          this.props.setLoading(false);
        });
    }
  };

  signInUser = () => {
    this.props.setLoading(true);
    Auth.signIn(this.username, this.state.password)
      .then(res => {
        AsyncStorage.setItem('username', this.username);
        AsyncStorage.setItem(
          'token',
          res.signInUserSession.accessToken.jwtToken,
        );
        Auth.currentUserInfo().then(userInfo => {
          AsyncStorage.setItem(
            asyncStorageConstants.userInfo,
            JSON.stringify(userInfo),
          );
        });
        this.props.navigation.navigate('Home');
      })
      .catch(err => {
        console.log('Error: ', err);
        showMessage(errorMessage(err.msg));
      })
      .finally(() => {
        this.props.setLoading(false);
      });
  };

  showModal = type => this.setState({showVerification: true});

  performCountdown = () => {
    this.setState({countdown: 30});
    let timer = setInterval(() => {
      if (this.state.countdown === 1) {
        this.setState({countdown: 0});
        clearInterval(timer);
      } else {
        this.setState({countdown: this.state.countdown - 1});
      }
    }, 1000);
  };

  resendConfirmationCode = () => {
    this.props.setLoading(false);
    Auth.forgotPassword(this.username)
      .then(response => {
        console.log('success. Response:', response);
        this.performCountdown();
        showMessage({
          type: 'success',
          title: 'Success',
          message: 'A new code has been sent to your email.',
        });
      })
      .catch(error => {
        console.log('error:', error);
        showMessage(
          errorMessage(
            error.message
              ? error.message
              : 'Error in resending code. Please try again later.',
          ),
        );
      })
      .finally(() => {
        this.props.setLoading(false);
      });
  };

  render() {
    // if (!this._validAuthStates.includes(this.props.authState)) return null;
    const {emailError, showVerification} = this.state;
    const {navigation} = this.props;
    return this.renderWithSafeArea(
      <View style={styles.container}>
        <KeyboardAwareScrollView style={styles.container}>
          <View style={styles.content}>
            <TouchableOpacity
              onPress={() => {
                navigation.pop();
              }}>
              <Image
                source={require('../../assets/images/arrow-icon.png')}
                style={{
                  tintColor: ThemeStyle.textRegular,
                  marginVertical: Dimensions.screenMarginRegular,
                }}
              />
            </TouchableOpacity>
            <Text
              style={[
                TextStyles.HeaderExtraBold,
                {
                  marginTop: Dimensions.marginExtraLarge,
                  marginBottom: Dimensions.r48,
                },
              ]}>
              Forgot Password
            </Text>
            <View>
              {!this.state.showVerification && (
                <View style={styles.singleInput}>
                  <TextInput
                    style={[
                      TextStyles.SubHeader2,
                      styles.input,
                      {
                        color: emailError
                          ? ThemeStyle.red
                          : ThemeStyle.textRegular,
                        borderBottomColor: emailError
                          ? ThemeStyle.red
                          : ThemeStyle.textExtraLight,
                      },
                    ]}
                    onChangeText={email => {
                      email = email.trim();
                      this.setState({email});
                    }}
                    defaultValue={this.username}
                    placeholder="Email"
                    placeholderTextColor={ThemeStyle.textLight}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    underlineColorAndroid="transparent"
                    onFocus={() => {
                      this.setState({emailError: false});
                    }}
                  />
                </View>
              )}
              {this.state.showVerification && (
                <View>
                  <Text style={styles.confirmText}>
                    We have sent an email with a verification code. Please enter
                    the details below.
                  </Text>

                  <View style={[styles.singleInput, {marginTop: 45}]}>
                    <TextInput
                      style={[TextStyles.SubHeader2, styles.input]}
                      onChangeText={code => this.setState({code})}
                      value={this.state.code}
                      placeholder="Verification Code"
                      placeholderTextColor={ThemeStyle.textLight}
                      underlineColorAndroid="transparent"
                    />
                  </View>
                  <View style={styles.singleInput}>
                    <TextInput
                      style={[TextStyles.SubHeader2, styles.input]}
                      onChangeText={password => this.setState({password})}
                      value={this.state.password}
                      placeholder="New Password"
                      placeholderTextColor={ThemeStyle.textLight}
                      underlineColorAndroid="transparent"
                      secureTextEntry
                    />
                  </View>
                  <View
                    style={styles.resendCodeContainer}
                    onLayout={() => {
                      this.performCountdown();
                    }}>
                    <TouchableOpacity
                      onPress={this.resendConfirmationCode}
                      style={styles.resendCodeButton}
                      disabled={this.state.countdown > 0}>
                      <Text style={styles.resendCode}>{`Resend Code${
                        this.state.countdown > 0
                          ? `(${this.state.countdown})`
                          : ''
                      }`}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              <CustomButton
                name="Submit"
                onPress={
                  this.state.showVerification
                    ? this.confirmPassword
                    : this.forgotPassword
                }
              />
              <View />
            </View>
          </View>
        </KeyboardAwareScrollView>
      </View>,
    );
  }
}

export default withStore(ForgotPasswordScreen);
