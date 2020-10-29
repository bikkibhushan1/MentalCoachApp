import {Auth, Storage, Analytics} from 'aws-amplify';
import {APP} from '../../constants';
import {appsyncClient} from '../../../App';
import {getCoach, getUser, editUser} from '../../queries/user';
import store from '../store';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

export const ACTIONS = {
  SET_USER: 'SET_USER',
  UPDATE_USER: 'UPDATE_USER',
  SET_USER_IMAGE: 'SET_USER_IMAGE',
  CLEAR_USER_STATE: 'CLEAR_USER_STATE',
};

export const fetchUserDetails = (shouldBypassCache = false) => {
  return async dispatch => {
    try {
      let userCognito = await Auth.currentAuthenticatedUser({
        bypassCache: shouldBypassCache,
      });
      let user = {
        username: userCognito.username,
        attributes: userCognito.attributes,
      };
      // const name = data.name;
      // const email = data.email;
      // const phone_no = data.phone_number;
      // const address = data['custom:address'];
      // const imageName =
      //   data.picture && data.picture.indexOf('.xml') == -1 ? data.picture : '';
      // const phone_number_verified = data.phone_number_verified;
      // const email_verified = data.email_verified;
      console.log(
        'USER DATA',
        userCognito,
        userCognito.signInUserSession.idToken.payload['cognito:groups'],
      );
      // dispatch(fetchProfileImage(userCognito.attributes.picture));
      dispatch(fetchUserProfile());
      dispatch(setUser(user));
      return user;
    } catch (error) {
      console.log('ERROR FETCHING USER DETAILS', error);
      return null;
    }
  };
};

export const fetchProfileImage = userImage => {
  return async dispatch => {
    try {
      if (userImage && userImage.trim().length) {
        const uri = await Storage.get(userImage, {level: 'protected'});
        console.log('PROFILE IMAGE', uri);
        dispatch(setProfileImage(uri));
      } else {
        dispatch(setProfileImage(null));
      }
    } catch (err) {
      console.log('ERROR FETCHING PROFILE IMAGE', err);
    }
  };
};

export const fetchUserProfile = () => {
  return dispatch => {
    try {
      appsyncClient
        .watchQuery({
          query: getUser,
          fetchPolicy: 'cache-and-network',
        })
        .subscribe({
          next: async data => {
            console.log('USER PROFILE', data);
            if (data.loading && !data.data) {
              return;
            }
            if (data.data.getUser) {
              dispatch(updateUser(data.data.getUser));
            }
          },
          error: error => {
            console.log('ERROR FETCHING USER PROFILE', error);
          },
        });
    } catch (err) {
      console.log('ERROR FETCHING USER PROFILE', err);
    }
  };
};

export const editUserProfile = profile => {
  console.log('EDITING USER AWS PROFILE', profile);
  return dispatch => {
    return appsyncClient
      .mutate({
        mutation: editUser,
        variables: {
          user: profile,
        },
      })
      .then(data => {
        console.log('EDITED USER', data);
        if (data.data && data.data.editUser) {
          dispatch(updateUser(data.data.editUser));
          return data.data.editUser;
        }
        return null;
      })
      .catch(err => {
        console.log('ERROR EDITING USER PROFILE', err);
        return null;
      });
  };
};

export const updatePinpointEndpoint = async (address, type) => {
  try {
    const pinpointAddress = await AsyncStorage.getItem(type);
    if (JSON.parse(pinpointAddress) === address) {
      console.log('PINPOINT ID EXISTS', address);
      return;
    }
  } catch (err) {
    console.log(err);
  }
  const user = store.getState().user;
  if (!user) {
    console.log('Pinpoint update failed: no user');
    return;
  }
  console.log('UPDATING USER ENDPOINT', address);
  Analytics.updateEndpoint({
    address,
    userId: user.userId,
    userAttributes: {
      name: [user.name],
      email: [user.email],
      userId: [user.userId],
      // picture: [user.picture],
      gender: [user.gender],
      payment: [JSON.stringify(user.payment)],
      isMentor: [JSON.stringify(user.isMentor)],
      isCoach: [JSON.stringify(user.isCoach)],
    },
    channelType: Platform.OS === 'ios' ? 'APNS' : 'GCM',
    optOut: 'NONE',
  })
    .then(res => {
      AsyncStorage.setItem(type, JSON.stringify(address));
      console.log('updated endpoint', res);
    })
    .catch(err => {
      console.warn('failed to update endpoint', err);
    });
};

export const setUser = user => ({
  type: ACTIONS.SET_USER,
  payload: user,
});

export const updateUser = user => ({
  type: ACTIONS.UPDATE_USER,
  payload: user,
});

export const setProfileImage = imageUri => ({
  type: ACTIONS.SET_USER_IMAGE,
  payload: imageUri,
});

export const clearUserState = () => ({
  type: ACTIONS.CLEAR_USER_STATE,
});
