import React from 'react';
import {View} from 'react-native';
import {s3ProtectionLevel} from '../constants';
import S3Image from './S3Image';
import LinearGradient from 'react-native-linear-gradient';
import ThemeStyle from '../styles/ThemeStyle';

export default ({program}) => {
  return program.image ? (
    <S3Image
      key={program.image}
      filePath={program.image}
      level={s3ProtectionLevel.PUBLIC}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000',
        overflow: 'hidden',
      }}
      resizeMode="cover">
      <View
        style={{
          width: '100%',
          height: '1000%',
          backgroundColor: '#000a',
        }}
      />
    </S3Image>
  ) : (
    <LinearGradient
      colors={program.gradient || ThemeStyle.defaultProgramGradient}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    />
  );
};
