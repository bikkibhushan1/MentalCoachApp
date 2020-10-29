import React, {Component} from 'react';
import {
  BackHandler,
  View,
  Modal,
  ActivityIndicator,
  AppState,
  Easing,
  Animated,
  Platform,
} from 'react-native';
import {connect} from 'react-redux';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import Routes from './routes';
import {createAppContainer, NavigationActions} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import FlashMessage, {showMessage} from 'react-native-flash-message';
import {configure} from '../utils/NotificationUtils';
import OfflineModal, {setOfflineModal} from '../modals/OfflineModal';
import 'react-native-gesture-handler';
import UpdateModal from '../modals/UpdateModal';
import {chatTypes} from '../constants';
import {
  resetToChat,
  resetToProgramDetails,
  resetToSessionDetails,
} from './actions';
import {updatePinpointEndpoint} from '../redux/actions/UserActions';
import {withStore} from '../utils/StoreUtils';
import {fetchFullProgram} from '../redux/actions/CreateProgramActions';

let SlideFromRight = (index, position, width) => {
  const inputRange = [index - 1, index, index + 1];
  const translateX = position.interpolate({
    inputRange: [index - 1, index, index + 1],
    outputRange: [width, 0, 0],
  });
  const slideFromRight = {transform: [{translateX}]};
  return slideFromRight;
};

//Transition configurations for createStackNavigator
const TransitionConfiguration = () => {
  return {
    transitionSpec: {
      duration: 750,
      easing: Easing.out(Easing.poly(4)),
      timing: Animated.timing,
      useNativeDriver: true,
    },
    screenInterpolator: sceneProps => {
      const {layout, position, scene} = sceneProps;
      const width = layout.initWidth;
      const {index} = scene;
      return SlideFromRight(index, position, width);
    },
  };
};

const Stack = createStackNavigator(Routes, {
  transitionConfig: TransitionConfiguration,
  headerMode: 'none',
});
export const AppNavigator = createAppContainer(Stack);

class AppWithNavigationState extends Component {
  constructor(props) {
    super(props);
    this.state = {appState: AppState.currentState};
  }

  componentWillUnmount() {
    // BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
  }

  logout = () => {
    BackHandler.exitApp();
  };

  componentDidMount() {
    configure(token => {
      console.log('received push token', token);
    }, this.handleNotificationClick);
    AppState.addEventListener('change', nextState => {
      console.log('NEXT STATE', nextState);
      console.log('CURRENT STATE', this.state.appState);
      if (this.state.appState === 'background' && nextState === 'active') {
        console.log('APP HAS COME TO FOREGROUND');
      } else if (
        this.state.appState.match(/inactive|active/) &&
        nextState === 'background'
      ) {
      }
      this.setState({appState: nextState});
    });
  }

  handleNotificationClick = notification => {
    console.log('NOTIFICATION CLICK', notification);
    const {setLoading} = this.props;
    if (notification.foreground) {
      // if (Platform.OS === 'ios') {
      //   if (notification.data && notification.data.twi_message_type) {
      //     showMessage({type: 'success', message: notification.message.body});
      //   }
      // }
    }
    if (notification.userInteraction) {
      let data = Platform.OS === 'ios' ? notification.data : notification;
      if (data && data['pinpoint.jsonBody']) {
        const pinpointData = JSON.parse(data['pinpoint.jsonBody']);
        console.log('Pinpont data:', pinpointData);
        if (pinpointData.sessionId) {
          setLoading(true);
          fetchFullProgram(pinpointData.programId, fullProgram => {
            setLoading(false);
            console.log('received program', fullProgram);
            if (fullProgram) {
              if (fullProgram.sessions && fullProgram.sessions.length) {
                fullProgram.sessions.forEach(session => {
                  if (session.id === pinpointData.sessionId) {
                    this.navigateWithDelay(
                      resetToSessionDetails(fullProgram.program, session),
                    );
                  }
                });
              }
            }
          });
        } else if (pinpointData.programId) {
          this.navigateWithDelay(
            resetToProgramDetails({
              id: pinpointData.programId,
            }),
          );
        }
      }
      if (data && data.twi_message_type) {
        let channelId = data.channel_id;
        let body =
          Platform.OS === 'ios'
            ? notification.message.body
            : notification.message;
        let displayName = body.split(':')[0];
        this.navigateWithDelay(
          resetToChat({
            channelId,
            displayName,
            // channelType: chatTypes[notification.chatType],
          }),
        );
      }
    }
    notification.finish(PushNotificationIOS.FetchResult.NoData);
  };

  navigateWithDelay = action => {
    if (this.navigator) {
      this.navigator.dispatch(action);
    } else {
      setTimeout(() => {
        if (this.navigator) {
          this.navigator.dispatch(action);
        }
      }, 3000);
    }
  };

  render() {
    return (
      <React.Fragment>
        <View style={{flex: 1}}>
          <AppNavigator
            ref={navigationRef => {
              this.navigator = navigationRef;
            }}
          />
          <OfflineModal
            ref={ref => {
              setOfflineModal(ref);
            }}
            onBack={() => {
              this.navigator.dispatch(NavigationActions.back({}));
            }}
          />
          <UpdateModal />
        </View>
        <FlashMessage position="top" />
        {this.props.loading && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              flexDirection: 'column',
              justifyContent: 'space-around',
              backgroundColor: '#000000aa',
              zIndex: 1000,
            }}>
            <ActivityIndicator animating={this.props.loading} size="large" />
          </View>
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  loading: state.app.isLoading,
});

export default withStore(AppWithNavigationState, mapStateToProps);
