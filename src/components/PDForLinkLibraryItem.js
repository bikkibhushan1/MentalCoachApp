import React from 'react';
import {TouchableOpacity, Text, Image} from 'react-native';
import Dimensions from '../styles/Dimensions';
import ThemeStyle from '../styles/ThemeStyle';
import TextStyles from '../styles/TextStyles';
import {uploadTypes} from '../constants';
import {getFileDetailsFromUrl} from '../utils';
import Icon from './Icon';

export default ({onPress, item, onDelete, isSelected, type}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        flexDirection: 'row',
        borderRadius: Dimensions.r16,
        backgroundColor: ThemeStyle.foreground,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Dimensions.marginLarge,
        marginBottom: Dimensions.marginRegular,
      }}>
      <Text
        style={{
          ...TextStyles.GeneralTextBold,
          color: isSelected ? ThemeStyle.mainColor : ThemeStyle.textRegular,
        }}>
        {type === uploadTypes.PDF ? getFileDetailsFromUrl(item).fileName : item}
      </Text>
      {onDelete && (
        <TouchableOpacity style={{paddingHorizontal: 12}} onPress={onDelete}>
          <Icon
            name="ios-trash"
            size={24}
            color={ThemeStyle.red}
            family="Ionicons"
          />
        </TouchableOpacity>
      )}
      {isSelected && (
        <Image source={require('../assets/images/selected-icon.png')} />
      )}
    </TouchableOpacity>
  );
};
