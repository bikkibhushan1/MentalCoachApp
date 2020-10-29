import React from 'react';
import {TouchableOpacity} from 'react-native';
import ThemeStyle from '../styles/ThemeStyle';
import Icon from './Icon';

export default props => (
  <TouchableOpacity
    style={[
      {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: ThemeStyle.accentColor,
        justifyContent: 'center',
        alignItems: 'center',
      },
      props.style,
    ]}
    onPress={props.onPress}>
    <Icon
      family={props.iconFamily || 'MaterialCommunityIcons'}
      name={props.iconName || 'plus'}
      color="#fff"
      size={24}
    />
  </TouchableOpacity>
);
