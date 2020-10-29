import React from 'react';
import {
  View,
  ScrollView,
  Image,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import BaseComponent from '../../components/BaseComponent';
import ThemeStyle from '../../styles/ThemeStyle';
import Header from '../../components/Header';
import Dimensions, {windowDimensions} from '../../styles/Dimensions';
import TextStyles from '../../styles/TextStyles';
import Card from '../../components/Card';
import CustomButton from '../../components/Button';
import {appsyncClient} from '../../../App';
import {getPractice, getPrograms, getJoinedPrograms} from '../../queries/user';
import {withStore} from '../../utils/StoreUtils';
import ProfileImage from '../../components/ProfileImage';
import {NoData} from '../../components/NoData';
import ProgramItem from '../programs/ProgramItem';
import ProgramDashboardCard from '../programs/ProgramDashboardCard';
import ProgramImageBackground from '../../components/ProgramImageBackground';

import LinearGradient from 'react-native-linear-gradient';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  TextHeader: {
    left: Dimensions.r28,
  },
  outerCircle: {
    // flex: 1,
    right: Dimensions.r10,
    borderRadius: Dimensions.r96 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    width: Dimensions.r96 + 5,
    height: Dimensions.r96 + 5,
    backgroundColor: 'white',
  },
  innerCircle: {
    //flex: 1,
    //borderRadius: 35,
    width: Dimensions.r72,
    height: Dimensions.r72,
    // margin: 5,
    borderWidth: 10,
    borderColor: 'black',

    // backgroundColor: 'black'
  },
  sectionText: {
    ...TextStyles.SubHeader2,
    color: ThemeStyle.textDark,
    marginBottom: Dimensions.marginLarge,
    paddingHorizontal: Dimensions.screenMarginRegular,
  },
  sectionContainer: {
    marginTop: Dimensions.marginExtraLarge,
  },
});

class MyPracticeScreen extends BaseComponent {
  constructor(props) {
    super(props);
    this.state.practice = {};
    this.state.topSafeArea = ThemeStyle.mainColor;
    this.state.joinedPrograms = [];
  }

  componentDidMount() {
    this.props.setLoading(true);

    this.fetchPractice();
    this.fetchPrograms();
  }

  componentWillUnmount() {
    this.practiceQuery.unsubscribe();
    this.programsQuery.unsubscribe();
  }

  fetchPractice = () => {
    this.practiceQuery = appsyncClient
      .watchQuery({
        query: getPractice,
        fetchPolicy: 'cache-and-network',
      })
      .subscribe({
        next: data => {
          console.log('USER PRACTICE', data);
          if (data.loading && !data.data) {
            return;
          }
          this.props.setLoading(false);
          if (data.data.getPractice) {
            this.setState({
              practice: data.data.getPractice,
            });
          }
        },
        error: error => {
          console.log('ERROR FETCHING USER PRACTICE', error);
          this.props.setLoading(false);
        },
      });
  };

  fetchPrograms = () => {
    this.programsQuery = appsyncClient
      .watchQuery({
        query: getPrograms,
        fetchPolicy: 'cache-and-network',
      })
      .subscribe({
        next: data => {
          console.log('USER PROGRAMS', data);
          if (data.loading && !data.data) {
            return;
          }
          if (data.data.getPrograms) {
            this.setState({
              programs: data.data.getPrograms,
            });
          }
        },
        error: error => {
          console.log('ERROR FETCHING USER PROGRAMS', error);
        },
      });
  };

  renderProgramItem = (program, index) => {
    const {navigation} = this.props;
    if (!program) {
      return null;
    }
    return (
      <ProgramItem
        program={program}
        index={index}
        onPress={() => {
          navigation.navigate('ProgramDetails', {
            program,
          });
        }}
      />
    );
  };

  render() {
    const {navigation, user} = this.props;
    const {programs, practice, joinedPrograms} = this.state;
    const {isCoach} = this.props;
    return this.renderWithSafeArea(
      <View style={ThemeStyle.pageContainer}>
        <LinearGradient
          colors={ThemeStyle.gradientColor}
          style={{
            borderBottomLeftRadius: Dimensions.r24,
            borderBottomRightRadius: Dimensions.r24,
            paddingBottom: Dimensions.marginExtraLarge,
            marginBottom: Dimensions.marginLarge,
          }}>
          <Header
            title=""
            goBack={() => {
              navigation.pop();
            }}
            //icon={'null'}
            isLightContent
            navBarStyle={{backgroundColor: 'transparent'}}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: Dimensions.marginRegular,
            }}>
            <View>
              <View style={styles.TextHeader}>
                <Text
                  style={{
                    ...TextStyles.HeaderBold,
                    color: ThemeStyle.foreground,
                  }}>
                  {practice.title}
                </Text>
                {/* <Text style={TextStyles.GeneralText}>
                  {practice.description}
                </Text> */}
                <Text
                  style={{
                    ...TextStyles.SubHeaderBold,
                    color: ThemeStyle.foreground,
                  }}>
                  Awaken with DBT
                </Text>
                {/* <Text style={TextStyles.GeneralText}>DBT Specialist</Text> */}
              </View>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('BecomeCoach', {
                    isEditPractice: true,
                    practice,
                  });
                }}
                style={{
                  top: Dimensions.r14,
                  left: Dimensions.r28,
                  backgroundColor: ThemeStyle.mainColor,
                  borderRadius: Dimensions.r16,
                  paddingHorizontal: Dimensions.marginLarge,
                  paddingVertical: Dimensions.marginSmall,
                  marginTop: Dimensions.marginRegular,
                  width: Dimensions.r64,
                  alignItems: 'center',
                }}>
                <Text
                  style={[
                    TextStyles.ContentTextBold,
                    {
                      color: ThemeStyle.white,
                    },
                  ]}>
                  Edit
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.outerCircle}>
              <ProfileImage
                style={styles.innerCircle}
                avatarSource={user.picture}
              />
            </View>
          </View>
        </LinearGradient>
        <Card
          style={{
            marginVertical: Dimensions.marginLarge,
            marginLeft: Dimensions.marginRegular,
            marginRight: Dimensions.marginRegular,
          }}
          contentStyle={{
            flexDirection: `row`,
            padding: Dimensions.marginLarge,
            justifyContent: `space-between`,
            alignItems: 'center',
          }}>
          <View style={{marginLeft: Dimensions.marginExtraLarge}}>
            <Text
              style={[
                TextStyles.HeaderBold,
                {fontSize: Dimensions.r40},
                {color: ThemeStyle.accentColor2},
              ]}>
              340
            </Text>
            <Text>Co-coaching sessions</Text>
          </View>
          <Image
            source={require('../../assets/images/cocoachingsession-icon.png')}
            style={{
              width: Dimensions.r64,
              height: Dimensions.r64,
              margin: Dimensions.r12,
            }}
            resizeMode="contain"
          />
        </Card>
        {isCoach && (
          <FlatList
            vertical
            data={programs}
            contentContainerStyle={{
              paddingHorizontal: Dimensions.marginLarge,
            }}
            showsHorizontalScrollIndicator={false}
            renderItem={({item, index}) => (
              // <Card
              //   style={{
              //     marginRight: Dimensions.marginLarge,
              //     width: windowDimensions.width - Dimensions.r72,
              //     paddingLeft: Dimensions.r24,
              //     paddingRight: Dimensions.r8,
              //     paddingVertical: Dimensions.r12,
              //   }}>
              //   <ProgramItem
              //     program={item}
              //     index={index}
              //     imageStyle={{
              //       width: Dimensions.r64,
              //       height: Dimensions.r64,
              //       borderRadius: Dimensions.r32,
              //     }}
              //     titleStyle={TextStyles.Header2}
              //     onPress={() => {
              //       navigation.navigate('ProgramDetails', {
              //         program: item,
              //       });
              //     }}
              //     hideBorder
              //   />
              // </Card>
              <View
                style={{
                  height: Dimensions.r196,
                  width: windowDimensions.width - Dimensions.r72,
                  overflow: 'hidden',
                  borderTopLeftRadius: Dimensions.r24,
                  borderTopRightRadius: Dimensions.r24,
                  borderBottomLeftRadius: Dimensions.r24,
                  borderBottomRightRadius: Dimensions.r24,
                  paddingVertical: Dimensions.r12,
                  marginRight: Dimensions.marginLarge,
                  marginLeft: Dimensions.marginLarge,
                  paddingHorizontal: Dimensions.screenMarginRegular,
                  marginTop: Dimensions.marginRegular,
                  shadowColor: 'rgba(78,103,193,0.2)',
                  shadowOffset: {height: 2},
                  shadowOpacity: 0.35,
                  shadowRadius: 10,
                  elevation: 4,
                }}>
                <ProgramImageBackground program={item} />
                <ProgramDashboardCard
                  program={item}
                  index={index}
                  fullDisplay
                  style={{
                    marginTop: Dimensions.r42,
                    marginLeft: Dimensions.r22,
                    marginBottom: Dimensions.r128,
                  }}
                  renderTags={() => {
                    if (!item.tags.length) return;
                    let tagString = '';
                    let index = 0;
                    while (index < item.tags.length) {
                      tagString += item.tags[index];
                      if (index != item.tags.length - 1) {
                        tagString += ', ';
                      }
                      index += 1;
                    }
                    return (
                      <Text
                        style={{
                          //left: Dimensions.r16,
                          height: Dimensions.r10,
                          width: Dimensions.r64,
                          color: '#FA9917',
                          // fontFamily: "Apercu",
                          fontSize: 10,
                          fontWeight: '500',
                          lineHeight: 10,
                        }}>
                        {tagString}
                      </Text>
                    );
                  }}
                  onPress={() => {
                    navigation.navigate('ProgramDetails', {
                      program: item,
                    });
                  }}
                />
              </View>
            )}
            // ListEmptyComponent={this.renderNoData(
            //   'You have not created\nany programs yet',
            // )}
          />
        )}
      </View>,
    );
  }
}

export default withStore(MyPracticeScreen);
