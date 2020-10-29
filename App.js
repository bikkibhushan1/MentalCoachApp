import React, {Component} from 'react';
import {Provider} from 'react-redux';
import {UIManager} from 'react-native';
import store from './src/redux/store';
import AppWithNavigationState from './src/navigators/AppNavigator';
import Amplify, {Auth} from 'aws-amplify';
import {ApolloProvider} from 'react-apollo';
import AWSAppSyncClient from 'aws-appsync';
import {getEnvVars} from './src/constants';
import {
  addNetworkChangeListener,
  removeNetworkChangeListener,
} from './src/utils/NetworkUtils';
import AsyncStorage from '@react-native-community/async-storage';
import {fetch as fetchPolyfill} from 'whatwg-fetch';

global.fetch = fetchPolyfill;
navigator.geolocation = require('@react-native-community/geolocation');

Amplify.configure(getEnvVars().awsConfig);
UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

export const appsyncClient = new AWSAppSyncClient({
  url: getEnvVars().APP_SYNC_URL,
  region: getEnvVars().Region,
  auth: {
    type: getEnvVars().AuthMode,
    jwtToken: async () =>
      (await Auth.currentSession()).getIdToken().getJwtToken(),
  },
  // disableOffline: true,
  offlineConfig: {
    keyPrefix: 'act',
    callback: (err, succ) => {
      if (err) {
        const {mutation, variables} = err;

        console.warn(`ERROR for ${mutation}`, err);
      } else {
        const {mutation, variables} = succ;
        console.info(`SUCCESS for ${mutation}`, succ);
      }
    },
    storage: AsyncStorage,
  },
});

export const swasthCommonsClient = new AWSAppSyncClient({
  url: getEnvVars().SWASTH_COMMONS_ENDPOINT_URL,
  region: getEnvVars().Region,
  auth: {
    type: getEnvVars().AuthMode,
    jwtToken: async () =>
      (await Auth.currentSession()).getIdToken().getJwtToken(),
  },
  offlineConfig: {
    keyPrefix: 'swasthCommon',
    callback: (err, succ) => {
      if (err) {
        const {mutation, variables} = err;
        console.warn(`ERROR for ${mutation}`, err);
      } else {
        const {mutation, variables} = succ;
        console.info(`SUCCESS for ${mutation}`, succ);
      }
    },
    storage: AsyncStorage,
  },
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    console.disableYellowBox = true;
  }

  componentDidMount() {
    addNetworkChangeListener();
  }

  componentWillUnmount() {
    removeNetworkChangeListener();
  }

  render() {
    return (
      <ApolloProvider client={appsyncClient}>
        <Provider store={store}>
          <AppWithNavigationState />
        </Provider>
      </ApolloProvider>
    );
  }
}

export default App;
