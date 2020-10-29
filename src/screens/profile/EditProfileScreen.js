import React from 'react';
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';
import BaseComponent from '../../components/BaseComponent';
import ThemeStyle from '../../styles/ThemeStyle';
import Header from '../../components/Header';
import Dimensions from '../../styles/Dimensions';
import TextStyles from '../../styles/TextStyles';
import CustomButton from '../../components/Button';
import ModalDropdown from 'react-native-modal-dropdown';
import ImagePicker from 'react-native-image-picker';
import InputField from '../../components/InputField';
import {withStore} from '../../utils/StoreUtils';
import {Auth, Storage} from 'aws-amplify';
import {showMessage} from 'react-native-flash-message';
import {errorMessage, generateFilePath} from '../../utils';
import {
  fetchUserDetails,
  editUserProfile,
} from '../../redux/actions/UserActions';
import ProfileImage from '../../components/ProfileImage';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {s3ProtectionLevel} from '../../constants';
import CustomInput from '../../components/CustomInput';
import Icon from '../../components/Icon';
import Card from '../../components/Card';

const styles = StyleSheet.create({
  profileItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: ThemeStyle.foreground,
    borderRadius: Dimensions.r20,
    paddingVertical: Dimensions.r28,
    paddingHorizontal: Dimensions.r24,
    marginBottom: Dimensions.marginRegular,
  },
  profileEmailContainer: {
    flexDirection: 'row',

    backgroundColor: ThemeStyle.foreground,
    borderRadius: Dimensions.r20,
    paddingVertical: Dimensions.r28,
    paddingHorizontal: Dimensions.r24,
    marginBottom: Dimensions.marginRegular,
    marginTop: Dimensions.marginRegular,
    shadowColor: 'rgba(78,103,193,0.2)',
    shadowOffset: {height: 2},
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
});

class EditProfileScreen extends BaseComponent {
  constructor(props) {
    super(props);
    const {
      user: {attributes, address},
    } = props;
    this.state.image = props.user.picture;
    this.name = attributes.name;
    this.gender = attributes.gender;
    this.imageName =
      attributes.picture && attributes.picture.indexOf('.xml') == -1
        ? attributes.picture
        : '';
    if (address) {
      this.city = address.city;
      this.country = address.country;
      this.zipcode = address.zip;
    }
  }

  pickImage = async () => {
    const options = {
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    try {
      ImagePicker.launchImageLibrary(options, image => {
        if (image && image.error) {
          showMessage(
            errorMessage(
              image.error ||
                'Unable to access photos. Please make sure you have granted the permissions',
            ),
          );
        } else if (image && image.uri) {
          let fileName = image.fileName;
          if (!fileName) {
            var getFilename = image.uri.split('/');
            fileName = getFilename[getFilename.length - 1];
          }
          const filePath = generateFilePath(this.props.user, 'coach');
          this.setState({
            image: image.uri,
            imageData: image,
            fileName: `profile-image-${fileName}`,
            filePath,
            isUpdated: true,
          });
        }
      });
    } catch (err) {
      console.log(err);
      showMessage(
        errorMessage(
          'Unable to access photos. Please make sure you have granted the permissions',
        ),
      );
    }
  };

  saveUserData = async () => {
    let userDetails = {
      picture: this.imageName || '',
      name: this.name,
    };
    if (this.gender) {
      userDetails.gender = this.gender;
    }
    console.log('SAVE USER DATA', userDetails);
    this.props.setLoading(true);
    let user = await Auth.currentAuthenticatedUser({
      bypassCache: true,
    });
    if (
      this.state.image &&
      this.state.image.indexOf('profile-image-') == -1 &&
      this.state.image.indexOf('.xml') == -1
    ) {
      const {filePath, fileName} = this.state;
      console.log('AWS UPLOAD', filePath, fileName);
      try {
        const data = await Storage.put(
          `${filePath}/${fileName}`,
          new Buffer(this.state.imageData.data, 'base64'),
          {
            contentType: 'image/png',
            level: s3ProtectionLevel.PUBLIC,
          },
        );
        console.log(data);
        userDetails.picture = `${filePath}/${fileName}`;
        console.log('UPDATING USER ATTRIBUTES', userDetails);
        return this.updateAuthAttributes(user, userDetails);
      } catch (err) {
        console.log(err);
        return showMessage(errorMessage('Failed to upload image'));
      }
    } else {
      console.log('UPDATING USER ATTRIBUTES', userDetails);
      this.updateAuthAttributes(user, userDetails);
    }
  };

  updateAuthAttributes = (user, userDetails) => {
    return Auth.updateUserAttributes(user, userDetails)
      .then(response => {
        this.props.editUserProfile({
          ...userDetails,
          address: {
            city: this.city,
            country: this.country,
            zip: this.zipcode,
          },
          email: user.attributes.email,
        });
        this.props.getUserDetails();
        this.setState({isUpdated: false});
        showMessage({
          type: 'success',
          message: 'Profile saved successfully!',
        });
      })
      .catch(err => {
        console.log('ERROR UPDATING PROFILE', err);
        showMessage(errorMessage('Failed to update profile, try again later'));
      })
      .finally(() => {
        this.props.setLoading(false);
      });
  };

  renderProfileItem({title, value}) {
    return (
      <TouchableOpacity
        style={styles.profileItemContainer}
        onPress={() => {
          this[title].focus();
        }}>
        <Text style={TextStyles.GeneralTextBold}>{title}</Text>
        <CustomInput
          ref={ref => {
            this[title] = ref;
          }}
          defaultValue={value}
          underlineColorAndroid="transparent"
          style={[TextStyles.GeneralTextBold, {color: ThemeStyle.mainColor}]}
          blurOnSubmit={false}
        />
      </TouchableOpacity>
    );
  }

  render() {
    const {navigation, user} = this.props;
    const {isUpdated, image, imageData} = this.state;
    return this.renderWithSafeArea(
      <View style={ThemeStyle.pageContainer}>
        <Header title="Edit Profile" goBack={() => navigation.pop()} />
        <KeyboardAwareScrollView
          contentContainerStyle={{
            paddingHorizontal: Dimensions.screenMarginRegular,
            paddingBottom: Dimensions.r72,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: Dimensions.marginExtraLarge,
            }}>
            <ProfileImage
              key={imageData ? 'placeHolder' : 'avatar'}
              avatarSource={!imageData && image}
              placeHolder={imageData && {uri: image}}
            />
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: Dimensions.r68,
                left: Dimensions.r80,
              }}
              onPress={this.pickImage}>
              <Image
                source={require('../../assets/images/Life-Coach-redsign-Assets/Edit-icon.png')}
              />
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={{
                borderRadius: Dimensions.r20,
                paddingHorizontal: Dimensions.marginExtraLarge,
                paddingVertical: Dimensions.marginSmall,
                borderColor: ThemeStyle.mainColor,
                borderWidth: Dimensions.r2,
                marginHorizontal: Dimensions.marginSmall,
              }}
              onPress={this.pickImage}>
              <Text
                style={[
                  TextStyles.ContentTextBold,
                  {color: ThemeStyle.mainColor},
                ]}>
                Change
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                borderRadius: Dimensions.r20,
                paddingHorizontal: Dimensions.marginExtraLarge,
                paddingVertical: Dimensions.marginSmall,
                backgroundColor: ThemeStyle.textExtraLight,
                marginHorizontal: Dimensions.marginSmall,
              }}
              onPress={() => {
                this.imageName = null;
                this.setState({
                  image: '',
                  isUpdated: true,
                });
              }}>
              <Text style={TextStyles.ContentTextBold}>Remove</Text>
            </TouchableOpacity> */}
          </View>
          <InputField
            label="Name"
            onPress={() => {
              this.nameInput.focus();
            }}
            renderInputComponent={() => (
              <CustomInput
                ref={ref => {
                  this.nameInput = ref;
                }}
                defaultValue={this.name}
                underlineColorAndroid="transparent"
                style={[
                  TextStyles.GeneralTextBold,
                  {color: ThemeStyle.mainColor},
                ]}
                onChangeText={text => {
                  this.name = text.trim();
                  this.setState({
                    isUpdated: true,
                  });
                }}
                blurOnSubmit={false}
              />
            )}
          />
          <InputField
            label="Gender"
            onPress={() => {
              this.genderInput.show();
            }}
            renderInputComponent={() => (
              <ModalDropdown
                ref={ref => {
                  this.genderInput = ref;
                }}
                defaultValue={this.gender}
                options={[`Male`, `Female`, `Other`]}
                textStyle={[
                  TextStyles.GeneralTextBold,
                  {color: ThemeStyle.mainColor},
                ]}
                dropdownTextStyle={TextStyles.GeneralTextBold}
                dropdownStyle={{minWidth: 100}}
                onSelect={(_index, value) => {
                  this.gender = value;
                  this.setState({
                    isUpdated: true,
                  });
                }}
              />
            )}
          />
          <InputField
            label="Location"
            onPress={() => {
              this.countryInput.focus();
            }}
            renderInputComponent={() => (
              <CustomInput
                ref={ref => {
                  this.countryInput = ref;
                }}
                placeholder={'United States'}
                defaultValue={this.country}
                underlineColorAndroid="transparent"
                style={[
                  TextStyles.GeneralTextBold,
                  {color: ThemeStyle.mainColor},
                  {textAlign: 'right'},
                ]}
                onChangeText={text => {
                  this.country = text.trim();
                  this.setState({
                    isUpdated: true,
                  });
                }}
                blurOnSubmit={false}
              />
            )}
          />
          {/* <InputField
            label="City"
            onPress={() => {
              this.cityInput.focus();
            }}
            renderInputComponent={() => (
              <CustomInput
                ref={ref => {
                  this.cityInput = ref;
                }}
                placeholder="Indianapolis"
                defaultValue={this.city}
                underlineColorAndroid="transparent"
                style={[
                  TextStyles.GeneralTextBold,
                  {color: ThemeStyle.mainColor},
                ]}
                onChangeText={text => {
                  this.city = text.trim();
                  this.setState({
                    isUpdated: true,
                  });
                }}
                blurOnSubmit={false}
              />
            )}
          /> */}
          {/* <InputField
            label="Country"
            onPress={() => {
              this.countryInput.focus();
            }}
            renderInputComponent={() => (
              <CustomInput
                ref={ref => {
                  this.countryInput = ref;
                }}
                placeholder={'United States'}
                defaultValue={this.country}
                underlineColorAndroid="transparent"
                style={[
                  TextStyles.GeneralTextBold,
                  {color: ThemeStyle.mainColor},
                ]}
                onChangeText={text => {
                  this.country = text.trim();
                  this.setState({
                    isUpdated: true,
                  });
                }}
                blurOnSubmit={false}
              />
            )}
          /> */}
          {/* <InputField
            label="Zipcode"
            onPress={() => {
              this.zipInput.focus();
            }}
            renderInputComponent={() => (
              <CustomInput
                ref={ref => {
                  this.zipInput = ref;
                }}
                defaultValue={this.zipcode}
                underlineColorAndroid="transparent"
                style={[
                  TextStyles.GeneralTextBold,
                  {color: ThemeStyle.mainColor},
                ]}
                placeholder="46208"
                onChangeText={text => {
                  this.zipcode = text.trim();
                  this.setState({
                    isUpdated: true,
                  });
                }}
                keyboardType="number-pad"
                blurOnSubmit={false}
              />
            )}
          /> */}
          <Text
            style={[
              TextStyles.GeneralText,
              {
                color: ThemeStyle.textLight,
                marginTop: Dimensions.marginLarge,
                marginLeft: Dimensions.marginRegular,
              },
            ]}>
            Email
          </Text>
          <View style={styles.profileEmailContainer}>
            <View style={{flex: 1}}>
              <Icon
                family={'AntDesign'}
                name={'heart'}
                color={ThemeStyle.accentColor}
              />
            </View>
            <View style={{flex: 6, alignSelf: 'center'}}>
              <Text
                style={[
                  TextStyles.GeneralTextBold,
                  {color: ThemeStyle.accentColor},
                ]}>
                {user.attributes.email}
              </Text>
            </View>
          </View>
        </KeyboardAwareScrollView>
        {isUpdated && (
          <CustomButton
            name={`Save Changes`}
            noGradient
            style={{
              borderWidth: Dimensions.r2,
              borderColor: ThemeStyle.red,
              position: 'absolute',
              bottom: Dimensions.screenMarginRegular,
              left: Dimensions.screenMarginRegular,
              right: Dimensions.screenMarginRegular,
              backgroundColor: ThemeStyle.foreground,
            }}
            onPress={this.saveUserData}
            textStyle={{color: ThemeStyle.red}}
          />
        )}
      </View>,
    );
  }
}

export default withStore(EditProfileScreen, undefined, dispatch => ({
  getUserDetails: () => dispatch(fetchUserDetails(true)),
  editUserProfile: profile => dispatch(editUserProfile(profile)),
}));
