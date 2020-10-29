import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
} from 'react-native';
import BaseComponent from '../../components/BaseComponent';

import ThemeStyle from '../../styles/ThemeStyle';
import LinearGradient from 'react-native-linear-gradient';
import TextStyles, {fontFamily} from '../../styles/TextStyles';
import Dimensions, {windowDimensions} from '../../styles/Dimensions';
import {withStore} from '../../utils/StoreUtils';
import {ScrollView, FlatList} from 'react-native-gesture-handler';
import {appsyncClient} from '../../../App';
import CustomInput from '../../components/CustomInput';
import {getJoinedPrograms, getPrograms} from '../../queries/user';
import Card from '../../components/Card';
import {NoData} from '../../components/NoData';
import S3Image from '../../components/S3Image';
import {s3ProtectionLevel} from '../../constants';
import ProgramItem from '../programs/ProgramItem';
import ProgramDashboardCard from '../programs/ProgramDashboardCard';
import ProgramImageBackground from '../../components/ProgramImageBackground';

const styles = StyleSheet.create({
  sectionText: {
    ...TextStyles.SubHeader2,
    color: ThemeStyle.white,
    marginBottom: Dimensions.marginLarge,
    paddingHorizontal: Dimensions.screenMarginRegular,
  },
  sectionTextBlack: {
    ...TextStyles.SubHeaderBold,
    color: ThemeStyle.black,
    marginBottom: Dimensions.marginLarge,
    paddingHorizontal: Dimensions.screenMarginRegular,
  },
  sectionContainer: {
    marginTop: Dimensions.marginExtraLarge,
  },
  image: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
});

class Dashboard extends BaseComponent {
  constructor(props) {
    super(props);
    this.state.topSafeArea = ThemeStyle.divider;
    this.state.bottomSafeArea = ThemeStyle.divider;
    //this.state.joinedPrograms = [];
  }

  componentDidMount() {
    const {isCoach, user} = this.props;
    // if (user) {
    //   updatePinpointEndpoint(user.email, 'pinpoint-email');
    // }
    this.fetchJoinedPrograms();
    this.fetchPrograms();
  }

  componentWillUnmount() {
    if (this.programsQuery) {
      this.programsQuery.unsubscribe();
    }
    if (this.joinedProgramsQuery) {
      this.joinedProgramsQuery.unsubscribe();
    }
  }

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

  /* fetchJoinedPrograms = () => {
    const {joinedLastKey} = this.state;
    this.joinedProgramsQuery = appsyncClient
      .watchQuery({
        query: getJoinedPrograms,
        variables: {
          lastKey: joinedLastKey,
        },
        fetchPolicy: 'cache-and-network',
      })
      .subscribe({
        next: data => {
          console.log('JOINED PROGRAMS', data);
          this.props.setLoading(false);
          if (data.loading && !data.data) {
            return;
          }
          if (data.data.getUserPrograms) {
            this.setState(prevState => {
              if (
                prevState.joinedLastKey ===
                data.data.getUserPrograms.LastEvaluatedKey
              ) {
                return null;
              }
              const {joinedPrograms} = prevState;
              console.log('join', prevState.LastEvaluatedKey, joinedPrograms);
              joinedPrograms.push(...data.data.getUserPrograms.Items);
              return {
                joinedPrograms,
                joinedLastKey: data.data.getUserPrograms.LastEvaluatedKey,
              };
            });
          }
        },
        error: error => {
          this.props.setLoading(false);
          console.log('ERROR FETCHING JOINED PROGRAMS', error);
        },
      });
  };
*/
  fetchJoinedPrograms = () => {
    const {joinedLastKey} = this.state;
    this.joinedProgramsQuery = appsyncClient
      .watchQuery({
        query: getJoinedPrograms,
        variables: {
          lastKey: joinedLastKey,
        },
        fetchPolicy: 'cache-and-network',
      })
      .subscribe({
        next: data => {
          console.log('JOINED PROGRAMS', data);
          if (data.loading && !data.data) {
            return;
          }
          if (data.data.getJoinedCohorts) {
            this.setState({
              joinedPrograms: data.data.getJoinedCohorts,
            });
          }
        },
        error: error => {
          console.log('ERROR FETCHING JOINED PROGRAMS', error);
        },
      });
  };

  renderNoData = text => {
    return (
      <Card
        style={{
          width: windowDimensions.width - Dimensions.r72,
          height: Dimensions.r144,
        }}
        contentStyle={{
          width: '100%',
          height: '100%',
          padding: Dimensions.marginLarge,
        }}>
        <NoData message={text} />
      </Card>
    );
  };

  render() {
    const {featuredCoaches, joinedPrograms, programs} = this.state;
    console.log('programs data: ', programs);
    console.log('joinedPrograms data: ', joinedPrograms);

    const {user, isCoach, navigation} = this.props;
    return this.renderWithSafeArea(
      <LinearGradient
        style={ThemeStyle.pageContainer}
        colors={[ThemeStyle.divider, ThemeStyle.divider]}
        start={{x: 1, y: 0.1}}>
        <View
          style={{
            flex: 1,
            paddingVertical: Dimensions.screenMarginRegular,
          }}>
          <View style={{paddingHorizontal: Dimensions.screenMarginRegular}}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('OnboardingScreen');
              }}>
              <Image
                source={require('../../assets/images/Life-Coach-redsign-Assets/notification-icon.png')}
              />
            </TouchableOpacity>

            {/* <Card
              cardRadius={Dimensions.r32}
              style={{
                marginTop: Dimensions.marginRegular,
              }}
              contentStyle={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                padding: Dimensions.marginLarge,
              }}>
              <Image
                source={require('../../assets/images/search-icon.png')}
                style={{
                  width: Dimensions.r16,
                  height: Dimensions.r16,
                  marginRight: Dimensions.marginSmall,
                }}
                resizeMode="contain"
              />
              <CustomInput
                placeholder="Search"
                style={[TextStyles.GeneralTextBold, ThemeStyle.searchInput]}
                underlineColorAndroid="transparent"
                onChangeText={text => {
                  this.filterText = text;
                  this.onFilterChange();
                }}
              />
            </Card> */}
            <View
              style={{
                flexDirection: 'row',
                marginTop: Dimensions.marginExtraLarge,
              }}>
              <Text style={{...TextStyles.HeaderBold2}}>Hello</Text>
              <Text
                style={{
                  ...TextStyles.HeaderExtraBold,
                  color: ThemeStyle.mainColor,
                  marginLeft: Dimensions.marginExtraSmall,
                }}>
                {`${user.name.split(' ')[0]},`}
                {/* {`${user.name}`} */}
              </Text>
              {/* <Text
                style={[
                  TextStyles.SubHeader,
                  {
                    color: ThemeStyle.black,
                    marginTop: Dimensions.marginLarge,
                  },
                ]}>
                Hello,
              </Text>
              <Text
                style={[TextStyles.HeaderExtraBold, {color: ThemeStyle.white}]}>
                {user.name}
              </Text> */}
            </View>
          </View>

          {
            //NOTE
            //NOTE
            //NOTE
            //NOTE
            /* ADD DATE AND UPCOMING FEATURE(CLONE FROM CBT_COMPANION ) */
          }
          <ScrollView>
            {isCoach && (
              <View
                style={{
                  ...styles.sectionContainer,
                  marginTop: Dimensions.r55,
                }}>
                <Text style={styles.sectionTextBlack}>My Programs</Text>

                <FlatList
                  horizontal
                  data={programs}
                  contentContainerStyle={{
                    paddingHorizontal: Dimensions.screenMarginRegular,
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
                                color: ThemeStyle.orange,
                                fontFamily: 'Apercu',

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
                  ListEmptyComponent={this.renderNoData(
                    'You have not created\nany programs yet',
                  )}
                />
              </View>
              //comment
            )}
            <View
              style={{
                ...styles.sectionContainer,
                marginTop: Dimensions.r55,
              }}>
              <Text style={styles.sectionTextBlack}>Enrolled Programs</Text>
              <FlatList
                style={{marginTop: Dimensions.marginLarge}}
                horizontal
                data={joinedPrograms}
                contentContainerStyle={{
                  paddingHorizontal: Dimensions.screenMarginRegular,
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
                      paddingHorizontal: Dimensions.screenMarginRegular,
                    }}>
                    <ProgramImageBackground program={item} />
                    <ProgramDashboardCard
                      program={item}
                      index={index}
                      isCohort="true"
                      fullDisplay
                      style={{
                        marginTop: Dimensions.r42,
                        marginLeft: Dimensions.r22,
                        marginBottom: Dimensions.r128,
                      }}
                      renderTags={() => {
                        if (!item.tags || !item.tags.length) return;
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
                        navigation.navigate('CohortDetails', {
                          program: item,
                          cohort: item,
                        });
                      }}
                    />
                  </View>
                )}
                ListEmptyComponent={this.renderNoData(
                  'You have not joined\nany programs yet',
                )}
              />
            </View>
            {!isCoach && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionText}>Featured Coaches</Text>
                <FlatList
                  horizontal
                  contentContainerStyle={{
                    paddingHorizontal: Dimensions.screenMarginRegular,
                  }}
                  showsHorizontalScrollIndicator={false}
                  data={featuredCoaches}
                  keyExtractor={item => item.userId}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate('CoachDetails', {coach: item});
                      }}>
                      <Card
                        style={{
                          marginRight: Dimensions.marginLarge,
                          width: Dimensions.r128,
                        }}
                        contentStyle={{
                          padding: Dimensions.r24,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <S3Image
                          placeHolder={require('../../assets/images/image-placeholder.png')}
                          filePath={item.picture}
                          level={s3ProtectionLevel.PUBLIC}
                          style={{
                            width: Dimensions.r64,
                            height: Dimensions.r64,
                            backgroundColor: ThemeStyle.divider,
                            borderRadius: Dimensions.r32,
                            marginBottom: Dimensions.marginRegular,
                          }}
                          resizeMode="cover"
                        />
                        <Text
                          style={[
                            TextStyles.GeneralTextBold,
                            {textAlign: 'center'},
                          ]}>
                          {item.name}
                        </Text>
                      </Card>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={this.renderNoData()}
                />
              </View>
            )}
            {/* <View style={styles.sectionContainer}>
              <Text style={styles.sectionText}>Featured Programs</Text>
              <FlatList
                horizontal
                contentContainerStyle={{
                  paddingHorizontal: Dimensions.screenMarginRegular,
                }}
                showsHorizontalScrollIndicator={false}
                data={featuredCoaches}
                keyExtractor={item => item.userId}
                renderItem={({item}) => (
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('CoachDetails', {coach: item});
                    }}>
                    <Card
                      style={{
                        marginRight: Dimensions.marginLarge,
                        width: Dimensions.r128,
                      }}
                      contentStyle={{
                        padding: Dimensions.r24,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <S3Image
                        placeHolder={require('../../assets/images/image-placeholder.png')}
                        filePath={item.picture}
                        level={s3ProtectionLevel.PUBLIC}
                        style={{
                          width: Dimensions.r64,
                          height: Dimensions.r64,
                          backgroundColor: ThemeStyle.divider,
                          borderRadius: Dimensions.r32,
                          marginBottom: Dimensions.marginRegular,
                        }}
                        resizeMode="cover"
                      />
                      <Text
                        style={[
                          TextStyles.GeneralTextBold,
                          {textAlign: 'center'},
                        ]}>
                        {item.name}
                      </Text>
                    </Card>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={this.renderNoData()}
              />
            </View> */}
          </ScrollView>
        </View>
      </LinearGradient>,
    );
  }
}

export default withStore(Dashboard);
