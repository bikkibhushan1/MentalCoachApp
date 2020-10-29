import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import ThemeStyle from '../../styles/ThemeStyle';
import TextStyles from '../../styles/TextStyles';
import moment from 'moment';
import {stringToColour} from '../../utils';

export default class MessageItem extends React.Component {
  shouldComponentUpdate(nextProps) {
    return (
      nextProps.chatMessage.sid !== this.props.chatMessage.sid ||
      nextProps.chatMessage.body !== this.props.chatMessage.body
    );
  }

  render() {
    const {
      chatMessage,
      userId,
      nickname,
      messageExtractor,
      showNickName,
    } = this.props;
    const isSentMessage = userId === chatMessage.author;

    return (
      <View
        style={
          isSentMessage
            ? styles.sentMessageContainer
            : styles.receivedMessageContainer
        }>
        {/* {!isSentMessage && (
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 24,
              marginRight: 8,
              backgroundColor: stringToColour(chatMessage.author) + '33',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={[TextStyles.SubHeader2]}>
              {nickname
                ? nickname[0]
                : chatMessage.attributes &&
                  chatMessage.attributes.senderName &&
                  chatMessage.attributes.senderName[0]}
            </Text>
          </View>
        )} */}
        <View
          style={[
            isSentMessage ? styles.sentMessage : styles.receivedMessage,
            {
              backgroundColor: isSentMessage
                ? ThemeStyle.mainColor
                : ThemeStyle.divider,
            },
          ]}>
          {!isSentMessage && showNickName && (
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text
                style={[
                  TextStyles.GeneralText,
                  {fontWeight: 'bold', minWidth: 100},
                ]}>
                {nickname
                  ? nickname
                  : chatMessage.attributes && chatMessage.attributes.senderName}
              </Text>
              {/* <Text style={TextStyles.FooterText}>
                  {moment(chatMessage.createdAt).format("DD MMM, hh:mm A")}
              </Text> */}
            </View>
          )}
          <Text
            style={[
              TextStyles.GeneralText,
              {
                color: !isSentMessage
                  ? ThemeStyle.textRegular
                  : ThemeStyle.white,
              },
            ]}>
            {messageExtractor
              ? messageExtractor(chatMessage)
              : chatMessage.body}
          </Text>
          <Text
            style={[
              TextStyles.FooterText,
              {
                marginTop: 2,
                position: 'absolute',
                top: -18,
                right: 6,
                color: ThemeStyle.textLight,
              },
            ]}>
            {moment(chatMessage.timestamp).format('DD MMM, hh:mm A')}
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  receivedMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 32,
    marginHorizontal: 12,
  },
  sentMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 32,
    marginHorizontal: 12,
  },
  receivedMessage: {
    backgroundColor: ThemeStyle.accentColorTransparent,
    // borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    minHeight: 32,
    minWidth: 130,
    maxWidth: '80%',
    padding: 20,
  },
  sentMessage: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 12,
    // borderBottomRightRadius: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    minHeight: 32,
    minWidth: 130,
    maxWidth: '80%',
    padding: 20,
  },
});
