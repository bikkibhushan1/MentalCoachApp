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
import {getPrograms, searchCoaches} from '../../queries/user';
import {withStore} from '../../utils/StoreUtils';
import ProfileImage from '../../components/ProfileImage';
import {NoData} from '../../components/NoData';
import ProgramItem from '../programs/ProgramItem';
import ProgramDashboardCard from '../programs/ProgramDashboardCard';
import ProgramImageBackground from '../../components/ProgramImageBackground';

import LinearGradient from 'react-native-linear-gradient';
import ProfileScreen from '../profile/ProfileScreen';
import {getFeaturedPrograms} from '../../queries/program';
import {s3ProtectionLevel} from '../../constants';

const dummy_json = [
  {
    id: 1,
    name: 'Bikki Bhushan',
    coach: ' DBT for Anxiety',
    type: 'DBT',
  },
  {
    id: 2,
    name: 'Rohit Raj',
    coach: ' You will be fine',
    type: 'DBTDBTDBT',
  },
  {
    id: 3,
    name: 'Another Big ',
    coach: 'App is Great',
    type: 'CBT',
  },
];

class FeaturedProgramScreen extends BaseComponent {
  constructor(props) {
    super(props);
    this.state.practice = {};
    this.state.topSafeArea = ThemeStyle.mainColor;
    this.state.joinedPrograms = [];
  }

  componentDidMount() {
    // this.props.setLoading(true);

    this.fetchFeaturedCoaches();
    this.fetchFeaturedPrograms();
    this.fetchPrograms();
  }

  componentWillUnmount() {
    this.featuredCoachesQuery.unsubscribe();

    this.programsQuery.unsubscribe();
  }

  fetchFeaturedPrograms = () => {
    this.programsQuery = appsyncClient
      .watchQuery({
        query: getFeaturedPrograms,
        fetchPolicy: 'cache-and-network',
      })
      .subscribe({
        next: data => {
          console.log('FEATURED PROGRAMS', data);
          if (data.loading && !data.data) {
            return;
          }
          if (data.data.getFeaturedPrograms) {
            this.setState({
              featuredPrograms: data.data.getFeaturedPrograms,
            });
          }
        },
        error: error => {
          console.log('ERROR FETCHING USER PROGRAMS', error);
        },
      });
  };

  fetchFeaturedCoaches = () => {
    this.featuredCoachesQuery = appsyncClient
      .watchQuery({
        query: searchCoaches,
        variables: {
          featuredCoach: true,
          isMentor: false,
        },
        fetchPolicy: 'cache-and-network',
      })
      .subscribe({
        next: data => {
          console.log('FEATURED COACHES', data);
          // this.props.setLoading(false);
          if (data.loading && !data.data) {
            return;
          }
          if (data.data.searchCoaches) {
            this.setState({
              featuredCoaches: data.data.searchCoaches,
            });
          }
        },
        error: error => {
          // this.props.setLoading(false);
          console.log('ERROR FETCHING FEATURED COACHES', error);
        },
      });
  };

  fetchPrograms = () => {
    this.programsQuery = appsyncClient
      .watchQuery({
        query: searchCoaches,
        variables: {
          featuredCoach: true,
          isMentor: false,
        },
        fetchPolicy: 'cache-and-network',
      })
      .subscribe({
        next: data => {
          console.log('FEATURED COACHES', data);
          // this.props.setLoading(false);
          if (data.loading && !data.data) {
            return;
          }
          if (data.data.searchCoaches) {
            this.setState({
              featuredCoaches: data.data.searchCoaches,
            });
          }
        },
        error: error => {
          // this.props.setLoading(false);
          console.log('ERROR FETCHING FEATURED COACHES', error);
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

    const {featuredCoaches, featuredPrograms} = this.state;
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
            height: Dimensions.r128,
            justifyContent: 'center',
          }}>
          <Header
            title="Featured Programs"
            goBack={() => {
              navigation.pop();
            }}
            // icon={require('../../assets/images/notification-icon.png')}

            isLightContent
            navBarStyle={{backgroundColor: 'transparent'}}
          />
        </LinearGradient>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionText}>Featured Coaches</Text>
          <FlatList
            data={featuredCoaches}
            renderItem={({item}) => <FeaturedProfileView value={item} />}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: Dimensions.screenMarginRegular,
            }}
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionText}>Featured Programs</Text>
          <FlatList
            horizontal
            data={featuredPrograms}
            contentContainerStyle={{
              paddingHorizontal: Dimensions.screenMarginRegular,
            }}
            ListEmptyComponent={this.renderNoData(
              'You have not created\nany programs yet',
            )}
            showsHorizontalScrollIndicator={false}
            renderItem={({item, index}) => (
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
          />
        </View>
      </View>,
    );
  }
}

export default FeaturedProgramScreen;

const FeaturedProfileView = props => {
  return (
    <View
      style={{
        borderRadius: Dimensions.r20,
        width: Dimensions.r168,
        height: Dimensions.r196,
        shadowColor: 'rgba(78,103,193,0.2)',
        shadowOffset: {height: 2},
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 2,

        marginRight: Dimensions.marginRegular,

        flexDirection: 'column',
      }}>
      <Image
        source={require('./../../assets/images/profile_check_img.jpeg')}
        style={{
          alignSelf: 'center',
          width: Dimensions.r80,
          maxHeight: Dimensions.r80,
          marginTop: Dimensions.marginLarge,
          borderRadius: Dimensions.r80,
        }}
      />

      <View
        style={{
          flex: 1,
          alignItems: 'center',
          flexDirection: 'column',
          marginTop: Dimensions.r10,
          alignContent: 'center',
        }}>
        <Text style={{...TextStyles.SubHeaderBold, textAlign: 'center'}}>
          {props.value.name}
        </Text>
        <Text
          style={([TextStyles.SubHeaderBold], {color: ThemeStyle.mainColor})}>
          DBT for Anxiety
        </Text>
        <View
          style={{
            marginTop: Dimensions.r4,
            height: Dimensions.r20,
            borderColor: ThemeStyle.accentColor2,
            borderWidth: Dimensions.r2,
            borderRadius: Dimensions.r12,
            justifyContent: 'center',
            padding: Dimensions.r4,
          }}>
          <Text style={TextStyles.GeneralTextBold}> DBT /CBT</Text>
        </View>
      </View>
    </View>
  );
};

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
