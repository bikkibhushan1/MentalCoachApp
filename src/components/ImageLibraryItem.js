import React from 'react';
import Dimensions, {windowDimensions} from '../styles/Dimensions';
import ThemeStyle from '../styles/ThemeStyle';
import {s3ProtectionLevel} from '../constants';
import S3Image from './S3Image';
import {Image, TouchableOpacity} from 'react-native';

export default ({item, onPress, isSelected}) => {
  return (
    <TouchableOpacity
      key={item}
      onPress={onPress}
      style={{
        borderRadius: Dimensions.r16,
        width: windowDimensions.width / 3.6,
        height: windowDimensions.width / 3.6,
        borderColor: ThemeStyle.mainColor,
        borderWidth: isSelected ? Dimensions.r2 : 0,
        backgroundColor: ThemeStyle.foreground,
        marginRight: Dimensions.marginSmall,
        marginBottom: Dimensions.marginSmall,
        overflow: 'hidden',
      }}>
      <S3Image
        style={{width: '100%', height: '100%'}}
        filePath={item}
        level={s3ProtectionLevel.PROTECTED}
      />
      {isSelected && (
        <Image
          style={{
            position: 'absolute',
            right: Dimensions.marginSmall,
            bottom: Dimensions.marginSmall,
          }}
          source={require('../assets/images/selected-icon.png')}
        />
      )}
    </TouchableOpacity>
  );
};
