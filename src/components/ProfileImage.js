import React from 'react';
import {TouchableOpacity, View, Image} from 'react-native';
import ThemeStyle from '../styles/ThemeStyle';
import Dimensions from '../styles/Dimensions';
import S3Image from './S3Image';
import {s3ProtectionLevel} from '../constants';

const ProfileImage = ({
  size,
  onPress,
  avatarSource,
  renderOverlay,
  style,
  placeHolder,
}) => {
  const Component = onPress ? TouchableOpacity : View;
  const imageSize = size || Dimensions.r96;
  return (
    <Component
      style={{
        backgroundColor: ThemeStyle.divider,
        margin: Dimensions.screenMarginRegular,
        borderRadius: imageSize / 2,
        width: imageSize,
        height: imageSize,
        justifyContent: 'center',
        alignItems: 'center',
        ...style,
      }}
      onPress={onPress}>
      <S3Image
        key={avatarSource ? 'image' : 'placeholder'}
        level={s3ProtectionLevel.PUBLIC}
        filePath={avatarSource}
        placeHolder={
          placeHolder || require('../assets/images/image-placeholder.png')
        }
        style={{
          width: imageSize,
          height: imageSize,
          borderRadius: imageSize / 2,
        }}
      />
      {renderOverlay && renderOverlay()}
    </Component>
  );
};
export default ProfileImage;
