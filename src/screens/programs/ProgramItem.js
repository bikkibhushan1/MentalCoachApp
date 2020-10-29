import React from 'react';
import {TouchableOpacity, Text, View, Image} from 'react-native';
import Dimensions from '../../styles/Dimensions';
import ThemeStyle from '../../styles/ThemeStyle';
import TextStyles from '../../styles/TextStyles';
import {
  getDisplayPrice,
  getProgramDisplayType,
  getProgramDisplayDuration,
  isNullOrEmpty,
} from '../../utils';
import S3Image from '../../components/S3Image';
import {s3ProtectionLevel} from '../../constants';

export default ({
  program,
  index,
  onPress,
  imageStyle,
  titleStyle,
  style,
  hideBorder,
  fullDisplay,
}) => {
  if (!program || !program.name) {
    return null;
  }
  const Component = onPress ? TouchableOpacity : View;
  return (
    <Component
      onPress={onPress}
      style={[
        {
          flexDirection: 'row',
          paddingVertical: Dimensions.marginLarge,
          borderTopColor: ThemeStyle.disabledLight,
          borderTopWidth: index !== 0 && !hideBorder ? Dimensions.r1 : 0,
        },
        style,
      ]}>
      <View
        style={[
          {
            backgroundColor: ThemeStyle.red,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: Dimensions.r24,
            width: Dimensions.r48,
            height: Dimensions.r48,
            overflow: 'hidden',
          },
          imageStyle,
        ]}>
        {program.image ? (
          <S3Image
            filePath={program.image}
            level={s3ProtectionLevel.PUBLIC}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: ThemeStyle.disabledLight,
            }}
            resizeMode="cover"
          />
        ) : (
          <Text style={[TextStyles.GeneralTextBold, {color: ThemeStyle.white}]}>
            {program.name.substring(0, 2).toUpperCase()}
          </Text>
        )}
      </View>
      <View style={{marginLeft: Dimensions.marginRegular, flex: 1}}>
        <Text
          style={[
            TextStyles.Header2,
            {
              color: ThemeStyle.mainColor,
              marginRight: Dimensions.r48,
            },
            titleStyle,
          ]}
          numberOfLines={fullDisplay ? null : 2}>
          {program.name}
        </Text>
        <Text
          style={[
            TextStyles.GeneralTextBold,
            {
              color: ThemeStyle.textExtraLight,
              marginTop: Dimensions.marginExtraSmall,
            },
          ]}>{`${getProgramDisplayType(
          program.type,
        )}, ${getProgramDisplayDuration(program.duration)}`}</Text>
        {!isNullOrEmpty(program.description) && (
          <Text
            numberOfLines={fullDisplay ? null : 2}
            style={[
              TextStyles.GeneralText,
              {
                marginTop: Dimensions.marginRegular,
                flex: 1,
              },
            ]}>
            {program.description}
          </Text>
        )}
      </View>
      <Text
        style={
          ([TextStyles.GeneralTextBold],
          {
            color: ThemeStyle.green,
            position: 'absolute',
            right: Dimensions.marginRegular,
            top: Dimensions.marginLarge,
          })
        }>
        {getDisplayPrice(program.payment)}
      </Text>
    </Component>
  );
};
