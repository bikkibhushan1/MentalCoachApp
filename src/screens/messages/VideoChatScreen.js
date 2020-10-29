import React from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {
  TwilioVideoLocalView,
  TwilioVideoParticipantView,
  TwilioVideo,
} from 'react-native-twilio-video-webrtc';
import {
  requestMultiple,
  PERMISSIONS,
  openSettings,
  checkMultiple,
  RESULTS,
} from 'react-native-permissions';
import KeepAwake from 'react-native-keep-awake';
import BaseComponent from '../../components/BaseComponent';
import ThemeStyle from '../../styles/ThemeStyle';
import Dimensions, {windowDimensions} from '../../styles/Dimensions';
import TextStyles from '../../styles/TextStyles';
import {withStore} from '../../utils/StoreUtils';
import Loader from '../../components/Loader';
import VideoChatErrorModal from '../../modals/VideoChatErrorModal';
import Icon from '../../components/Icon';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  callContainer: {
    flex: 1,
    position: 'absolute',
    bottom: 0,
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  welcome: {
    fontSize: 30,
    textAlign: 'center',
    paddingTop: 40,
  },
  input: {
    height: 50,
    borderWidth: 1,
    marginRight: 70,
    marginLeft: 70,
    marginTop: 50,
    textAlign: 'center',
    backgroundColor: 'white',
  },
  button: {
    marginTop: 100,
  },
  localVideo: {
    width: '35%',
    height: '25%',
    position: 'absolute',
    right: Dimensions.screenMarginRegular,
    top: 32,
    backgroundColor: ThemeStyle.divider,
  },
  localVideoFull: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  remoteGrid: {
    flex: 1,
    alignItems: 'center',
  },
  optionsContainer: {
    position: 'absolute',
    left: 0,
    bottom: 12,
    right: 0,
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionButton: {
    width: 60,
    height: 60,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 100 / 2,
    backgroundColor: ThemeStyle.disabledLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

class VideoChatScreen extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      isAudioEnabled: true,
      isVideoEnabled: true,
      status: 'disconnected',
      permissionStatus: null,
      participants: new Map(),
      roomName: props.navigation.getParam('roomName', null),
      token: props.navigation.getParam('accessToken', null),
      isGroup: props.navigation.getParam('isGroup', true),
      isCoach: props.navigation.getParam('isCoach', false),
      coachId: props.navigation.getParam('coachId', null),
    };
    this.state.isCameraEnabled = !this.state.isGroup || this.state.isCoach;
  }

  componentDidMount() {
    this.checkPermissionsAndConnect();
  }

  checkPermissionsAndConnect = async () => {
    const {permissionStatus} = this.state;
    if (Platform.OS === 'ios') {
      return this._onConnectButtonPress();
    }
    if (permissionStatus === 'error') {
      return openSettings();
    }
    const permissions = Platform.select({
      android: [PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.RECORD_AUDIO],
      ios: [PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.MICROPHONE],
    });
    // let granted = this.checkPermissionStatus(await PermissionsAndroid.checkMultiple(permissions));
    // if (granted) {
    //   return this._onConnectButtonPress();
    // }
    let granted = this.checkPermissionStatus(
      await PermissionsAndroid.requestMultiple(permissions),
    );
    console.log('GRANTED', granted);
    if (granted) {
      this._onConnectButtonPress();
    } else {
      this.setState({permissionStatus: 'error'});
      this.errorModal.show({
        title: 'Grant Permissions',
        message: 'Please grant the requested permissions.',
      });
    }
  };

  checkPermissionStatus = statuses => {
    let granted = true;
    if (statuses) {
      Object.values(statuses).forEach(value => {
        console.log('RESULT', value);
        if (value !== RESULTS.GRANTED) {
          granted = false;
        }
      });
    } else {
      granted = false;
    }
    return granted;
  };

  _onConnectButtonPress = () => {
    this.refs.twilioVideo.connect({
      roomName: this.state.roomName,
      accessToken: this.state.token,
    });
  };

  _onEndButtonPress = () => {
    this.refs.twilioVideo.disconnect();
  };

  _onDisableCameraButtonPress = () => {
    this.refs.twilioVideo
      .setLocalVideoEnabled(!this.state.isCameraEnabled)
      .then(cameraDisabled => {
        this.setState({isCameraEnabled: cameraDisabled});
      });
  };

  _onMuteButtonPress = () => {
    this.refs.twilioVideo
      .setLocalAudioEnabled(!this.state.isAudioEnabled)
      .then(isEnabled => this.setState({isAudioEnabled: isEnabled}));
  };

  _onFlipButtonPress = () => {
    this.refs.twilioVideo.flipCamera();
  };

  _onRoomDidConnect = () => {
    console.log('ROOM CONNECTED');
    this.setState({status: 'connected'});
  };

  _onRoomDidDisconnect = ({roomName, error}) => {
    this.setState({status: 'disconnected'});
    if (error) {
      console.log('ERROR: ', error);
      if (this.errorModal) {
        this.errorModal.show({
          title: 'Connection Lost',
          message:
            'Your connection was interrupted. Please make sure you have a working internet connection',
        });
      }
    }
  };

  _onRoomDidFailToConnect = error => {
    console.log('ERROR: ', error);
    this.setState({status: 'disconnected'});
    if (this.errorModal) {
      this.errorModal.show({
        title: 'Connection Failed',
        message:
          'Could not connect you to the video session. Please make sure you have a working internet connection',
      });
    }
  };

  _onParticipantAddedVideoTrack = ({participant, track}) => {
    const {isGroup, coachId} = this.state;
    console.log('onParticipantAddedVideoTrack: ', participant, track);
    let currentVideoTrack = null;
    if (isGroup) {
      if (participant.identity === coachId) {
        currentVideoTrack = {
          participantSid: participant.sid,
          videoTrackSid: track.trackSid,
        };
      }
    } else {
      currentVideoTrack = {
        participantSid: participant.sid,
        videoTrackSid: track.trackSid,
      };
    }
    this.setState({currentVideoTrack});
  };

  _onParticipantRemovedVideoTrack = ({participant, track}) => {
    const {isGroup, coachId} = this.state;
    console.log('onParticipantRemovedVideoTrack: ', participant, track);
    let currentVideoTrack;
    if (isGroup) {
      if (participant.identity === coachId) {
        currentVideoTrack = null;
      }
    } else {
      currentVideoTrack = null;
    }
    this.setState({currentVideoTrack});
  };

  _onParticipantAddedAudioTrack = ({participant, track}) => {
    const {participants} = this.state;
    participants.set(participant.sid, participant);
    console.log('PARTICIPANT JOINED', participant);
    this.setState({
      participants,
    });
  };

  _onParticipantRemovedAudioTrack = ({participant, track}) => {
    const {participants} = this.state;
    participants.delete(participant.sid);
    console.log('PARTICIPANT JOINED', participant);
    this.setState({
      participants,
    });
  };

  onExit = () => {
    const {navigation} = this.props;
    this._onEndButtonPress();
    this.errorModal.hide();
    navigation.pop();
  };

  renderCurrentVideoTrack = () => {
    const {currentVideoTrack, isGroup, isCoach, participants} = this.state;
    if (currentVideoTrack) {
      return (
        <TwilioVideoParticipantView
          style={{
            width: windowDimensions.width,
            height: windowDimensions.height,
          }}
          key={currentVideoTrack.videoTrackSid}
          trackIdentifier={currentVideoTrack}
        />
      );
    }
    if (isGroup) {
      if (isCoach) {
        return null;
      }
    }
    return <Loader />;
  };

  render() {
    const {navigation, user} = this.props;
    const {status, isGroup, isCoach, participants} = this.state;
    return (
      <View style={ThemeStyle.pageContainer}>
        {status === 'disconnected' && <Loader />}
        {status === 'connected' && (
          <View style={styles.callContainer}>
            <KeepAwake />
            <View style={styles.remoteGrid}>
              {this.renderCurrentVideoTrack()}
            </View>
            <TwilioVideoLocalView
              enabled={this.state.isCameraEnabled}
              style={
                isGroup && isCoach
                  ? styles.localVideoFull
                  : isGroup
                  ? {width: 0, height: 0}
                  : styles.localVideo
              }
            />
            {isGroup && isCoach && (
              <View
                style={{
                  backgroundColor: ThemeStyle.mainColor,
                  paddingVertical: Dimensions.marginRegular,
                  paddingHorizontal: Dimensions.marginExtraLarge,
                  position: 'absolute',
                  borderRadius: Dimensions.r24,
                  top: 32,
                }}>
                <Text
                  style={{
                    ...TextStyles.GeneralTextBold,
                    color: ThemeStyle.white,
                    textAlign: 'center',
                  }}>{`${participants.size} users have joined`}</Text>
              </View>
            )}
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={this._onMuteButtonPress}>
                <Icon
                  name={
                    this.state.isAudioEnabled ? 'microphone' : 'microphone-off'
                  }
                  family="MaterialCommunityIcons"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, {backgroundColor: ThemeStyle.red}]}
                onPress={this.onExit}>
                <Icon
                  name={'call-end'}
                  family="MaterialIcons"
                  color={ThemeStyle.white}
                />
              </TouchableOpacity>
              {isGroup && isCoach && (
                <TouchableOpacity
                  style={[styles.optionButton]}
                  onPress={this._onDisableCameraButtonPress}>
                  <Icon
                    name={
                      this.state.isCameraEnabled
                        ? 'video-outline'
                        : 'video-off-outline'
                    }
                    family="MaterialCommunityIcons"
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.optionButton}
                onPress={this._onFlipButtonPress}>
                <Icon name="camera-front" family="MaterialCommunityIcons" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        <TwilioVideo
          ref="twilioVideo"
          onRoomDidConnect={this._onRoomDidConnect}
          onRoomDidDisconnect={this._onRoomDidDisconnect}
          onRoomDidFailToConnect={this._onRoomDidFailToConnect}
          onParticipantAddedVideoTrack={this._onParticipantAddedVideoTrack}
          onParticipantRemovedVideoTrack={this._onParticipantRemovedVideoTrack}
          onParticipantAddedAudioTrack={this._onParticipantAddedAudioTrack}
          onParticipantRemovedAudioTrack={this._onParticipantRemovedAudioTrack}
          onStatsReceived={data => {
            console.log('ON STATES', data);
          }}
        />
        {status !== 'connected' && (
          <TouchableOpacity
            onPress={this.onExit}
            style={{
              position: 'absolute',
              top: Dimensions.screenMarginRegular,
              right: Dimensions.screenMarginRegular,
            }}>
            <Image
              source={require('../../assets/images/cross.png')}
              style={{
                tintColor: '#000',
              }}
            />
          </TouchableOpacity>
        )}
        <VideoChatErrorModal
          ref={ref => {
            this.errorModal = ref;
          }}
          onRetryConnection={this.checkPermissionsAndConnect}
          onExit={this.onExit}
        />
      </View>
    );
  }
}

export default withStore(VideoChatScreen);
