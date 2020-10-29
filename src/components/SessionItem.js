import React from 'react';
import {TouchableOpacity, View, Text, Image} from 'react-native';
import ThemeStyle from '../styles/ThemeStyle';
import TextStyles from '../styles/TextStyles';
import {getSessionTypeDetails} from '../utils';
import Dimensions from '../styles/Dimensions';
import {sessionTypes} from '../constants';
import moment from 'moment';

export default ({session, onPress, index}) => {
  const isTask = session.type === sessionTypes.TASK;
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingVertical: Dimensions.marginExtraLarge,
        marginLeft: Dimensions.marginExtraLarge,
        borderTopColor: ThemeStyle.disabledLight,
        borderTopWidth: index === 0 ? 0 : Dimensions.r2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      <View>
        <Text style={[TextStyles.SubHeader2]}>{session.name}</Text>
        {session.description && (
          <Text style={TextStyles.GeneralText}>{session.description}</Text>
        )}
        {!isTask && (
          <Text
            style={[
              TextStyles.ContentText,
              {marginTop: Dimensions.marginExtraSmall},
            ]}>
            {moment(session.startDate).format('hh:mm A')}
          </Text>
        )}
      </View>
      <View>
        {isTask ? (
          <Text style={TextStyles.ContentText}>
            {moment(session.startDate).format('hh:mm A')}
          </Text>
        ) : (
          <Image
            style={{
              width: Dimensions.r24,
              height: Dimensions.r24,
              marginTop: Dimensions.marginSmall,
              marginLeft: Dimensions.marginLarge,
              tintColor: getSessionTypeDetails(session.type).tintColor,
            }}
            source={getSessionTypeDetails(session.type).image}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};
