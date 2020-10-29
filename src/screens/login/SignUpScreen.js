import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Linking,
  StyleSheet,
  Keyboard,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from '../../components/Icon';
import Amplify, {API, graphqlOperation, Auth} from 'aws-amplify';
import sha from 'sha.js';
import TextStyles from '../../styles/TextStyles';
import ThemeStyle from '../../styles/ThemeStyle';
import validator from 'validator';
import {showMessage} from 'react-native-flash-message';
import {errorMessage} from '../../utils';
import {
  getAmplifyConfig,
  getEnvVars,
  APP,
  asyncStorageConstants,
} from '../../constants';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {recordScreenEvent, screenNames} from '../../utils/AnalyticsUtils';
import {withStore} from '../../utils/StoreUtils';
import BaseComponent from '../../components/BaseComponent';
import Dimensions from '../../styles/Dimensions';
import CustomButton from '../../components/Button';
import {fetchUserDetails} from '../../redux/actions/UserActions';
import CustomInput from '../../components/CustomInput';

class SignupScreen extends BaseComponent<{}, {}> {
  constructor(props) {
    super(props);
    this.state.policyModal = false;
    this.state.countdown = 0;
    this.state.showVerification = false;
    this._validAuthStates = ['signUp'];
    this.username = '';
    this.signupForm = null;
    this.email = '';
    this.fname = '';
    this.lname = '';
    this.code = '';
    this.password = '';
    let params = props.navigation.state.params;
    if (params && params.showConfirmation) {
      this.username = params.email;
      this.email = params.email;
      this.password = params.password;
      this.state.showVerification = true;
    }
  }

  componentDidMount = () => {
    console.log('signup screen', Auth.configure());
    recordScreenEvent(screenNames.signUp);
  };

  componentWillReceiveProps(props) {
    let params = props.navigation.state.params;
    if (params && params.showConfirmation) {
      this.username = params.email;
      this.email = params.email;
      this.password = params.password;
      this.state.showVerification = true;
    }
  }

  performCountdown = () => {};

  signup = () => {
    const {password, email, fname, lname} = this;
    const upperexp = /[A-Z]/;
    const lowerexp = /[a-z]/;
    const numberexp = /[0-9]/;
    const specialexp = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    if (!(fname && fname !== '')) {
      showMessage(errorMessage('Please enter a name'));
      this.setState({nameError: true});
    } else if (!(email && email !== '' && validator.isEmail(email))) {
      showMessage(errorMessage('Invalid Email'));
      this.setState({emailError: true});
    } else if (!(password && password !== '' && password.length >= 8)) {
      showMessage(errorMessage('Password should contain atleast 8 letters'));
      this.setState({passwordError: true});
    } else if (!upperexp.test(password)) {
      showMessage(
        errorMessage('Password should contain atleast one uppercase letter'),
      );
      this.setState({passwordError: true});
    } else if (!lowerexp.test(password)) {
      showMessage(
        errorMessage('Password should contain atleast one lowercase letter'),
      );
      this.setState({passwordError: true});
    } else if (!numberexp.test(password)) {
      showMessage(errorMessage('Password should contain atleast one number'));
      this.setState({passwordError: true});
    } else if (!specialexp.test(password)) {
      showMessage(
        errorMessage('Password should contain atleast one special character'),
      );
      this.setState({passwordError: true});
    } else {
      this.props.setLoading(true);
      this.username = new sha.sha256().update(email).digest('hex');
      Auth.signUp({
        username: this.username,
        password,
        attributes: {
          email,
          name: fname,
        },
      })
        .then(user => {
          this.performCountdown();
          this.setState({
            showVerification: true,
          });
        })
        .catch(err => {
          showMessage(errorMessage(err.message));
          console.log('Error: ', err);
        })
        .finally(() => {
          this.props.setLoading(false);
        });
    }
  };

  resendConfirmationCode = () => {
    this.props.setLoading(true);
    this.username = new sha.sha256().update(this.email).digest('hex');
    Auth.resendSignUp(this.username)
      .then(response => {
        console.log('success. Response:', response);
        this.performCountdown();
        showMessage({
          type: 'success',
          message: 'A new code has been sent to your email.',
          title: 'Success',
        });
      })
      .catch(error => {
        console.log('error:', error);
        showMessage(errorMessage('Error in sending code. Please try again.'));
      })
      .finally(() => this.props.setLoading(false));
  };

  confirmUser = () => {
    console.log('Confirming user');
    const {code, email} = this;
    if (!(email && email !== '' && validator.isEmail(email))) {
      this.setState({confirmError: 'Invalid Email'});
    } else if (!(code && code !== '')) {
      this.setState({confirmError: 'Invalid OTP'});
    } else {
      this.props.setLoading(true);
      this.username = new sha.sha256().update(this.email).digest('hex');
      Auth.confirmSignUp(this.username, code)
        .then(data => {
          console.log('Confirmed user');
          Keyboard.dismiss();
          if (this.password) {
            this.signInUser();
          } else {
            this.props.setLoading(false);
            this.navigateToLogin();
          }
        })
        .catch(err => {
          this.props.setLoading(false);
          this.setState({confirmError: err.message || err});
        });
    }
  };

  signInUser = () => {
    this.props.setLoading(true);
    Auth.signIn(this.username, this.password)
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
        this.props.getUserDetails();
        Amplify.configure(
          getAmplifyConfig(getEnvVars().SWASTH_COMMONS_ENDPOINT_URL),
        );
        const addgroup = `mutation addUserToGroup($groupName: String!){
          addUserToGroup(groupName: $groupName){
            msg
          }
        }`;

        const data = {
          groupName: APP.usersGroupClient,
        };
        return API.graphql(graphqlOperation(addgroup, data));
      })
      .then(() => {
        return Auth.signIn(this.username, this.password);
      })
      .then(res => {
        AsyncStorage.setItem(
          'token',
          res.signInUserSession.accessToken.jwtToken,
        );
        console.log('logged in');
        this.props.navigation.navigate('Home');
      })
      .catch(err => {
        console.log('Error: ', err);
        showMessage(errorMessage(err.errors[0].message || err.message));
      })
      .finally(() => {
        this.props.setLoading(false);
      });
  };

  showPolicy = type => this.setState({policyModal: type});

  navigateToLogin = () => {
    this.props.navigation.navigate('Login');
  };

  getPolicyModal = () => {
    return (
      <Modal
        visible={this.state.policyModal}
        animationType="fade"
        backgroundColor="#0006"
        onRequestClose={() => this.showPolicy(false)}
        transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: '#0006',
            justifyContent: 'center',
          }}>
          <View style={styles.policyWrapper}>
            <TouchableOpacity
              onPress={() => this.showPolicy(false)}
              style={styles.policyOverlay}
            />
            <View style={styles.policyContainer}>
              <View style={styles.policyHeader}>
                <Text style={styles.policyTitle}>Password Policy</Text>
                <TouchableOpacity
                  onPress={() => this.showPolicy(false)}
                  style={styles.policyClose}>
                  <Icon
                    name="ios-close-circle-outline"
                    size={28}
                    color="white"
                    style={styles.icon}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.policyContent}>
                <View style={styles.policyRow}>
                  <Text style={styles.policy}>
                    Password must be atleast 8 characters.
                  </Text>
                </View>
                <View style={styles.policyRow}>
                  <Text style={styles.policy}>
                    Password must contain a uppercase character.
                  </Text>
                </View>
                <View style={styles.policyRow}>
                  <Text style={styles.policy}>
                    Password must contain a lowercase character.
                  </Text>
                </View>
                <View style={styles.policyRow}>
                  <Text style={styles.policy}>
                    Password must contain a number.
                  </Text>
                </View>
                <View style={styles.policyRow}>
                  <Text style={styles.policy}>
                    Password must contain a special character.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  getSignupForm = () => {
    const {emailError, passwordError, nameError, confirmError} = this.state;
    return this.state.showVerification ? (
      <View>
        <Text style={styles.confirmText}>
          We have sent an email with a confirmation code. Please enter the code
          below.
        </Text>
        {confirmError !== '' && (
          <Text style={styles.error}>{confirmError}</Text>
        )}
        <View style={[styles.singleInput]}>
          <CustomInput
            key="verificationInput"
            style={[
              TextStyles.SubHeaderBold,
              styles.input,
              {
                color: confirmError ? ThemeStyle.red : ThemeStyle.textRegular,
                borderBottomColor: confirmError
                  ? ThemeStyle.red
                  : ThemeStyle.textExtraLight,
              },
            ]}
            onChangeText={code => (this.code = code)}
            placeholder="Enter Code"
            placeholderTextColor={ThemeStyle.textLight}
            underlineColorAndroid="transparent"
            onFocus={() => {
              this.setState({confirmError: null});
            }}
          />
        </View>
        <TouchableOpacity
          onPress={() => {
            this.resendConfirmationCode();
          }}>
          <Text
            style={[
              TextStyles.GeneralText,
              {textAlign: 'center', marginBottom: Dimensions.r48},
            ]}>
            Did not receive a code? RESEND CODE
          </Text>
        </TouchableOpacity>
      </View>
    ) : (
      <View>
        <View style={styles.singleInput}>
          <CustomInput
            key="nameInput"
            style={[
              TextStyles.SubHeaderBold,
              styles.input,
              {
                color: nameError ? ThemeStyle.red : ThemeStyle.textRegular,
                borderBottomColor: nameError
                  ? ThemeStyle.red
                  : ThemeStyle.textExtraLight,
              },
            ]}
            onChangeText={fname => (this.fname = fname.trim())}
            defaultValue={this.fname}
            placeholder="Name"
            placeholderTextColor={ThemeStyle.textLight}
            autoCapitalize="none"
            underlineColorAndroid="transparent"
            onFocus={() => {
              this.setState({nameError: null});
            }}
          />
        </View>

        <View style={styles.singleInput}>
          <CustomInput
            key="emailInput"
            style={[
              TextStyles.SubHeaderBold,
              styles.input,
              {
                color: emailError ? ThemeStyle.red : ThemeStyle.textRegular,
                borderBottomColor: emailError
                  ? ThemeStyle.red
                  : ThemeStyle.textExtraLight,
              },
            ]}
            onChangeText={email => (this.email = email.trim())}
            defaultValue={this.email}
            placeholder="Email"
            keyboardType="email-address"
            placeholderTextColor={ThemeStyle.textLight}
            autoCapitalize="none"
            underlineColorAndroid="transparent"
            onFocus={() => {
              this.setState({emailError: null});
            }}
          />
        </View>

        <View style={styles.singleInput}>
          <CustomInput
            key="passwordInput"
            style={[
              TextStyles.SubHeaderBold,
              styles.input,
              {
                color: passwordError ? ThemeStyle.red : ThemeStyle.textRegular,
                borderBottomColor: passwordError
                  ? ThemeStyle.red
                  : ThemeStyle.textExtraLight,
              },
            ]}
            onChangeText={password => (this.password = password.trim())}
            defaultValue={this.password}
            placeholder="Password"
            placeholderTextColor={ThemeStyle.textLight}
            secureTextEntry={true}
            autoCapitalize="none"
            underlineColorAndroid="transparent"
            onFocus={() => {
              this.setState({passwordError: null});
            }}
          />
          <TouchableOpacity
            onPress={() => this.showPolicy(true)}
            style={styles.rightIcon}>
            <Icon
              name="ios-help-circle-outline"
              size={28}
              color={ThemeStyle.textLight}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  render() {
    const {navigation} = this.props;
    const {showVerification} = this.state;
    return this.renderWithSafeArea(
      <View style={ThemeStyle.pageContainer}>
        <KeyboardAwareScrollView contentContainerStyle={{flex: 1}}>
          <View style={styles.content}>
            <View>
              <View appear="scale">
                <View>
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
                    {showVerification ? `Verification` : `Signup`}
                  </Text>
                  {this.getSignupForm()}
                  <CustomButton
                    name={showVerification ? `Confirm` : `Sign Up`}
                    onPress={
                      this.state.showVerification
                        ? this.confirmUser
                        : this.signup
                    }
                    style={{
                      width: '95%',
                      backgroundColor: ThemeStyle.disabled,
                      alignSelf: 'center',
                      marginTop: Dimensions.marginRegular,
                    }}
                  />
                  <Text style={[TextStyles.GeneralText, styles.bottomText]}>
                    By signing up you agree to our
                  </Text>

                  <View
                    style={{
                      flexDirection: 'row',
                      paddingHorizontal: 24,
                      justifyContent: 'center',
                    }}>
                    <TouchableOpacity onPress={() => Linking.openURL(APP.tnc)}>
                      <Text
                        style={[
                          TextStyles.GeneralText,
                          styles.termsPrivacyText,
                        ]}>
                        Terms & Conditions
                      </Text>
                    </TouchableOpacity>
                    <Text
                      style={[
                        TextStyles.GeneralText,
                        styles.termsPrivacyText,
                        {color: '#000'},
                      ]}>
                      {' and '}
                    </Text>
                    <TouchableOpacity
                      onPress={() => Linking.openURL(APP.privacyPolicy)}>
                      <Text
                        style={[
                          TextStyles.GeneralText,
                          styles.termsPrivacyText,
                        ]}>
                        {' '}
                        Privacy Policy
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
            {!showVerification && (
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.replace('Login');
                }}>
                <Text
                  style={[
                    TextStyles.GeneralText,
                    {
                      paddingVertical: 12,
                      fontSize: 15,
                      marginRight: Dimensions.marginSmall,
                    },
                  ]}>
                  Already have an account?{' '}
                  <Text
                    style={[
                      TextStyles.GeneralTextBold,
                      {
                        color: ThemeStyle.mainColor,
                        fontSize: 16,
                      },
                    ]}>
                    Login
                  </Text>
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAwareScrollView>
        {this.getPolicyModal()}
      </View>,
    );
  }
}

export default withStore(SignupScreen, undefined, dispatch => ({
  getUserDetails: () => dispatch(fetchUserDetails()),
}));

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: Dimensions.screenMarginRegular,
    justifyContent: 'space-between',
  },
  title: {
    color: '#fff',
    fontSize: 30,
    textAlign: 'center',
    letterSpacing: 3,
  },
  singleInput: {
    paddingVertical: Dimensions.marginLarge,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    ...TextStyles.SubHeader2,
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
  buttonText: {
    color: 'white',
    fontSize: 16,
    letterSpacing: 1,
    flex: 1,
    textAlign: 'center',
  },
  rightIcon: {
    position: 'absolute',
    right: Dimensions.marginSmall,
    top: Dimensions.marginRegular,
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
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  orText: {
    color: '#000',
    textAlign: 'center',
    marginVertical: 10,
  },
  bottomText: {
    color: '#000',
    textAlign: 'center',
    fontSize: 13,
    marginTop: 16,
    marginBottom: 10,
  },
  termsPrivacyText: {
    color: 'blue',
    textAlign: 'center',
    fontSize: 13,
  },
  confirmText: {
    ...TextStyles.SubHeader2,
    textAlign: 'center',
    marginTop: 10,
  },
  error: {
    color: ThemeStyle.red,
    fontSize: 13,
    textAlign: 'center',
    marginTop: Dimensions.marginRegular,
  },
  policyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginHorizontal: 20,
    borderRadius: 8,
  },
  policyContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  policyHeader: {
    backgroundColor: ThemeStyle.accentColor,
    paddingVertical: 12,
    paddingHorizontal: 16,
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  policy: {
    fontFamily: TextStyles.GeneralText.fontFamily,
    fontSize: 16,
  },
  policyTitle: {
    textAlign: 'center',
    color: 'white',
    fontSize: 18,
    fontFamily: TextStyles.SubHeaderBold.fontFamily,
  },
  policyRow: {
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
