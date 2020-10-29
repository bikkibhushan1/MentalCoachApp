import React from 'react';
import {StyleSheet, View, Text, Image} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import ThemeStyle from '../../styles/ThemeStyle';
import Splash from 'react-native-splash-screen';
import {StackActions, NavigationActions} from 'react-navigation';
import {asyncStorageConstants} from '../../constants';
import Orientation from 'react-native-orientation-locker';
import BaseComponent from '../../components/BaseComponent';
import TextStyles, {fontFamily} from '../../styles/TextStyles';
import Dimensions, {windowDimensions} from '../../styles/Dimensions';
import {TouchableOpacity} from 'react-native-gesture-handler';
import CustomButton from '../../components/Button';
import {withStore} from '../../utils/StoreUtils';
import {fetchUserDetails} from '../../redux/actions/UserActions';

class SplashScreen extends BaseComponent {
  constructor(props) {
    super(props);
  }

  navigateToHome = () => {
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({routeName: 'Home'})],
    });
    this.props.navigation.dispatch(resetAction);
  };

  renderLoginOptions = () => {
    const {showLoginOptions} = this.state;
    const {navigation} = this.props;
    if (!showLoginOptions) {
      return null;
    }
    return (
      <View style={{padding: Dimensions.screenMarginRegular}}>
        <CustomButton
          name="Login with Email"
          onPress={() => {
            navigation.navigate('Login');
          }}
          style={{marginBottom: Dimensions.marginExtraLarge}}
        />
        <View
          style={{
            flexDirection: 'row',
            borderRadius: 24,
            borderColor: ThemeStyle.textExtraLight,
            borderWidth: 1,
          }}>
          <Text
            style={[
              TextStyles.SubHeaderBold,
              {
                flex: 2,
                paddingVertical: 12,
                paddingHorizontal: 24,
                fontSize: 15,
                textAlign: 'center',
              },
            ]}>
            Not a member?
          </Text>
          <CustomButton
            name="Sign Up"
            onPress={() => {
              navigation.navigate('SignUp');
            }}
            style={{flex: 0.5}}
          />
        </View>
      </View>
    );
  };

  componentDidMount = async () => {
    Orientation.lockToPortrait();
    const clearStorage = await AsyncStorage.getItem(
      asyncStorageConstants.clearLocalStorage,
    );
    if (!clearStorage || JSON.parse(clearStorage) !== true) {
      const notifID = await AsyncStorage.getItem('@notifID');
      AsyncStorage.clear();
      AsyncStorage.setItem(
        asyncStorageConstants.clearLocalStorage,
        JSON.stringify(true),
      );
      notifID && (await AsyncStorage.setItem('@notifID', notifID));
    }
    AsyncStorage.getItem('token')
      .then(async user => {
        if (user) {
          const userDetails = await this.props.getUserDetails();
          console.log('USER TOKEN', user, userDetails);
          if (!userDetails) {
            AsyncStorage.clear();
            this.setState({showLoginOptions: true});
          } else {
            AsyncStorage.getItem('@pin').then(pin => {
              if (pin) {
                let pinStatus = JSON.parse(pin);
                if (pinStatus.isPinEnabled) {
                  this.props.navigation.navigate('PINCodeScreen', {
                    status: 'enter',
                    storedPin: pinStatus.storedPin,
                  });
                } else {
                  this.navigateToHome();
                }
              } else {
                this.navigateToHome();
              }
            });
          }
        } else {
          this.setState({showLoginOptions: true});
        }
        Splash.hide();
      })
      .catch(err => {
        this.setState({showLoginOptions: true});
        Splash.hide();
        console.log('error: ', err);
      });
  };

  render() {
    return this.renderWithSafeArea(
      <View style={ThemeStyle.pageContainer}>
        <View
          style={{
            flex: 1,
            flexDirection: 'column',

            marginTop: windowDimensions.height / 4,
          }}>
          <Image
            source={require('./../../assets/images/Life-coach-symbol.png')}
            style={{
              alignSelf: 'center',
              resizeMode: 'center',
            }}
          />

          <View
            style={{
              flex: 1,
              alignItems: 'center',
              flexDirection: 'column',
            }}>
            <Text
              style={{
                fontSize: 32,
                fontFamily: fontFamily.bold,
                marginTop: -80,
              }}>
              LIFE COACH
            </Text>
            <Text style={{color: ThemeStyle.mainColor, fontSize: 20}}>
              Powered by Swasth
            </Text>
          </View>
        </View>

        {this.renderLoginOptions()}
      </View>,
    );
  }
}

export default withStore(SplashScreen, undefined, dispatch => ({
  getUserDetails: () => dispatch(fetchUserDetails()),
}));
