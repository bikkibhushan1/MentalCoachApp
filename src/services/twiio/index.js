import {Client as TwilioChatClient} from 'twilio-chat';
import 'react-native';
import {appsyncClient} from '../../../App';
import {getTwilioToken} from '../../queries/messages';
import Log from './js/logging';
import ApnsSupport from './js/ApnsSupportModule';
import FirebaseSupport from './js/FirebaseSupportModule';
import {Platform} from 'react-native';

var GENERAL_CHANNEL_UNIQUE_NAME = 'general';
var GENERAL_CHANNEL_NAME = 'General Channel';
var MESSAGES_HISTORY_LIMIT = 20;

class ChatClientHelper {
  client: TwilioChatClient;
  generalChannel;
  currentChannel;

  constructor() {
    this.client = null;
    this.log = new Log();
  }

  async login() {
    let pushChannel, registerForPushCallback, showPushCallback;
    if (Platform.OS === 'ios') {
      pushChannel = 'apns';
      registerForPushCallback = ApnsSupport.registerForPushCallback;
      showPushCallback = ApnsSupport.showPushCallback;
    } else {
      pushChannel = 'fcm';
      registerForPushCallback = FirebaseSupport.registerForPushCallback;
      showPushCallback = FirebaseSupport.showPushCallback;
    }
    try {
      const token = await this.getToken();
      this.client = await TwilioChatClient.create(token);
      this.client.on('tokenAboutToExpire', async () => {
        const token = await this.getToken();
        this.client.updateToken(token);
      });
      // this.client.on('pushNotification', obj => {
      //   if (obj && showPushCallback) {
      //     showPushCallback(this.log, obj);
      //   }
      // });
      this.subscribeToAllChatClientEvents();
      if (registerForPushCallback) {
        registerForPushCallback(new Log(), this.client);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async getToken() {
    try {
      const data = await appsyncClient.query({
        query: getTwilioToken,
        variables: {
          device: Platform.OS === 'android' ? 'ANDROID' : 'IOS',
        },
        fetchPolicy: 'no-cache',
      });
      if (
        data.data &&
        data.data.getTwilioToken &&
        data.data.getTwilioToken.token
      ) {
        console.log('GENERATED TWILIO TOKEN', data.data.getTwilioToken);
        return data.data.getTwilioToken.token;
      } else {
        console.log('ERROR FETCHING TWILIO TOKEN', data);
      }
    } catch (err) {
      console.log('ERROR FETCHING TWILIO TOKEN', err);
    }
  }

  async loadChannelList(handler) {
    if (!this.client) {
      console.log('Client is not initialized');
      return null;
    }
    const channels = await this.client.getPublicChannelDescriptors();
    console.log('RECEIVED CHANNELS', channels);
    if (typeof handler === 'function') {
      handler();
    }
    return channels.items;
  }

  joinGeneralChannel() {
    console.log('Attempting to join "general" chat channel...');
    if (!this.generalChannel) {
      // If it doesn't exist, let's create it
      this.client
        .createChannel({
          uniqueName: GENERAL_CHANNEL_UNIQUE_NAME,
          friendlyName: GENERAL_CHANNEL_NAME,
        })
        .then(function(channel) {
          console.log('Created general channel');
          this.generalChannel = channel;
          this.loadChannelList(this.joinGeneralChannel);
        });
    } else {
      console.log('Found general channel:');
      this.setupChannel(this.generalChannel);
    }
  }

  async getChannelById(id) {
    if (!id) {
      return console.log('channel Id not specified');
    }
    return await this.client.getChannelBySid(id);
  }

  initChannel(channel) {
    console.log('Initialized channel ' + channel.friendlyName);
    return this.client.getChannelBySid(channel.sid);
  }

  joinChannel(_channel) {
    return _channel
      .join()
      .then(function(joinedChannel) {
        console.log('Joined channel ' + joinedChannel);
        return joinedChannel;
      })
      .catch(function(err) {
        if (_channel.status === 'joined') {
          return _channel;
        }
        console.error(
          "Couldn't join channel " +
            _channel.friendlyName +
            ' because -> ' +
            err,
        );
      });
  }

  initChannelEvents(events) {
    console.log(this.currentChannel.friendlyName + ' ready.');
    this.channelEvents = events;
    Object.keys(events).forEach(key => {
      this.currentChannel.on(key, events[key]);
    });
    // this.currentChannel.on('messageAdded', events.messageAdded);
    // this.currentChannel.on('typingStarted', events.typingStarted);
    // this.currentChannel.on('typingEnded', events.typingEnded);
    // this.currentChannel.on('memberJoined', events.memberJoined);
    // this.currentChannel.on('memberLeft', events.memberLeft);
  }

  clearCurrentChannel() {
    if (!this.currentChannel) {
      console.log('No channel setup');
    }
    this.channelEvents &&
      Object.keys(this.channelEvents).forEach(key => {
        this.currentChannel.removeListener(key, this.channelEvents[key]);
      });
    this.channelEvents = null;
    this.currentChannel = null;
  }

  async setupChannel(id, events) {
    console.log('SETTING UP CHANNEL', id);
    this.clearCurrentChannel();
    const _channel = await this.getChannelById(id);
    const joinedChannel = await this.joinChannel(_channel);
    this.currentChannel = joinedChannel;
    this.initChannelEvents(events);
    return joinedChannel;
  }

  loadMessages(index) {
    return this.currentChannel
      .getMessages(MESSAGES_HISTORY_LIMIT, index)
      .then(function(messages) {
        console.log('RECEIVED MESSAGES', messages);
        return messages;
      });
  }

  async getLastMessageForChannel(channel) {
    if (!channel || typeof channel.getMessages !== 'function') {
      console.log('INVALID ARGUMENT TO LAST MESSAGE', channel);
      return;
    }
    const lastMessage = await channel.getMessages(1);
    console.log('LAST MESSAGE', lastMessage);
    return !!lastMessage.items.length && lastMessage.items[0];
  }

  leaveCurrentChannel() {
    if (this.currentChannel) {
      return this.currentChannel.leave().then(leftChannel => {
        console.log('left ' + leftChannel.friendlyName);
        this.clearCurrentChannel();
      });
    } else {
      return Promise.resolve();
    }
  }

  deleteCurrentChannel() {
    if (!this.currentChannel) {
      return;
    }

    if (this.currentChannel.sid === this.generalChannel.sid) {
      alert('You cannot delete the general channel');
      return;
    }

    this.currentChannel.delete().then(function(channel) {
      console.log('channel: ' + channel.friendlyName + ' deleted');
      setupChannel(this.generalChannel);
    });
  }

  sortChannelsByName(channels) {
    return channels.sort(function(a, b) {
      if (a.friendlyName === GENERAL_CHANNEL_NAME) {
        return -1;
      }
      if (b.friendlyName === GENERAL_CHANNEL_NAME) {
        return 1;
      }
      return a.friendlyName.localeCompare(b.friendlyName);
    });
  }

  sendMessage(message, attributes) {
    console.log('SENDING MESSAGE', message, attributes);
    this.currentChannel.sendMessage(message, attributes);
  }

  markChannelRead() {
    if (!this.currentChannel) {
      return console.log('No current channel');
    }
    this.currentChannel.setAllMessagesConsumed();
  }

  subscribeToAllChatClientEvents() {
    this.client.on('tokenAboutToExpire', obj =>
      this.log.event('ChatClientHelper.client', 'tokenAboutToExpire', obj),
    );
    this.client.on('tokenExpired', obj =>
      this.log.event('ChatClientHelper.client', 'tokenExpired', obj),
    );

    this.client.on('userSubscribed', obj =>
      this.log.event('ChatClientHelper.client', 'userSubscribed', obj),
    );
    this.client.on('userUpdated', obj =>
      this.log.event('ChatClientHelper.client', 'userUpdated', obj),
    );
    this.client.on('userUnsubscribed', obj =>
      this.log.event('ChatClientHelper.client', 'userUnsubscribed', obj),
    );

    // this.client.on('channelAdded', obj =>
    //   this.log.event('ChatClientHelper.client', 'channelAdded', obj),
    // );
    // this.client.on('channelRemoved', obj =>
    //   this.log.event('ChatClientHelper.client', 'channelRemoved', obj),
    // );
    // this.client.on('channelInvited', obj =>
    //   this.log.event('ChatClientHelper.client', 'channelInvited', obj),
    // );
    // this.client.on('channelJoined', obj => {
    //   this.log.event('ChatClientHelper.client', 'channelJoined', obj);
    //   obj.getMessages(1).then(messagesPaginator => {
    //     messagesPaginator.items.forEach(message => {
    //       this.log.info(
    //         'ChatClientHelper.client',
    //         obj.sid + ' last message sid ' + message.sid,
    //       );
    //     });
    //   });
    // });
    // this.client.on('channelLeft', obj =>
    //   this.log.event('ChatClientHelper.client', 'channelLeft', obj),
    // );
    // this.client.on('channelUpdated', obj =>
    //   this.log.event('ChatClientHelper.client', 'channelUpdated', obj),
    // );

    // this.client.on('memberJoined', obj =>
    //   this.log.event('ChatClientHelper.client', 'memberJoined', obj),
    // );
    // this.client.on('memberLeft', obj =>
    //   this.log.event('ChatClientHelper.client', 'memberLeft', obj),
    // );
    // this.client.on('memberUpdated', obj =>
    //   this.log.event('ChatClientHelper.client', 'memberUpdated', obj),
    // );

    // this.client.on('messageAdded', obj =>
    //   this.log.event('ChatClientHelper.client', 'messageAdded', obj),
    // );
    // this.client.on('messageUpdated', obj =>
    //   this.log.event('ChatClientHelper.client', 'messageUpdated', obj),
    // );
    // this.client.on('messageRemoved', obj =>
    //   this.log.event('ChatClientHelper.client', 'messageRemoved', obj),
    // );

    // this.client.on('typingStarted', obj =>
    //   this.log.event('ChatClientHelper.client', 'typingStarted', obj),
    // );
    // this.client.on('typingEnded', obj =>
    //   this.log.event('ChatClientHelper.client', 'typingEnded', obj),
    // );

    // this.client.on('connectionStateChanged', obj =>
    //   this.log.event('ChatClientHelper.client', 'connectionStateChanged', obj),
    // );

    this.client.on('pushNotification', obj =>
      this.log.event('ChatClientHelper.client', 'onPushNotification', obj),
    );
  }
}

const chatHelper = new ChatClientHelper();
export default chatHelper;
