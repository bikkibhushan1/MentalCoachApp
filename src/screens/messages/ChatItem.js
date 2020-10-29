import React from 'react';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {Image, View, Text} from 'react-native';
import Dimensions from '../../styles/Dimensions';
import ThemeStyle from '../../styles/ThemeStyle';
import TextStyles from '../../styles/TextStyles';
import moment from 'moment';
import chatHelper from '../../services/twiio';
import S3Image from '../../components/S3Image';
import {s3ProtectionLevel} from '../../constants';
import {getCohortDates} from '../../utils';

export default class ChatItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      channelDetails: null,
      loading: true,
    };
  }

  async componentDidMount() {
    const {channel} = this.props;
    const channelDetails = await chatHelper.getChannelById(channel.channelId);
    const lastMessage = await chatHelper.getLastMessageForChannel(
      channelDetails,
    );
    let unreadCount = await channelDetails.getUnconsumedMessagesCount();
    if (typeof unreadCount !== 'number') {
      unreadCount = await channelDetails.getMessagesCount();
    }
    console.log('CHAT', channel, lastMessage);
    this.setState({
      channelDetails,
      lastMessage,
      unreadCount,
      loading: false,
    });
  }

  render() {
    const {channelDetails, lastMessage, loading, unreadCount} = this.state;
    const {navigation, showTopBorder, user, channel} = this.props;
    const channelDescription = getCohortDates(channel.cohort);
    return (
      <TouchableOpacity
        onPress={() => {
          this.setState({
            unreadCount: 0,
          });
          navigation.navigate('Chat', {
            channel,
            channelDetails,
            description: channelDescription,
          });
        }}
        style={{
          flexDirection: 'row',
          paddingHorizontal: Dimensions.marginRegular,
          paddingVertical: Dimensions.r24,
          borderTopColor: ThemeStyle.divider,
          borderTopWidth: showTopBorder ? Dimensions.r2 : 0,
        }}>
        <S3Image
          filePath={channel.displayImage}
          level={s3ProtectionLevel.PUBLIC}
          style={{
            width: Dimensions.r48,
            height: Dimensions.r48,
            borderRadius: Dimensions.r24,
            backgroundColor: ThemeStyle.divider,
          }}
          resizeMode="cover"
        />
        <View style={{marginHorizontal: Dimensions.marginRegular, flex: 1}}>
          <Text
            style={[TextStyles.SubHeader2, {color: ThemeStyle.mainColor}]}
            numberOfLines={1}>
            {channel.displayName}
          </Text>
          {channelDescription && (
            <Text
              style={[
                TextStyles.GeneralTextBold,
                {color: ThemeStyle.textLight},
              ]}
              numberOfLines={1}>
              {channelDescription}
            </Text>
          )}
          {!!lastMessage && (
            <Text
              style={[
                !unreadCount
                  ? TextStyles.GeneralText
                  : TextStyles.GeneralTextBold,
                {marginTop: Dimensions.marginSmall},
              ]}
              numberOfLines={1}>
              {lastMessage.author === user.userId
                ? 'Me'
                : lastMessage.attributes.senderName}
            </Text>
          )}
          <Text
            style={[
              !unreadCount
                ? TextStyles.GeneralText
                : TextStyles.GeneralTextBold,
              {
                color: !unreadCount
                  ? ThemeStyle.textLight
                  : ThemeStyle.textRegular,
              },
            ]}
            numberOfLines={1}>
            {loading ? '--' : lastMessage ? lastMessage.body : 'No messages'}
          </Text>
        </View>
        <Text
          style={{
            position: 'absolute',
            top: Dimensions.marginSmall,
            right: Dimensions.marginRegular,
            ...TextStyles.ContentText,
            color: ThemeStyle.textExtraLight,
          }}>
          {loading
            ? '--'
            : moment(channelDetails.dateUpdated).format('DD/MM/YYYY')}
        </Text>
        {!!unreadCount && (
          <View
            style={{
              position: 'absolute',
              top: Dimensions.r32,
              right: Dimensions.marginRegular,
              width: Dimensions.r28,
              height: Dimensions.r28,
              borderRadius: Dimensions.r16,
              justifyContent: 'center',
              alignItems: 'center',
              color: ThemeStyle.foreground,
              backgroundColor: ThemeStyle.mainColor,
            }}>
            <Text style={{color: ThemeStyle.white}}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }
}
