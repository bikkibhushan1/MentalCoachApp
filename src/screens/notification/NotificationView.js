//import liraries
import React, {Component} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import moment from 'moment';
import Button from '../../components/Button';
import Dimensions, {windowDimensions} from '../../styles/Dimensions';
import ThemeStyle from '../../styles/ThemeStyle';
import TextStyles, {fontFamily} from '../../styles/TextStyles';

// create a component
const styles = StyleSheet.create({
  divider: {
    height: Dimensions.r1,
    width: '100%',
    backgroundColor: ThemeStyle.disabledLight,
    marginStart: Dimensions.marginLarge,
  },
});

//make this component available to the app

const NotificationView = props => {
  let invitationView;
  let notificationViewButtonText;
  if (
    props.value.type == 'JoinProgramAsCoCoach' ||
    props.value.type == 'JoinCohortAsCoCoach' ||
    props.value.type == 'CohortInvite' ||
    props.value.type == 'ProgramInvite'
  ) {
    if (
      props.value.type == 'JoinProgramAsCoCoach' ||
      props.value.type == 'JoinCohortAsCoCoach'
    ) {
      notificationViewButtonText = 'Accept';
    }
    if (
      props.value.type == 'CohortInvite' ||
      props.value.type == 'ProgramInvite'
    ) {
      notificationViewButtonText = 'Join';
    }
    invitationView = (
      <View
        style={{
          flexDirection: 'row',
          marginTop: Dimensions.marginLarge,
          width: Dimensions.r150,
          height: Dimensions.r28,
          justifyContent: 'space-between',

          // height: Dimensions.r28,
        }}>
        <Button
          name={notificationViewButtonText}
          noGradient={true}
          style={{
            backgroundColor: ThemeStyle.darkGreen,
            borderRadius: Dimensions.r5,
            width: Dimensions.r70,
            height: Dimensions.r28,
          }}
        />
        <Button
          name="Cancel"
          noGradient={true}
          style={{
            backgroundColor: ThemeStyle.disabledLight,
            borderRadius: Dimensions.r5,
            width: Dimensions.r70,
            height: Dimensions.r28,
            marginLeft: Dimensions.r10,
          }}
          textStyle={{color: '#828282'}}
        />
      </View>
    );
  }

  const RenderSeparator = props => {
    return <Text>{props.size}</Text>;
  };

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          paddingVertical: Dimensions.marginRegular,
        }}>
        <View style={{flex: 1}}>
          <Image
            source={require('./../../assets/images/profile_check_img.jpeg')}
            style={{
              alignSelf: 'center',
              width: Dimensions.r52,
              height: Dimensions.r52,

              borderRadius: Dimensions.r52,
            }}
          />

          <Image
            style={{
              position: 'absolute',
              width: Dimensions.r24,
              height: Dimensions.r24,

              top: Dimensions.r32,
              left: (4 * Dimensions.r30) / 3,
            }}
            source={require('../../assets/images/awful-mood.png')}
          />
        </View>
        <View
          style={{
            flex: 4,
            justifyContent: 'center',
          }}>
          <View
            style={{
              marginEnd: Dimensions.r48,
            }}>
            <Text style={TextStyles.SubHeader2}>{props.value.title}</Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: Dimensions.marginExtraSmall,
                alignContent: 'center',
              }}>
              <Text
                style={{
                  ...TextStyles.GeneralText,
                  color: ThemeStyle.textExtraLight,
                }}>
                {moment(props.value.createdAt).format('MMM DD, YYYY')}
              </Text>

              <Text
                style={{
                  ...TextStyles.GeneralText,
                  marginStart: Dimensions.marginSmall,
                  color: ThemeStyle.textLight,
                }}>
                {moment(props.value.createdAt)
                  .startOf('hour')
                  .fromNow()}
              </Text>
            </View>
            {invitationView}
          </View>
        </View>
      </View>
      {RenderSeparator(props)}
    </>
  );
};
export default NotificationView;
