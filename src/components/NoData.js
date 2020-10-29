import TextStyles from '../styles/TextStyles';
import {View, Text, Image} from 'react-native';
import React from 'react';
import ThemeStyle from '../styles/ThemeStyle';

export const NoData = props => (
  <View
    style={[
      {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      },
      props.style,
    ]}>
    <Image source={require('../assets/images/nothing_found-icon.png')} />

    <Text
      style={[
        TextStyles.GeneralText,
        {
          color: ThemeStyle.textExtraLight,
          textAlign: 'center',
        },
      ]}>
      {props.message ? props.message : 'No data found'}
    </Text>
  </View>
);
