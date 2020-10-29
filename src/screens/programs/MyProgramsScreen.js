import React from 'react';
import {View, ScrollView, Image, Text, TouchableOpacity} from 'react-native';
import BaseComponent from '../../components/BaseComponent';
import ThemeStyle from '../../styles/ThemeStyle';
import Header from '../../components/Header';
import Dimensions, {windowDimensions} from '../../styles/Dimensions';
import TextStyles from '../../styles/TextStyles';
import Card from '../../components/Card';
import CustomButton from '../../components/Button';
import {TextInput, FlatList} from 'react-native-gesture-handler';
import {appsyncClient} from '../../../App';
import {getPrograms} from '../../queries/user';
import ProgramItem from './ProgramItem';
import {withStore} from '../../utils/StoreUtils';
import {NoData} from '../../components/NoData';
import ProgramDashboardCard from '../programs/ProgramDashboardCard';
import ProgramImageBackground from '../../components/ProgramImageBackground';
import CustomInput from '../../components/CustomInput';

class MyProgramsScreen extends BaseComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.setLoading(true);
    this.fetchPrograms();
  }

  componentWillUnmount() {
    this.programsQuery.unsubscribe();
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
          this.props.setLoading(false);
          if (data.loading && !data.data) {
            return;
          }
          if (data.data.getPrograms) {
            this.setState({
              programs: data.data.getPrograms,

              filteredPrograms: data.data.getPrograms,
            });
          }
        },
        error: error => {
          this.props.setLoading(false);
          console.log('ERROR FETCHING USER PROGRAMS', error);
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
  renderProgramItem(program, index) {
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
  }

  onFilterChange = text => {
    const {programs} = this.state;
    const filteredPrograms = programs.filter(item => {
      return item.name.toLowerCase().includes(text.toLowerCase());
    });
    this.setState({
      filteredPrograms,
    });
  };

  render() {
    const {navigation} = this.props;
    const {filteredPrograms} = this.state;
    return this.renderWithSafeArea(
      <View style={ThemeStyle.pageContainer}>
        <Header
          title="My Programs"
          goBack={() => {
            navigation.pop();
          }}
          rightIcon={() => (
            <Image source={require('../../assets/images/Add-icon.png')} />
          )}
          onRightIconClick={() => {
            navigation.navigate('CreateProgram');
          }}
        />
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: Dimensions.screenMarginRegular,
          }}>
          <Card
            cardRadius={Dimensions.r32}
            style={{
              marginBottom: Dimensions.marginRegular,
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

          {/* <Card
            style={{marginVertical: Dimensions.marginLarge}}
            contentStyle={{padding: Dimensions.marginLarge}}>
            {filteredPrograms && filteredPrograms.length ? (
              filteredPrograms.map((item, index) =>
                this.renderProgramItem(item, index),
              )
            ) : (
              <NoData />
            )}
          </Card> */}
          <FlatList
            vertical
            data={filteredPrograms}
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
            ListEmptyComponent={this.renderNoData(
              'You have not created\nany programs yet',
            )}
          />
        </ScrollView>
      </View>,
    );
  }
}

export default withStore(MyProgramsScreen);
