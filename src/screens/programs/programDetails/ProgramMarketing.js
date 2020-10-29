import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import Dimensions, {windowDimensions} from '../../../styles/Dimensions';
import ThemeStyle from '../../../styles/ThemeStyle';

import textStyles from './../../../styles/TextStyles';
import {
  getProgramContent,
  groupSessionsByDate,
  errorMessage,
} from '../../../utils';
import moment from 'moment';
import ProgramImageBackground from '../../../components/ProgramImageBackground';
import {NoData} from '../../../components/NoData';
import SessionItem from '../../../components/SessionItem';
import Icon from '../../../components/Icon';
import ConfirmationModal from '../../../modals/ConfirmationModal';
import {appsyncClient} from '../../../../App';
import {deleteProgramModules} from '../../../queries/program';
import {showMessage} from 'react-native-flash-message';

export default class ProgramMarketing extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTab: 'Tasks',
      program: props.program,
      isCohort: props.isCohort,
      isUserProgram: props.isUserProgram,
      isCoCoach: props.isCoCoach,
      modules: [],
      tasks: [],
      selectedModuleIndex: 0,
    };
  }

  render() {
    const {navigation} = this.props;

    return (
      <ScrollView style={{marginHorizontal: Dimensions.screenMarginRegular}}>
        <View
          style={{
            backgroundColor: ThemeStyle.lightLay2,
            borderRadius: Dimensions.r4,
          }}>
          <View>
            {/* video url part */}
            <View
              style={{
                flexDirection: 'row',
                height: Dimensions.r80,
                marginHorizontal: Dimensions.screenMarginRegular,
              }}>
              <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <Image
                  source={require('./../../../assets/images/Life-Coach-redsign-Assets/video-tab-icon.png')}
                  style={{
                    width: Dimensions.r20,
                    height: Dimensions.r20,
                  }}
                />
              </View>
              <View
                style={{
                  marginLeft: Dimensions.marginExtraLarge,
                  justifyContent: 'center',
                  marginVertical: Dimensions.marginExtraLarge,
                  flex: 1,
                }}>
                <Text style={[textStyles.SubHeaderBold]}> Video URL</Text>

                <TextInput
                  style={{
                    ...textStyles.GeneralTextBold,
                  }}
                  underlineColorAndroid={ThemeStyle.disabledLight}
                  placeholder="Enter URL here"
                />
              </View>
            </View>
          </View>
        </View>
        <View style={{marginTop: Dimensions.screenMarginRegular}}>
          <Text style={[textStyles.SubHeaderBold]}> Desription</Text>
          <View
            style={{
              backgroundColor: ThemeStyle.lightLay2,
              marginTop: Dimensions.marginRegular,
              height: Dimensions.r140,
              borderRadius: Dimensions.r4,
            }}>
            <TextInput
              style={{
                flex: 1,
                ...textStyles.GeneralTextBold,
                marginHorizontal: Dimensions.marginRegular,
              }}
              placeholder="Enter Description"
              textAlignVertical={'top'}
            />
          </View>

          {/* <TextInput
            style={{
              height: Dimensions.r140,
              backgroundColor: ThemeStyle.lightLay2,
              marginTop: Dimensions.marginSmall,
              ...textStyles.GeneralTextBold,
            }}
            placeholder="Enter descripiton"
            textAlignVertical={'top'}
          /> */}
        </View>

        <View
          style={{
            marginTop: Dimensions.screenMarginRegular,
            borderWidth: Dimensions.r1,
            borderColor: ThemeStyle.disabledLight,
            borderRadius: Dimensions.r4,
            paddingVertical: Dimensions.marginRegular,
          }}>
          <Text
            style={{
              ...textStyles.SubHeaderBold,
              position: 'absolute',
              top: -Dimensions.marginRegular,
              width: Dimensions.r140,
              //   height: Dimensions.r30,

              backgroundColor: ThemeStyle.backgroundColor,
              marginLeft: Dimensions.marginRegular,
            }}>
            What you'll learn
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: ThemeStyle.green,
              borderRadius: Dimensions.r6,
              paddingHorizontal: Dimensions.r12,
              paddingVertical: Dimensions.r10,
              width: Dimensions.r52,
              height: Dimensions.r30,
              position: 'absolute',
              right: Dimensions.marginRegular,
              top: -Dimensions.marginLarge,
            }}
            // onPress={() => {
            //   navigation.navigate('NewSession', {
            //     program,
            //     isTask: selectedTab === 'Tasks',
            //     isCohortSchedule: isCohort,
            //   });
            //         }}
          >
            <Text
              style={[textStyles.GeneralTextBold, {color: ThemeStyle.white}]}>
              ADD
            </Text>
          </TouchableOpacity>
          <View style={{marginHorizontal: Dimensions.marginRegular}}>
            <View
              style={{
                height: Dimensions.r52,
                backgroundColor: ThemeStyle.lightLay2,
                marginTop: Dimensions.marginLarge,
                borderRadius: Dimensions.r4,
              }}>
              <TextInput
                style={{
                  ...textStyles.GeneralTextBold,
                  marginHorizontal: Dimensions.marginRegular,
                }}
                placeholder="Enter descripiton"
                underlineColorAndroid={ThemeStyle.disabledLight}
              />
            </View>
            <View
              style={{
                height: Dimensions.r52,
                backgroundColor: ThemeStyle.lightLay2,
                marginTop: Dimensions.marginRegular,
                borderRadius: Dimensions.r4,
              }}>
              <TextInput
                style={{
                  ...textStyles.GeneralTextBold,
                  marginHorizontal: Dimensions.marginRegular,
                }}
                placeholder="Enter descripiton"
                underlineColorAndroid={ThemeStyle.disabledLight}
              />
            </View>
            <View
              style={{
                height: Dimensions.r52,
                backgroundColor: ThemeStyle.lightLay2,
                marginTop: Dimensions.marginRegular,
                borderRadius: Dimensions.r4,
              }}>
              <TextInput
                style={{
                  ...textStyles.GeneralTextBold,
                  marginHorizontal: Dimensions.marginRegular,
                }}
                placeholder="Enter descripiton"
                underlineColorAndroid={ThemeStyle.disabledLight}
              />
            </View>
          </View>
        </View>
        <View
          style={{
            marginTop: Dimensions.screenMarginRegular,
            borderWidth: Dimensions.r1,
            borderColor: ThemeStyle.disabledLight,
            borderRadius: Dimensions.r4,
            paddingVertical: Dimensions.marginRegular,
          }}>
          <Text
            style={{
              ...textStyles.SubHeaderBold,
              position: 'absolute',
              top: -Dimensions.marginRegular,
              width: Dimensions.r128,
              //   height: Dimensions.r30,

              backgroundColor: ThemeStyle.backgroundColor,
              marginLeft: Dimensions.marginRegular,
            }}>
            Coach's Info
          </Text>
          <View style={{marginHorizontal: Dimensions.marginRegular}}>
            <View
              style={{
                height: Dimensions.r52,
                backgroundColor: ThemeStyle.lightLay2,
                borderRadius: Dimensions.r4,
                marginTop: Dimensions.marginLarge,
              }}>
              <TextInput
                style={{
                  ...textStyles.GeneralTextBold,
                  marginHorizontal: Dimensions.marginRegular,
                }}
                placeholder="Enter Bio"
                underlineColorAndroid={ThemeStyle.disabledLight}
              />
            </View>
            <View
              style={{
                height: Dimensions.r52,
                backgroundColor: ThemeStyle.lightLay2,
                marginTop: Dimensions.marginLarge,
              }}>
              <TextInput
                style={{
                  ...textStyles.GeneralTextBold,
                  marginHorizontal: Dimensions.marginRegular,
                }}
                placeholder="Enter Interest"
                underlineColorAndroid={ThemeStyle.disabledLight}
              />
            </View>
            <View
              style={{
                height: Dimensions.r52,
                backgroundColor: ThemeStyle.lightLay2,
                marginTop: Dimensions.marginRegular,
                borderRadius: Dimensions.r4,
              }}>
              <TextInput
                style={{
                  ...textStyles.GeneralTextBold,
                  marginHorizontal: Dimensions.marginRegular,
                }}
                placeholder="Enter Education"
                underlineColorAndroid={ThemeStyle.disabledLight}
              />
            </View>
            <View
              style={{
                height: Dimensions.r52,
                backgroundColor: ThemeStyle.lightLay2,
                borderRadius: Dimensions.r4,
                marginTop: Dimensions.marginRegular,
              }}>
              <TextInput
                style={{
                  ...textStyles.GeneralTextBold,
                  marginHorizontal: Dimensions.marginRegular,
                }}
                placeholder="Enter Experience"
                underlineColorAndroid={ThemeStyle.disabledLight}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }
}
