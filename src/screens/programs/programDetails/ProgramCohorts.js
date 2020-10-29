import React from 'react';
import {TouchableOpacity, View, Text, ScrollView, Image} from 'react-native';
import Dimensions, {windowDimensions} from '../../../styles/Dimensions';
import ThemeStyle from '../../../styles/ThemeStyle';
import TextStyles from '../../../styles/TextStyles';
import {NoData} from '../../../components/NoData';
import moment from 'moment';
import {getCohortDates} from '../../../utils';

export default class ProgramCohorts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      program: props.program,
      isUserProgram: props.isUserProgram,
      isCoCoach: props.isCoCoach,
    };
  }

  static getDerivedStateFromProps(props, state) {
    return {
      program: props.program,
      isUserProgram: props.isUserProgram,
      isCoCoach: props.isCoCoach,
    };
  }

  render() {
    const {
      navigation,
      onAddCohort,
      hideAddCohort,
      onSelect,
      onJoinCohort,
    } = this.props;
    const {program, isUserProgram, isCoCoach} = this.state;
    return (
      <View
        style={[
          ThemeStyle.pageContainer,
          {
            backgroundColor: onSelect
              ? ThemeStyle.foreground
              : ThemeStyle.backgroundColor,
          },
        ]}>
        {isUserProgram && !hideAddCohort && (
          <TouchableOpacity
            onPress={onAddCohort}
            style={{
              alignSelf: 'flex-end',
              marginHorizontal: Dimensions.screenMarginRegular,
              backgroundColor: ThemeStyle.green + '33',
              paddingVertical: Dimensions.marginRegular,
              paddingHorizontal: Dimensions.marginExtraLarge,
              borderRadius: Dimensions.r24,
            }}>
            <Text style={[TextStyles.GeneralTextBold, {color: '#4BC68A'}]}>
              Add Cohort
            </Text>
          </TouchableOpacity>
        )}
        {program.cohorts && program.cohorts.length ? (
          program.cohorts.map(cohort => (
            <TouchableOpacity
              onPress={() => {
                if (typeof onSelect === 'function') {
                  return onSelect(cohort);
                }
                if (isUserProgram || isCoCoach || cohort.canViewDetails) {
                  navigation.navigate('CohortDetails', {
                    program,
                    cohort,
                  });
                } else {
                  onJoinCohort(cohort);
                }
              }}
              style={{
                padding: Dimensions.marginExtraLarge,
                marginHorizontal: Dimensions.screenMarginRegular,
                backgroundColor: ThemeStyle.divider,
                borderRadius: Dimensions.r8,
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: Dimensions.marginRegular,
              }}>
              <Image
                source={require('../../../assets/images/Duration-icon.png')}
                style={{
                  width: Dimensions.r24,
                  height: Dimensions.r24,
                  tintColor: ThemeStyle.textRegular,
                }}
              />
              <View
                style={{
                  marginRight: Dimensions.r48,
                  marginLeft: Dimensions.marginRegular,
                }}>
                <Text
                  style={[
                    TextStyles.GeneralText,
                    {
                      paddingVertical: Dimensions.marginExtraSmall,
                    },
                  ]}>
                  {cohort.name}
                </Text>
                <Text style={TextStyles.SubHeader2}>
                  {getCohortDates(cohort)}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: Dimensions.marginSmall,
                  }}>
                  <Text
                    style={[
                      TextStyles.ContentTextBold,
                      {color: ThemeStyle.mainColor},
                    ]}>{`${cohort.joinedMembers}/${cohort.programSize}`}</Text>
                </View>
              </View>
              {!isUserProgram &&
              !isCoCoach &&
              !cohort.canViewDetails &&
              !onSelect ? (
                <View
                  style={{
                    position: 'absolute',
                    top: Dimensions.marginExtraLarge,
                    right: Dimensions.marginExtraLarge,
                    backgroundColor: ThemeStyle.green,
                    borderRadius: Dimensions.r12,
                    paddingVertical: Dimensions.marginExtraSmall,
                    paddingHorizontal: Dimensions.marginLarge,
                  }}>
                  <Text
                    style={[
                      TextStyles.GeneralTextBold,
                      {color: ThemeStyle.white},
                    ]}>
                    Join
                  </Text>
                </View>
              ) : (
                <Image
                  source={require('../../../assets/images/arrow-icon.png')}
                  style={{
                    position: 'absolute',
                    bottom: Dimensions.r32,
                    right: Dimensions.marginExtraLarge,
                    tintColor: ThemeStyle.disabledLight,
                    transform: [{rotate: '180deg'}],
                  }}
                />
              )}
            </TouchableOpacity>
          ))
        ) : (
          <NoData
            style={{marginTop: Dimensions.r64}}
            message="No cohorts created"
          />
        )}
      </View>
    );
  }
}
