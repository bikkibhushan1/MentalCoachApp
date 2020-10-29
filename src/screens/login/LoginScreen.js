import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Keyboard,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Amplify, {API, graphqlOperation, Auth} from 'aws-amplify';
import * as Animatable from 'react-native-animatable';
import ThemeStyle from '../../styles/ThemeStyle';
import TextStyles from '../../styles/TextStyles';
import validator from 'validator';
import sha from 'sha.js';
import {showMessage} from 'react-native-flash-message';
import {errorMessage, isNullOrEmpty} from '../../utils';
import {NavigationActions, StackActions} from 'react-navigation';
import {
  getAmplifyConfig,
  getEnvVars,
  APP,
  asyncStorageConstants,
} from '../../constants';
import {recordScreenEvent, screenNames} from '../../utils/AnalyticsUtils';
import BaseComponent from '../../components/BaseComponent';
import {withStore} from '../../utils/StoreUtils';
import CustomButton from '../../components/Button';
import Header from '../../components/Header';
import Dimensions from '../../styles/Dimensions';
import {fetchUserDetails} from '../../redux/actions/UserActions';
import CustomInput from '../../components/CustomInput';

const federated_data = {
  google_client_id_android:
    '740167288482-etojmlpgesaodgscismec0se6gri7lr2.apps.googleusercontent.com',
  google_client_id_ios:
    '740167288482-mo5tk4p9e1u2b4amqrqb4a3k2f991rcs.apps.googleusercontent.com',
  facebook_app_id: '991837820941188',
};

const loginWithFacebook = async appId => {
  // const { type, token, expires} = await Facebook.logInWithReadPermissionsAsync(appId, {
  //     permissions: ['public_profile', 'email'],
  //   });
  // let data;
  // if (type === 'success') {
  //   const response = await fetch(`https://graph.facebook.com/me?access_token=${token}&&fields=name,email`);
  //   data = await response.json();
  // } else {
  //   data = []
  // }
  // const date = new Date();
  // const expires_at = expires * 1000 + date.getTime();
  // return {
  //   token, data, expires_at
  // }
};

const loginWithGoogle = async (iosId, androidId) => {
  try {
    // const result = await Expo.Google.logInAsync({
    //   androidClientId: androidId,
    //   iosClientId: iosId,
    //   scopes: ['profile', 'email'],
    // });
    // if (result.type === 'success') {
    //   let userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
    //     headers: { Authorization: `Bearer ${result.accessToken}`},
    //   });
    //   const date = new Date();
    //   let expires = 391205885;
    //   const expires_at =  expires + date.getTime();
    //   const user = await userInfoResponse.json();
    //   return  returningObj =  {
    //     user: user,
    //     token: result.idToken,
    //     expires_at: expires_at
    //   }
    // } else {
    //   return {cancelled: true};
    // }
  } catch (e) {
    return {error: true};
  }
};

class LoginScreen extends BaseComponent {
  constructor() {
    super();
    this._validAuthStates = ['signIn', 'signedOut', 'signedUp'];
    this.state = {
      error: null,
      showEmailForm: true,
    };
  }

  toggleForm = () => {
    this.setState(state => ({
      showLoginForm: !state.showLoginForm,
      formHeight: 160,
    }));
    this.loginForm.transitionTo({height: 160}, 500, 'ease-out-quint');
  };

  componentDidMount = () => {
    console.log('login screen', Auth.configure());
    recordScreenEvent(screenNames.login);
  };

  signIn = () => {
    Keyboard.dismiss();
    const {username, password} = this;
    if (!(username && username !== '' && validator.isEmail(username))) {
      this.setState({emailError: true});
      showMessage(errorMessage('Invalid Username'));
    } else if (!(password && password !== '')) {
      this.setState({passwordError: true});
      showMessage(errorMessage('Invalid or Empty password field'));
    } else {
      this.props.setLoading(true);
      let usernameSHA = new sha.sha256().update(this.username).digest('hex');
      Auth.signIn(usernameSHA, password)
        .then(res => {
          AsyncStorage.setItem('username', usernameSHA);
          Auth.currentUserInfo().then(userInfo => {
            AsyncStorage.setItem(
              asyncStorageConstants.userInfo,
              JSON.stringify(userInfo),
            );
          });
          this.props.getUserDetails();
          this.setState({userInfo: res, mfaModal: false});
          if (
            !res.signInUserSession.idToken.payload['cognito:groups'] ||
            (!res.signInUserSession.idToken.payload['cognito:groups'].includes(
              APP.usersGroupClient,
            ) &&
              !res.signInUserSession.idToken.payload['cognito:groups'].includes(
                APP.usersGroupCoach,
              ))
          ) {
            this.setUserGroup()
              .then(() => Auth.signIn(usernameSHA, password))
              .then(res => {
                AsyncStorage.setItem(
                  'token',
                  res.signInUserSession.idToken.jwtToken,
                );
                this.props.setLoading(false);
                const resetAction = StackActions.reset({
                  index: 0,
                  actions: [NavigationActions.navigate({routeName: 'Home'})],
                });
                this.props.navigation.dispatch(resetAction);
              })
              .catch(err => {
                this.props.setLoading(false);
                console.log('Error', err);
                showMessage(
                  errorMessage('Failed to sign-in. Please try again'),
                );
              });
          } else {
            AsyncStorage.setItem(
              'token',
              res.signInUserSession.idToken.jwtToken,
            );
            this.props.setLoading(false);
            console.log('loged in');
            const resetAction = StackActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({routeName: 'Home'})],
            });
            this.props.navigation.dispatch(resetAction);
          }
        })
        .catch(err => {
          console.log('Error: ', err);
          this.props.setLoading(false);
          if (err.code === 'UserNotConfirmedException') {
            this.props.navigation.navigate('SignUp', {
              showConfirmation: true,
              email: username,
              password: password,
            });
          } else {
            showMessage(errorMessage(err.message));
          }
        });
    }
  };

  setUserGroup = () => {
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
  };

  socialLogin = type => async () => {
    if (type === 'google') {
      // const info = await loginWithGoogle(
      //   federated_data.google_client_id_ios,
      //   federated_data.google_client_id_android
      // );
      // console.log("Google info: ", info);
      // if (!info.token) return;
      // const user = {
      //   name: info.user.name,
      //   email: info.user.email
      // };
      // const credentials = await Auth.federatedSignIn(
      //   "google",
      //   { token: info.token, expires_at: info.expires_at },
      //   user
      // );
      // console.log("Google Credentials: ", credentials);
      // if (credentials.authenticated) {
      //   let obj = {
      //     identityId: credentials._identityId,
      //     accessToken: info.token
      //   };
      //   this.changeState("signedIn", user);
      // } else {
      //   console.log("Authentication Failed ");
      // }
      // Auth.federatedSignIn('google', { token: info.token, expires_at: info.expires_at }, user).then(response => {
      //   console.log("Federated Response: ", response);
      // }).then(res => console.log("Second Response", res))
      // .catch(err => {
      //   console.log("Error: ", err.message);
      // })
      // } else {
      //   const info = await loginWithFacebook(federated_data.facebook_app_id);
      //   // If Login Failed
      //   if (!info.token) return;
      //   const userObj = info.data;
      // const credentials = await Auth.federatedSignIn(
      //   "facebook",
      //   { token: info.token, expires_at: info.expires_at },
      //   userObj
      // );
      // console.log("Facebook Credentials: ", credentials);
      // if (credentials.authenticated) {
      //   let obj = {
      //     identityId: credentials._identityId,
      //     accessToken: info.token
      //   };
      //   this.changeState("signedIn", info.data);
      // } else {
      //   console.log("Authentication failed with AWS");
      // }
    }
  };

  renderEmailLogin = () => {
    const {emailError, passwordError, showEmailForm} = this.state;
    const {navigation} = this.props;
    return (
      <Animatable.View
        style={{
          paddingHorizontal: Dimensions.screenMarginRegular,
          minHeight: '100%',
        }}
        ref={ref => (this.loginForm = ref)}>
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
          Login with email
        </Text>
        <View style={styles.singleInput}>
          <CustomInput
            style={[
              TextStyles.SubHeader2,
              styles.input,
              {
                color: emailError ? ThemeStyle.red : ThemeStyle.textRegular,
                borderBottomColor: emailError
                  ? ThemeStyle.red
                  : ThemeStyle.textExtraLight,
              },
            ]}
            onChangeText={username => {
              this.username = username.trim();
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
        <View style={styles.singleInput}>
          <CustomInput
            style={[
              TextStyles.SubHeader2,
              styles.input,
              {color: passwordError ? ThemeStyle.red : ThemeStyle.textRegular},
            ]}
            onChangeText={password => (this.password = password.trim())}
            defaultValue={this.password}
            placeholder="Password"
            placeholderTextColor={ThemeStyle.textLight}
            secureTextEntry={true}
            autoCapitalize="none"
            underlineColorAndroid="transparent"
            onFocus={() => {
              this.setState({emailError: false});
            }}
          />
        </View>
        <CustomButton
          name="Login"
          onPress={this.signIn}
          style={{
            width: '95%',
            backgroundColor: ThemeStyle.disabled,
            alignSelf: 'center',
            marginTop: Dimensions.marginRegular,
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: Dimensions.screenMarginWide,
            left: Dimensions.screenMarginRegular,
          }}>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.navigate('ForgotPassword');
            }}>
            <Text style={[TextStyles.GeneralText, styles.forgotPassword]}>
              Forgot your password?
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.replace('SignUp');
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
              Not a member?{' '}
              <Text
                style={[
                  TextStyles.GeneralTextBold,
                  {
                    color: ThemeStyle.mainColor,
                    fontSize: 16,
                  },
                ]}>
                Sign Up
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </Animatable.View>
    );
  };

  renderLoginOptions = () => {
    return null;
    // return (
    //   <View>
    //     <TouchableOpacity
    //       style={[styles.button, styles.facebookButton]}
    //       onPress={this.socialLoginAlert('Facebook')}>
    //       <Icon
    //         name="logo-facebook"
    //         size={25}
    //         color="#fff"
    //         style={{marginRight: 10}}
    //       />
    //       <Text style={[TextStyles.GeneralText, styles.buttonText]}>
    //         Continue with Facebook
    //       </Text>
    //     </TouchableOpacity>
    //     <TouchableOpacity
    //       style={[styles.button, styles.googleButton]}
    //       onPress={this.socialLoginAlert('Google')}>
    //       <Icon
    //         name="logo-google"
    //         size={22}
    //         color="#fff"
    //         style={{marginRight: 10}}
    //       />
    //       <Text style={[TextStyles.GeneralText, styles.buttonText]}>
    //         Continue with Google
    //       </Text>
    //     </TouchableOpacity>
    //   </View>
    // );
  };

  render() {
    return this.renderWithSafeArea(
      <View style={ThemeStyle.pageContainer}>
        <KeyboardAwareScrollView contentContainerStyle={styles.content}>
          {this.state.showEmailForm
            ? this.renderEmailLogin()
            : this.renderLoginOptions()}
        </KeyboardAwareScrollView>
      </View>,
    );
  }
}
const mapDispatchToProps = dispatch => ({
  getUserDetails: () => dispatch(fetchUserDetails()),
});

export default withStore(LoginScreen, () => {}, mapDispatchToProps);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
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
  facebookButton: {
    backgroundColor: '#465EA9',
    marginBottom: 20,
  },
  googleButton: {
    backgroundColor: '#CD5542',
  },
  forgotPassword: {
    fontSize: 16,
    marginBottom: Dimensions.marginLarge,
  },
  orText: {
    textAlign: 'center',
    marginVertical: 20,
  },
  error: {
    color: 'red',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 1,
    marginBottom: 12,
    fontFamily: TextStyles.GeneralText.fontFamily,
  },
});
