import {Analytics, Auth} from 'aws-amplify';
import AsyncStorage from '@react-native-community/async-storage';
import {isOnline} from './NetworkUtils';
import {asyncStorageConstants} from '../constants';

export const screenNames = {
  login: 'Login Screen',
  signup: 'Signup Screen',
  forgotPassword: 'Forgot Password',
};

export const eventNames = {
  signIn: 'SIGN IN',
  signUp: 'SIGN UP',
  emailVerification: 'EMAIL VERIFIED',
  showSubscription: 'SHOW BUY SUBSCRIPTION',
};

export async function recordScreenEvent(
  eventName,
  attributes = {},
  metrics = {},
) {
  let userInfo = await Auth.currentUserInfo();
  if (!isOnline()) {
    userInfo = JSON.parse(
      await AsyncStorage.getItem(asyncStorageConstants.userInfo),
    );
  }
  console.log('SCREEN EVENT', userInfo, eventName);
  if (userInfo && userInfo.attributes) {
    Analytics.record({
      name: eventName,
      attributes: {
        userName: userInfo.attributes.name,
        userEmailId: userInfo.attributes.email,
        network: isOnline() ? 'online' : 'offline',
        ...attributes,
      },
      metrics,
    })
      .then(res => {
        console.log('SUCCESSFULLY SENT EVENT ' + eventName, attributes);
      })
      .catch(err => console.log('ERROR SENDING EVENT ' + eventName, err));
  }
}

export async function recordInteractionEvent(
  eventName,
  attributes = {},
  metrics = {},
) {
  let userInfo = await Auth.currentUserInfo();
  if (!isOnline()) {
    userInfo = await AsyncStorage.getItem(asyncStorageConstants.userInfo);
  }
  console.log('INTERACTION EVENT', userInfo, eventName);
  if (userInfo && userInfo.attributes) {
    Analytics.record({
      name: eventName,
      attributes: {
        userName: userInfo && userInfo.attributes.name,
        userEmailId: userInfo && userInfo.attributes.email,
        network: isOnline() ? 'online' : 'offline',
        ...attributes,
      },
      metrics,
    })
      .then(res => {
        console.log('SUCCESSFULLY SENT EVENT ' + eventName, attributes);
      })
      .catch(err => console.log('ERROR SENDING EVENT ' + eventName, err));
  }
}
