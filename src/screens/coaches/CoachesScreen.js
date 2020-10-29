import React from 'react';
import {View, Text, Image, TextInput, StyleSheet} from 'react-native';
import BaseComponent from '../../components/BaseComponent';
import ThemeStyle from '../../styles/ThemeStyle';
import Header from '../../components/Header';
import {
  ReactiveBase,
  ReactiveList,
  ReactiveComponent,
} from '@appbaseio/reactivesearch-native';
import S3Image from '../../components/S3Image';
import TextStyles from '../../styles/TextStyles';
import Dimensions from '../../styles/Dimensions';
import {s3ProtectionLevel} from '../../constants';
import {TouchableOpacity} from 'react-native-gesture-handler';
import ReactiveInputComponent from '../../components/ReactiveInputComponent';
import Filters from './Filters';
import LinearGradient from 'react-native-linear-gradient';
import Card from '../../components/Card';
import {isNullOrEmpty} from '../../utils';
import CustomInput from '../../components/CustomInput';
import {withStore} from '../../utils/StoreUtils';
import {getEnvVars} from '../../constants';

import Icon from './../../components/Icon';
import {ThemeColors} from 'react-navigation';

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    borderColor: ThemeStyle.orange,
    backgroundColor: ThemeStyle.foreground,
    borderRadius: Dimensions.r24,
    borderWidth: Dimensions.r2,
    padding: Dimensions.marginSmall,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    maxWidth: Dimensions.r128,
  },
});

class CoachesScreen extends BaseComponent {
  constructor(props) {
    super(props);
    this.state.showFilters = false;
    this.state.topSafeArea = ThemeStyle.mainColor;
  }

  renderCoachItem = res => {
    const {navigation, user} = this.props;
    console.log('Res', res);
    if (!res || res.userId === user.userId) {
      return null;
    }
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}
        onPress={() => {
          navigation.navigate('CoachDetails', {coach: res});
        }}>
        <S3Image
          placeHolder={require('../../assets/images/image-placeholder.png')}
          filePath={res.picture}
          level={s3ProtectionLevel.PUBLIC}
          style={{
            width: Dimensions.r72,
            height: Dimensions.r72,
            backgroundColor: ThemeStyle.divider,
            borderRadius: Dimensions.r36,
            marginVertical: Dimensions.marginLarge,
          }}
          resizeMode="cover"
        />
        <View style={{paddingHorizontal: Dimensions.marginLarge, flex: 1}}>
          <Text style={TextStyles.Header2}>{res.name}</Text>
          {res.practice && (
            <View>
              <Text
                style={[
                  TextStyles.GeneralTextBold,
                  {marginVertical: Dimensions.marginExtraSmall},
                ]}>
                {res.practice && res.practice.title}
              </Text>
              <Text
                style={[
                  TextStyles.ContentText,
                  {flex: 1, marginRight: Dimensions.marginExtraLarge},
                ]}
                numberOfLines={2}>
                {res.practice && res.practice.description}
              </Text>
            </View>
          )}
        </View>
        <Image
          source={require('../../assets/images/arrow-icon.png')}
          style={{
            position: 'absolute',
            top: '30%',
            right: 0,
            tintColor: ThemeStyle.disabledLight,
            transform: [{rotate: '180deg'}],
          }}
        />
      </TouchableOpacity>
    );
  };

  render() {
    const {toggleTabBar} = this.props;
    const {navigation, isCoach, user} = this.props;
    const {showFilters} = this.state;
    return this.renderWithSafeArea(
      <ReactiveBase
        app="coachsearch"
        url={getEnvVars().ES_ENDPOINT}>
        <View style={ThemeStyle.pageContainer}>
          <LinearGradient
            colors={ThemeStyle.gradientColor}
            style={{
              borderBottomLeftRadius: Dimensions.r20,
              borderBottomRightRadius: Dimensions.r20,
              marginBottom: Dimensions.marginExtraLarge,
            }}>
            <View
              style={{
                flexDirection: 'row',
                marginLeft: Dimensions.marginRegular,
                marginRight: Dimensions.marginRegular,
              }}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('NotificationScreen');
                }}>
                <Image
                  source={require('../../assets/images/notification-icon.png')}
                />
              </TouchableOpacity>
              <View style={{flex: 1}}>
                <Header
                  title="Coaches"
                  isLightContent
                  navBarStyle={{backgroundColor: 'transparent'}}
                  icon={'null'}
                />
              </View>

              {/* <TouchableOpacity>
                <View
                  style={{
                    backgroundColor: ThemeStyle.mainColor,
                    borderRadius: 20,
                    width: Dimensions.r36,
                    height: Dimensions.r36,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Icon
                    family={'Feather'}
                    name={'filter'}
                    color={'white'}
                    size={20}
                  />
                </View>
              </TouchableOpacity> */}

              <TouchableOpacity
                // onPress={() => {
                //   this.setState({
                //     showFilters: true,
                //     topSafeArea: ThemeStyle.backgroundColor,
                //   });
                //   toggleTabBar(false);
                // }}>
                onPress={() => {
                  navigation.navigate('FeaturedProgramsScreen');
                }}>
                <View
                  style={{
                    backgroundColor: ThemeStyle.mainColor,
                    borderRadius: 20,
                    width: Dimensions.r36,
                    height: Dimensions.r36,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Icon
                    family={'Feather'}
                    name={'star'}
                    color={'white'}
                    size={20}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <Card
              cardRadius={Dimensions.r32}
              style={{
                marginLeft: Dimensions.marginRegular,
                marginRight: Dimensions.marginRegular,
              }}
              contentStyle={{
                flexDirection: 'row',

                alignItems: 'center',
                padding: Dimensions.marginRegular,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <View style={{flex: 1}}>
                  <Image
                    source={require('../../assets/images/search-icon.png')}
                    style={{
                      width: Dimensions.r16,
                      height: Dimensions.r16,
                      marginRight: Dimensions.marginSmall,
                      alignSelf: 'center',
                    }}
                    resizeMode="contain"
                  />
                </View>

                <View style={{alignSelf: 'center', flex: 3}}>
                  <ReactiveComponent
                    componentId="searchFilter"
                    filterLabel="Search">
                    <ReactiveInputComponent
                      renderInputComponent={({selectedValue, setQuery}) => (
                        <CustomInput
                          placeholder="Search by name, practice, tags"
                          underlineColorAndroid="transparent"
                          value={selectedValue}
                          style={[
                            TextStyles.GeneralTextBold,
                            ThemeStyle.searchInput,
                          ]}
                          onChangeText={text => {
                            const query = isNullOrEmpty(text)
                              ? null
                              : {
                                  query: {
                                    query: {
                                      match: {
                                        name: {
                                          query: text,
                                          operator: 'or',
                                        },
                                      },
                                    },
                                  },
                                  value: text,
                                };
                            setQuery(query);
                          }}
                          blurOnSubmit={false}
                        />
                      )}
                    />
                  </ReactiveComponent>
                </View>
                <View style={{flex: 2}}>
                  <ReactiveComponent componentId="mentorFilter">
                    <ReactiveInputComponent
                      renderInputComponent={({selectedValue, setQuery}) => {
                        return (
                          <TouchableOpacity
                            style={styles.pill}
                            onPress={() => {
                              const query = !selectedValue
                                ? {
                                    query: {
                                      query: {
                                        match: {
                                          isMentor: JSON.stringify(
                                            !selectedValue,
                                          ),
                                        },
                                      },
                                    },
                                    value: !selectedValue,
                                  }
                                : null;
                              setQuery(query);
                            }}>
                            <View
                              style={{
                                width: Dimensions.r24,
                                height: Dimensions.r24,
                                borderColor: ThemeStyle.orange
                                  ? ThemeStyle.orange
                                  : ThemeStyle.textExtraLight,
                                borderWidth: Dimensions.r1,
                                backgroundColor: selectedValue
                                  ? ThemeStyle.orange
                                  : ThemeStyle.foreground,
                                borderRadius: Dimensions.r12,
                              }}
                            />
                            <Text
                              style={{
                                ...TextStyles.GeneralTextBold,
                                color: ThemeStyle.orange,
                              }}>
                              Mentor
                            </Text>
                          </TouchableOpacity>
                        );
                      }}
                    />
                  </ReactiveComponent>
                </View>
              </View>
            </Card>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                paddingVertical: Dimensions.marginLarge,
                paddingHorizontal: Dimensions.screenMarginRegular * 2,
              }}>
              {/* <ReactiveComponent componentId="mentorFilter">
                <ReactiveInputComponent
                  renderInputComponent={({selectedValue, setQuery}) => {
                    return (
                      <TouchableOpacity
                        style={styles.pill}
                        onPress={() => {
                          const query = !selectedValue
                            ? {
                                query: {
                                  query: {
                                    match: {
                                      isMentor: JSON.stringify(!selectedValue),
                                    },
                                  },
                                },
                                value: !selectedValue,
                              }
                            : null;
                          setQuery(query);
                        }}>
                        <View
                          style={{
                            width: Dimensions.r24,
                            height: Dimensions.r24,
                            borderColor: selectedValue
                              ? ThemeStyle.green
                              : ThemeStyle.textExtraLight,
                            borderWidth: Dimensions.r1,
                            backgroundColor: selectedValue
                              ? ThemeStyle.green
                              : ThemeStyle.foreground,
                            borderRadius: Dimensions.r12,
                          }}
                        />
                        <Text style={TextStyles.GeneralTextBold}>Mentor</Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </ReactiveComponent> */}

              {/* previousfilterdesign */}
              {/* <TouchableOpacity
                style={styles.pill}
                onPress={() => {
                  this.setState({
                    showFilters: true,
                    topSafeArea: ThemeStyle.backgroundColor,
                  });
                  toggleTabBar(false);
                }}>
                <Image
                  source={require('../../assets/images/filter-icon.png')}
                  style={{
                    width: Dimensions.r16,
                    height: Dimensions.r16,
                    marginVertical: Dimensions.r4,
                  }}
                />
                <Text style={TextStyles.GeneralTextBold}>Filter</Text>
              </TouchableOpacity> */}
            </View>
          </LinearGradient>
          <View
            style={{
              paddingHorizontal: Dimensions.screenMarginRegular,
              paddingBottom: Dimensions.r72,
              flex: 1,
            }}>
            <ReactiveComponent
              componentId="coachFilter"
              defaultQuery={() => ({
                query: {
                  match: {
                    hasPractice: 'true',
                  },
                },
              })}
            />
            <ReactiveList
              dataField="name"
              componentId="results"
              react={{
                and: [
                  'searchFilter',
                  'coachFilter',
                  'mentorFilter',
                  'nameFilter',
                  'genderFilter',
                  'cityFilter',
                  'countryFilter',
                  'featuredFilter',
                ],
              }}
              onData={this.renderCoachItem}
              showResultStats={false}
              showsVerticalScrollIndicators={false}
              // excludeFields={['stripe', 'stripeAccountId', 'libraryItems']}
            />
          </View>
        </View>
        <Filters
          showFilters={showFilters}
          hide={() => {
            this.setState({
              showFilters: false,
              topSafeArea: ThemeStyle.mainColor,
            });
            toggleTabBar(true);
          }}
        />
      </ReactiveBase>,
    );
  }
}

export default withStore(CoachesScreen);
