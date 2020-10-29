import React from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import BaseComponent from '../../components/BaseComponent';
import ThemeStyle from '../../styles/ThemeStyle';
import Header from '../../components/Header';
import LinearGradient from 'react-native-linear-gradient';
import Dimensions from '../../styles/Dimensions';
import TextStyles from '../../styles/TextStyles';
import Card from '../../components/Card';
import {Switch} from 'react-native-gesture-handler';
import {withStore} from '../../utils/StoreUtils';
import CustomButton from '../../components/Button';
import {Auth} from 'aws-amplify';
import AsyncStorage from '@react-native-community/async-storage';
import {StackActions, NavigationActions} from 'react-navigation';
import ProfileImage from '../../components/ProfileImage';
import {showMessage} from 'react-native-flash-message';
import {APP} from '../../constants';
import {editUserProfile, clearUserState} from '../../redux/actions/UserActions';
import {errorMessage} from '../../utils';
import {appsyncClient} from '../../../App';
import Icon from './../../components/Icon';

class ProfileScreen extends BaseComponent {
  constructor(props) {
    super(props);
    this.state.topSafeArea = ThemeStyle.mainColor;
  }

  convertToMentor = async () => {
    const {user} = this.props;
    const response = await this.props.editUserProfile({
      isMentor: !user.isMentor,
    });
    console.log('RESPONSE', response);
    if (response) {
      showMessage({type: 'success', message: 'Successfully updated'});
    } else {
      showMessage(errorMessage('Failed to update. Please try again'));
    }
  };

  onLogout = () => {
    Auth.signOut()
      .then(data => {
        AsyncStorage.clear();
        appsyncClient.resetStore();
        appsyncClient.clearStore();
        this.props.clearUser();
        const resetAction = StackActions.reset({
          index: 0,
          actions: [NavigationActions.navigate({routeName: 'Splash'})],
        });
        this.props.navigation.dispatch(resetAction);
      })
      .catch(err => {
        console.log(err);
        showMessage({
          message: 'Failed to logout. Please try again',
          type: 'danger',
        });
      });
  };

  renderRowItem({icon, text, onPress, styles = {}}) {
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          flex: 1,
          alignItems: 'center',
          paddingHorizontal: Dimensions.r24,
          paddingVertical: Dimensions.marginRegular,
          ...styles.container,
        }}
        onPress={onPress}>
        <Image
          source={icon}
          style={{
            width: Dimensions.r28,
            height: Dimensions.r28,
            margin: Dimensions.r4,
            ...styles.icon,
          }}
          resizeMode="contain"
        />
        <Text
          style={[
            TextStyles.SubHeaderBold,
            {
              color: ThemeStyle.textLight,
              marginLeft: Dimensions.marginRegular,
              ...styles.text,
            },
          ]}>
          {text}
        </Text>
      </TouchableOpacity>
    );
  }

  render() {
    const {navigation, isCoach, user} = this.props;
    console.log('USER', user, isCoach);
    return this.renderWithSafeArea(
      <ScrollView
        style={ThemeStyle.pageContainer}
        contentContainerStyle={{paddingBottom: Dimensions.r96}}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={ThemeStyle.gradientColor}
          style={{
            borderBottomLeftRadius: Dimensions.r24,
            borderBottomRightRadius: Dimensions.r24,
            paddingBottom: Dimensions.marginExtraLarge,
            marginBottom: Dimensions.marginLarge,
          }}>
          <View
            style={{
              flexDirection: 'row',
              marginLeft: Dimensions.marginRegular,
              marginRight: Dimensions.marginRegular,
            }}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('splashtest');
              }}>
              <Image
                source={require('../../assets/images/notification-icon.png')}
              />
            </TouchableOpacity>
            <View style={{flex: 1}}>
              <Header
                title="Profile"
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
          {/* <Header
            title="Profile"
            // icon={require('../../assets/images/notification-icon.png')}
            icon={'null'}
            isLightContent
            navBarStyle={{backgroundColor: 'transparent'}}
          /> */}
          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: Dimensions.screenMarginRegular,
              paddingVertical: Dimensions.marginLarge,
              alignItems: 'center',
            }}>
            <ProfileImage
              style={{margin: 0}}
              size={Dimensions.r72}
              avatarSource={user.picture}
            />
            <View
              style={{
                paddingHorizontal: Dimensions.marginLarge,
              }}>
              <Text style={[TextStyles.HeaderBold, {color: ThemeStyle.white}]}>
                {user.name}
              </Text>
              <Text style={TextStyles.GeneralText}>My Profile</Text>
            </View>
            <TouchableOpacity
              style={{
                position: 'absolute',
                right: Dimensions.screenMarginRegular,
              }}
              onPress={() => {
                navigation.navigate('EditProfile');
              }}>
              <Image
                source={require('../../assets/images/Life-Coach-redsign-Assets/Edit-icon.png')}
              />
            </TouchableOpacity>
          </View>
          {isCoach && (
            <View
              style={{
                paddingHorizontal: Dimensions.screenMarginRegular,
                flexWrap: 'wrap',
                flexDirection: 'row',
              }}>
              <Card style={{}} cardRadius={Dimensions.r20}>
                {this.renderRowItem({
                  onPress: () => {
                    navigation.navigate('MyPractice');
                  },
                  styles: {
                    container: {
                      paddingHorizontal: Dimensions.r32,
                    },
                  },
                  text: 'My Practice',
                  icon: require('../../assets/images/Life-Coach-redsign-Assets/Shape.png'),
                })}
              </Card>
              <Card style={{}} cardRadius={Dimensions.r20}>
                {this.renderRowItem({
                  onPress: () => {
                    navigation.navigate('MyPrograms');
                  },
                  styles: {
                    container: {
                      paddingHorizontal: Dimensions.r32,
                    },
                  },
                  text: 'My Program',
                  icon: require('../../assets/images/Life-Coach-redsign-Assets/Shape.png'),
                })}
              </Card>
            </View>
          )}
          {isCoach && (
            <Card
              cardRadius={Dimensions.r20}
              style={{
                marginHorizontal: Dimensions.screenMarginRegular,
                marginVertical: Dimensions.marginRegular,
              }}>
              {this.renderRowItem({
                onPress: () => {},
                text: 'Co-coaching Sessions',
                icon: require('../../assets/images/cocoachingsession-icon.png'),
              })}
            </Card>
          )}
          <Card
            cardRadius={Dimensions.r32}
            style={{
              marginHorizontal: Dimensions.screenMarginRegular,
              paddingVertical: Dimensions.marginRegular,
            }}>
            {/* {isCoach &&
              this.renderRowItem({
                onPress: () => {},
                text: 'My Finances',
                icon: require('../../assets/images/Life-Coach-redsign-Assets/My-finances-profile-icon.png'),
              })} */}
            {this.renderRowItem({
              onPress: () => {
                navigation.navigate('MyLibrary', {isSelect: false});
              },
              text: 'My Library',
              icon: require('../../assets/images/Life-Coach-redsign-Assets/my-library-profile-icon.png'),
            })}
          </Card>
        </LinearGradient>
        {/* {isCoach && (
          <View>
            <Card
              cardRadius={Dimensions.r12}
              style={{
                marginHorizontal: Dimensions.screenMarginRegular,
                marginVertical: Dimensions.marginRegular,
                paddingVertical: Dimensions.marginRegular,
                shadowColor: 'transparent',
              }}>
              {this.renderRowItem({
                onPress: this.convertToMentor,
                text: `I'm a Mentor`,
                icon: require('../../assets/images/mentor-icon.png'),
                styles: {
                  icon: {
                    margin: 0,
                    width: Dimensions.r40,
                    height: Dimensions.r40,
                  },
                  text: {
                    color: ThemeStyle.textRegular,
                  },
                },
              })}
              <Switch
                value={user.isMentor}
                style={{
                  position: 'absolute',
                  right: Dimensions.marginRegular,
                  top: Dimensions.r16,
                }}
                onValueChange={this.convertToMentor}
              />
            </Card>
            <Text
              style={[
                TextStyles.ContentText,
                {
                  marginHorizontal: Dimensions.screenMarginRegular,
                  color: ThemeStyle.textLight,
                },
              ]}>
              Mentor is a coach who offers other coaches help and advice
            </Text>
          </View>
        )} */}
        <Text
          style={[
            TextStyles.SubHeader2,
            {
              marginVertical: Dimensions.marginRegular,
              marginHorizontal: Dimensions.screenMarginRegular,
            },
          ]}>
          General
        </Text>
        <Card
          cardRadius={Dimensions.r32}
          style={{
            marginHorizontal: Dimensions.screenMarginRegular,
            paddingVertical: Dimensions.marginRegular,
            marginBottom: Dimensions.marginLarge,
          }}>
          {this.renderRowItem({
            onPress: () => {
              navigation.navigate('JoinedPrograms');
            },
            text: 'Joined Programs',
            icon: require('../../assets/images/Joined-program-icon.png'),
          })}
          {/* {this.renderRowItem({
            onPress: () => {},
            text: 'Payment Methods',
            icon: require('../../assets/images/Payment-method-icon.png'),
          })} */}
          {/* {!isCoach &&
            this.renderRowItem({
              onPress: () => {},
              text: 'Purchase History',
              icon: require('../../assets/images/purchase-history-icon.png'),
            })} */}

          {this.renderRowItem({
            onPress: () => {},
            text: 'Settings',
            icon: require('../../assets/images/purchase-history-icon.png'),
          })}
        </Card>
        {!isCoach && (
          <Card
            cardRadius={Dimensions.r32}
            style={{
              marginHorizontal: Dimensions.screenMarginRegular,
              marginVertical: Dimensions.marginRegular,
              paddingVertical: Dimensions.marginRegular,
              shadowColor: 'transparent',
              backgroundColor: ThemeStyle.accentColor2,
            }}>
            {this.renderRowItem({
              onPress: () => {
                navigation.navigate('BecomeCoach');
              },
              text: `Become a Coach`,
              icon: require('../../assets/images/individual-icon.png'),
              styles: {
                icon: {
                  margin: 0,
                  width: Dimensions.r40,
                  height: Dimensions.r40,
                },
                text: {
                  color: ThemeStyle.white,
                },
              },
            })}
          </Card>
        )}
        <Text
          style={[
            TextStyles.SubHeader2,
            {
              marginVertical: Dimensions.marginRegular,
              marginHorizontal: Dimensions.screenMarginRegular,
            },
          ]}>
          Support
        </Text>
        <Card
          cardRadius={Dimensions.r32}
          style={{
            marginHorizontal: Dimensions.screenMarginRegular,
            paddingVertical: Dimensions.marginRegular,
          }}>
          {this.renderRowItem({
            onPress: () => {
              Linking.openURL(APP.support);
            },
            text: 'Report Problem',
            icon: require('../../assets/images/report-icon.png'),
          })}
          {this.renderRowItem({
            onPress: () => {
              Linking.openURL(APP.privacyPolicy);
            },
            text: 'Privacy',
            icon: require('../../assets/images/privacy-icon.png'),
          })}
          {this.renderRowItem({
            onPress: () => {
              Linking.openURL(APP.privacyPolicy);
            },
            text: 'About',
            icon: require('../../assets/images/privacy-icon.png'),
          })}
        </Card>
        <CustomButton
          name={`Sign Out`}
          noGradient
          onPress={this.onLogout}
          style={{
            borderWidth: Dimensions.r2,
            borderColor: ThemeStyle.red,
            margin: Dimensions.screenMarginRegular,
          }}
          textStyle={{color: ThemeStyle.red}}
        />
      </ScrollView>,
    );
  }
}

export default withStore(ProfileScreen, undefined, dispatch => ({
  editUserProfile: profile => dispatch(editUserProfile(profile)),
  clearUser: () => dispatch(clearUserState()),
}));
