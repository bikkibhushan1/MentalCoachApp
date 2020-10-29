import React from 'react';
import {TouchableOpacity, Text, View, Image, ScrollView} from 'react-native';
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
import {s3ProtectionLevel, programTypes} from '../../constants';
import moment from 'moment';

const renderCoCoaches = program => {
  const {coCoach: coCoaches, coach} = program;
  const programCoaches = [];
  if (coach) {
    programCoaches.push(coach);
  }
  if (coCoaches && coCoaches.length) {
    programCoaches.push(...coCoaches);
  }
  if (!programCoaches.length) {
    return null;
  }
  return (
    <ScrollView
      horizontal
      overScrollMode="never"
      showsHorizontalScrollIndicator={false}>
      {programCoaches.map(coCoach => (
        <View
          style={{
            flexDirection: 'row',
            marginTop: Dimensions.marginSmall,
            marginRight: Dimensions.r32,
            alignItems: 'center',
          }}>
          <View
            style={[
              {
                backgroundColor: ThemeStyle.red,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: Dimensions.r16,
                width: Dimensions.r32,
                height: Dimensions.r32,
                overflow: 'hidden',
              },
            ]}>
            {coCoach.picture ? (
              <S3Image
                filePath={coCoach.picture}
                level={s3ProtectionLevel.PUBLIC}
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: ThemeStyle.disabledLight,
                }}
                resizeMode="cover"
              />
            ) : (
              <Text
                style={[TextStyles.GeneralTextBold, {color: ThemeStyle.white}]}>
                {coCoach.name.substring(0, 2).toUpperCase()}
              </Text>
            )}
          </View>
          <Text
            style={[
              TextStyles.GeneralText,
              {marginLeft: Dimensions.marginSmall, color: ThemeStyle.white},
            ]}>
            {coCoach.name}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

export default ({
  program,
  index,
  isCohort,
  onPress,
  titleStyle,
  style,
  hideBorder,
  fullDisplay,

  renderTags = () => {},
  renderOptions = () => {},
}) => {
  if (!program || !program.name) {
    return null;
  }
  const Component = onPress ? TouchableOpacity : View;
  const {coCoach: coCoaches, coach} = program;
  return (
    <Component
      onPress={onPress}
      style={[
        {
          flexDirection: 'row',
          paddingTop: Dimensions.r40,
          borderTopColor: ThemeStyle.disabledLight,
          // borderTopWidth: index !== 0 && !hideBorder ? Dimensions.r1 : 0,
        },
        style,
      ]}>
      <View style={{flex: 1}}>
        {program.tags && program.tags.length && renderTags()}
        <Text
          style={[
            TextStyles.HeaderBold,
            {
              color: ThemeStyle.white,
              marginRight: Dimensions.r22,
            },
            titleStyle,
          ]}
          numberOfLines={fullDisplay ? null : 2}>
          {program.name}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: Dimensions.marginExtraSmall,
            alignContent: 'center',
          }}>
          <Image
            source={
              program.type === programTypes.GROUP
                ? require('../../assets/images/Group-tab-icon.png')
                : require('../../assets/images/Individual-tab-icon.png')
            }
            style={{
              width: Dimensions.r16,
              height: Dimensions.r16,
              tintColor: ThemeStyle.white,
              marginRight: Dimensions.marginSmall,
              alignSelf: 'center',
            }}
            resizeMode="contain"
          />
          {!isCohort && (
            <Text
              style={[
                TextStyles.GeneralTextBold,
                {
                  color: ThemeStyle.white,
                },
              ]}>
              {`${getProgramDisplayType(program.type)}`.toUpperCase()}
            </Text>
          )}
          {isCohort ? (
            <Text
              style={[
                TextStyles.GeneralTextBold,
                {
                  color: ThemeStyle.white,
                },
              ]}>{`${moment(program.startDate).format(
              'MMM DD YYYY',
            )} - ${moment(program.endDate).format('MMM DD YYYY')}`}</Text>
          ) : (
            <View style={{flexDirection: 'row'}}>
              <Image
                source={require('../../assets/images/Duration-icon.png')}
                style={{
                  width: Dimensions.r16,
                  height: Dimensions.r16,
                  tintColor: ThemeStyle.white,
                  marginRight: Dimensions.marginSmall,
                  marginLeft: Dimensions.marginExtraLarge,
                }}
                resizeMode="contain"
              />
              <Text
                style={[
                  TextStyles.GeneralTextBold,
                  {
                    color: ThemeStyle.white,
                  },
                ]}>
                {`${getProgramDisplayDuration(program.duration)}`.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        {/* {!isNullOrEmpty(program.description) && (
          <Text
            numberOfLines={fullDisplay ? null : 2}
            style={[
              TextStyles.GeneralText,
              {
                color: ThemeStyle.textExtraLight,
                // marginTop: Dimensions.marginRegular,
                flex: 1,
              },
            ]}>
            {program.description}
          </Text>
        )} */}
        {/* {renderCoCoaches(program)} */}
        {renderCoCoaches(program)}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            top: Dimensions.r48,
            // bottom: Dimensions.r20,
          }}>
          <Text
            style={[
              TextStyles.SubHeader2,
              {
                color: ThemeStyle.green,
              },
            ]}>
            {getDisplayPrice(program.payment)}
          </Text>
          {renderOptions()}
        </View>
        {program.status === 'PUBLISHED' ? (
          <View
            style={{
              width: Dimensions.r64,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              top: Dimensions.r28,
              left: Dimensions.r196,
              bottom: Dimensions.r20,
              height: Dimensions.r20,

              borderRadius: Dimensions.r10,
              backgroundColor: ThemeStyle.green,
            }}>
            <Text
              style={{
                left: Dimensions.r16,
                height: Dimensions.r10,
                width: Dimensions.r64,
                color: '#FFF',
                // fontFamily: "Apercu",
                fontSize: 10,
                fontWeight: '500',
                lineHeight: 10,
              }}>
              Active
            </Text>
          </View>
        ) : program.status === 'DRAFT' ? (
          <View
            style={{
              width: Dimensions.r64,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              top: Dimensions.r28,
              left: Dimensions.r196,
              bottom: Dimensions.r20,
              height: Dimensions.r20,

              borderRadius: Dimensions.r10,
              backgroundColor: ThemeStyle.yellow,
            }}>
            <Text
              style={{
                left: Dimensions.r16,
                height: Dimensions.r10,
                width: Dimensions.r64,
                color: '#FFF',
                // fontFamily: "Apercu",
                fontSize: 10,
                fontWeight: '500',
                lineHeight: 10,
              }}>
              Draft
            </Text>
          </View>
        ) : (
          <View
            style={{
              width: Dimensions.r64,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              top: Dimensions.r28,
              left: Dimensions.r196,
              bottom: Dimensions.r20,
              height: Dimensions.r20,

              borderRadius: Dimensions.r10,
              backgroundColor: ThemeStyle.yellow,
            }}>
            <Text>Draft</Text>
          </View>
        )}
      </View>
    </Component>
  );
};
