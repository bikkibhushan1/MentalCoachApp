import React from 'react';
import {View, FlatList, Keyboard} from 'react-native';
import BaseComponent from '../../components/BaseComponent';
import ThemeStyle from '../../styles/ThemeStyle';
import Header from '../../components/Header';
import MessageInput from './MessageInput';
import {NoData} from '../../components/NoData';
import MessageItem from './MessageItem';
import chatHelper from '../../services/twiio';
import {showMessage} from 'react-native-flash-message';
import {withStore} from '../../utils/StoreUtils';
import _ from 'lodash';
import Loader from '../../components/Loader';
import Dimensions from '../../styles/Dimensions';
import {chatTypes} from '../../constants';

class ChatScreen extends BaseComponent {
  constructor(props) {
    super(props);
    const channel = props.navigation.getParam('channel', {});
    this.state.channel = channel;
    this.state.description = props.navigation.getParam('description', null);
    this.state.chatMessages = [];
    this.state.topSafeArea = ThemeStyle.foreground;
    this.state.bottomSafeArea = ThemeStyle.divider;
    this.state.loading = true;
    this.hasMoreMessages = false;
  }

  async componentDidMount() {
    const {channel} = this.state;
    await chatHelper.setupChannel(channel.channelId, {
      messageAdded: message => {
        this.setState(prevState => ({
          chatMessages: [message, ...prevState.chatMessages],
          refreshData: !prevState.refreshData,
        }));
      },
    });
    this.fetchMessages();
  }

  componentWillUnmount() {
    chatHelper.markChannelRead();
    chatHelper.clearCurrentChannel();
  }

  fetchMessages = async () => {
    this.setState({loading: true});
    const {lastIndex} = this.state;
    const messages = await chatHelper.loadMessages(lastIndex);
    const chatMessages = _.cloneDeep(messages.items).reverse();
    this.hasMoreMessages = messages.hasPrevPage;
    this.setState(prevState => ({
      chatMessages: [...prevState.chatMessages, ...chatMessages],
      refreshData: !prevState.refreshData,
      lastIndex:
        chatMessages.length && chatMessages[chatMessages.length - 1].index - 1,
      loading: false,
    }));
  };

  sendMessage = () => {
    const {user} = this.props;
    if (this.messageInput && this.messageInput.length) {
      Keyboard.dismiss();
      chatHelper.sendMessage(this.messageInput, {senderName: user.name});
      this.textInput.clear();
      this.messageInput = null;
    } else {
      showMessage({
        type: 'danger',
        message: 'Please enter a message',
      });
    }
  };

  render() {
    const {
      chatMessages,
      refreshData,
      loading,
      channel,
      description,
    } = this.state;
    const {user, navigation} = this.props;
    return this.renderWithSafeArea(
      <View
        style={[
          ThemeStyle.pageContainer,
          {backgroundColor: ThemeStyle.foreground},
        ]}>
        <Header
          title={channel.displayName}
          description={description}
          navBarStyle={{backgroundColor: ThemeStyle.foreground}}
          goBack={() => {
            navigation.pop();
          }}
        />
        <View style={{flex: 1}}>
          {(chatMessages && chatMessages.length) || loading ? (
            <FlatList
              ListFooterComponent={
                loading ? (
                  <View style={{padding: Dimensions.marginRegular}}>
                    <Loader />
                  </View>
                ) : null
              }
              inverted
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{paddingVertical: 24}}
              data={chatMessages}
              extraData={refreshData}
              keyExtractor={item => item.sid}
              renderItem={({item}) => (
                <MessageItem
                  chatMessage={item}
                  userId={user.userId}
                  userName={user.name}
                  showNickName={channel.channelType !== chatTypes.DIRECT}
                  //   group={group}
                  //   nickname={}
                />
              )}
              onEndReached={info => {
                const {loading} = this.state;
                if (this.hasMoreMessages && !loading) {
                  this.fetchMessages();
                } else {
                  console.log(
                    'info: No more mesg to display, chat screen open!',
                  );
                }
              }}
              onEndReachedThreshold={0.1}
            />
          ) : (
            <NoData message="Send a message to chat" header="No messages" />
          )}
          <MessageInput
            setRef={textInput => {
              this.textInput = textInput;
            }}
            placeholder="Enter Message"
            onChangeText={text => {
              this.messageInput = text;
            }}
            onSend={this.sendMessage}
          />
        </View>
      </View>,
    );
  }
}

export default withStore(ChatScreen);
