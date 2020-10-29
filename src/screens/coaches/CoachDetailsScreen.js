import React from 'react';
import {
  View,
  ScrollView,
  Image,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import BaseComponent from '../../components/BaseComponent';
import ThemeStyle from '../../styles/ThemeStyle';
import Header from '../../components/Header';
import Dimensions from '../../styles/Dimensions';
import TextStyles from '../../styles/TextStyles';
import Card from '../../components/Card';
import CustomButton from '../../components/Button';
import {appsyncClient} from '../../../App';
import {getPractice} from '../../queries/user';
import {getProgramsByCoach} from '../../queries/program';
import {withStore} from '../../utils/StoreUtils';
import ProfileImage from '../../components/ProfileImage';
import {NoData} from '../../components/NoData';
import ProgramItem from '../programs/ProgramItem';
import {TextInput} from 'react-native-gesture-handler';
import CustomInput from '../../components/CustomInput';

class CoachDetailsScreen extends BaseComponent {
  constructor(props) {
    super(props);
    this.state.coach = props.navigation.getParam('coach', {});
  }

  componentDidMount() {
    this.props.setLoading(true);
    // this.fetchPractice();
    this.fetchPrograms();
  }

  componentWillUnmount() {
    // this.practiceQuery.unsubscribe();
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
    const {coach} = this.state;
    this.programsQuery = appsyncClient
      .watchQuery({
        query: getProgramsByCoach,
        variables: {coachId: coach.userId},
        fetchPolicy: 'cache-and-network',
      })
      .subscribe({
        next: data => {
          console.log('COACH PROGRAMS', data);
          this.props.setLoading(false);
          if (data.loading && !data.data) {
            return;
          }
          if (data.data.getProgramsByCoach) {
            this.setState({
              programs: data.data.getProgramsByCoach,
              filteredPrograms: data.data.getProgramsByCoach,
            });
          }
        },
        error: error => {
          this.props.setLoading(false);
          console.log('ERROR FETCHING COACH PROGRAMS', error);
        },
      });
  };

  onFilterChange = text => {
    const {programs} = this.state;
    const filteredPrograms = programs.filter(item => {
      return item.name.toLowerCase().includes(text.toLowerCase());
    });
    this.setState({
      filteredPrograms,
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
    const {filteredPrograms, coach} = this.state;
    return this.renderWithSafeArea(
      <View style={ThemeStyle.pageContainer}>
        <Header
          title=""
          goBack={() => {
            navigation.pop();
          }}
        />
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: Dimensions.screenMarginRegular,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: Dimensions.marginExtraLarge,
            }}>
            <View style={{flex: 1}}>
              <Text style={TextStyles.HeaderBold}>{coach.name}</Text>
              {coach.practice && (
                <View style={{marginTop: Dimensions.marginSmall}}>
                  <Text style={TextStyles.SubHeader2}>
                    {coach.practice.title}
                  </Text>
                </View>
              )}
            </View>
            <ProfileImage
              style={{margin: 0}}
              size={Dimensions.r72}
              avatarSource={user.picture}
            />
          </View>
          {coach.practice && (
            <Text
              style={[
                TextStyles.GeneralText,
                {marginBottom: Dimensions.marginLarge},
              ]}>
              {coach.practice.description}
            </Text>
          )}
          {/* <Card
            style={{marginVertical: Dimensions.marginLarge}}
            contentStyle={{
              flexDirection: `row`,
              padding: Dimensions.marginLarge,
              justifyContent: `space-between`,
              alignItems: 'center',
            }}>
            <View style={{marginLeft: Dimensions.marginExtraLarge}}>
              <Text style={[TextStyles.HeaderBold, {fontSize: Dimensions.r40}]}>
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
          </Card> */}
          <Text style={TextStyles.Header2}>Programs</Text>
          <Card
            cardRadius={Dimensions.r32}
            style={{
              marginVertical: Dimensions.marginRegular,
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
              onChangeText={this.onFilterChange}
            />
          </Card>
          <Card
            style={{marginVertical: Dimensions.marginLarge}}
            contentStyle={{padding: Dimensions.marginLarge}}>
            {filteredPrograms && filteredPrograms.length ? (
              <FlatList
                data={filteredPrograms}
                renderItem={({item, index}) =>
                  this.renderProgramItem(item, index)
                }
              />
            ) : (
              <NoData />
            )}
          </Card>
        </ScrollView>
      </View>,
    );
  }
}

export default withStore(CoachDetailsScreen);
