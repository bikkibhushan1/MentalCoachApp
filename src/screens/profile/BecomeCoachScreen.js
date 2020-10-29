import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import BaseComponent from '../../components/BaseComponent';
import ThemeStyle from '../../styles/ThemeStyle';
import Header from '../../components/Header';
import Dimensions from '../../styles/Dimensions';
import TextStyles from '../../styles/TextStyles';
import CustomButton from '../../components/Button';
import ImagePicker from 'react-native-image-picker';
import InputField from '../../components/InputField';
import {withStore} from '../../utils/StoreUtils';
import {Auth, Storage} from 'aws-amplify';
import {showMessage} from 'react-native-flash-message';
import {errorMessage, isNullOrEmpty, generateFilePath} from '../../utils';
import {fetchUserDetails} from '../../redux/actions/UserActions';
import ProfileImage from '../../components/ProfileImage';
import {s3ProtectionLevel} from '../../constants';
import {StackActions, NavigationActions} from 'react-navigation';
import {appsyncClient} from '../../../App';
import {upsertPractice, requestCoachAccess} from '../../queries/user';
import CustomInput from '../../components/CustomInput';

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
});

class BecomeCoachScreen extends BaseComponent {
  constructor(props) {
    super(props);
    const {
      user: {attributes},
      navigation,
    } = props;
    const practice = navigation.getParam('practice', {});
    this.state.image = props.user.picture;
    this.state.isEditPractice = navigation.getParam('isEditPractice', false);
    this.state.selectedTags = [];
    this.state.tags = [
      'DBT',
      'CBT',
      'ACT',
      'Positive Psychology',
      'Mindfulness',
      'Nutrition',
      'Substance Abuse',
      'Finance',
    ];
    this.imageName =
      attributes.picture && attributes.picture.indexOf('.xml') == -1
        ? attributes.picture
        : '';
    this.name = practice.title;
    this.description = practice.description;
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
    };
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
        this.props.setLoading(false);
        return showMessage(errorMessage('Failed to upload image'));
      }
    } else {
      console.log('UPDATING USER ATTRIBUTES', userDetails);
      this.updateAuthAttributes(user, userDetails);
    }
  };

  updateAuthAttributes = (user, userDetails) => {
    const {navigation} = this.props;
    const {isEditPractice} = this.state;
    return Auth.updateUserAttributes(user, userDetails)
      .then(response => {
        this.props.getUserDetails();
        showMessage({
          type: 'success',
          message: isEditPractice
            ? 'Successfully updated practice'
            : 'Your request to become a coach has been sent successfully. Once approved, you will be able to create programs.',
        });
        if (!isEditPractice) {
          const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({routeName: 'Home'})],
          });
          navigation.dispatch(resetAction);
        }
      })
      .catch(err => {
        console.log('ERROR UPDATING PROFILE', err);
        showMessage(errorMessage('Failed to update profile, try again later'));
      })
      .finally(() => {
        this.props.setLoading(false);
      });
  };

  convertToCoach = async () => {
    appsyncClient
      .mutate({
        mutation: requestCoachAccess,
      })
      .then(data => {
        console.log('REQUEST COACH ACCESS', data);
        if (data.data && data.data.requestCoachAccess) {
          if (data.data.requestCoachAccess.success) {
            showMessage({
              type: 'success',
              message: data.data.requestCoachAccess.message,
            });
          } else {
            showMessage(errorMessage(data.data.requestCoachAccess.message));
          }
        } else {
          showMessage(errorMessage());
        }
        return null;
      })
      .catch(err => {
        console.log('ERROR REQUESTING COACH ACCESS', err);
        showMessage(errorMessage());
        return null;
      });
    // Amplify.configure(
    //   getAmplifyConfig(getEnvVars().SWASTH_COMMONS_ENDPOINT_URL),
    // );
    // const addgroup = `mutation addUserToGroup($groupName: String!){
    //     addUserToGroup(groupName: $groupName){
    //       msg
    //     }
    //   }`;

    // const data = {
    //   groupName: APP.usersGroupCoach,
    // };
    // await API.graphql(graphqlOperation(addgroup, data));
  };

  onSubmit = async () => {
    const {isEditPractice, selectedTags} = this.state;
    try {
      if (isNullOrEmpty(this.name) || isNullOrEmpty(this.description)) {
        return showMessage(
          errorMessage('Please enter a practice name and description'),
        );
      }
      if (!selectedTags || !selectedTags.length) {
        return showMessage(errorMessage('Please select at least one category'));
      }
      this.props.setLoading(true);
      await appsyncClient.mutate({
        mutation: upsertPractice,
        variables: {
          practice: {
            title: this.name,
            description: this.description,
          },
          categories: selectedTags,
        },
      });
      if (!isEditPractice) {
        await this.convertToCoach();
      }
      await this.saveUserData();
    } catch (err) {
      showMessage(errorMessage('Failed to update. Please try again'));
      this.props.setLoading(false);
    }
  };

  renderTagsList = () => {
    const {tags, selectedTags} = this.state;
    let elementsList = [];
    tags.map(data => {
      const isSelected = selectedTags.includes(data);
      elementsList.push(
        <TouchableOpacity
          key={data}
          style={{
            paddingHorizontal: 15,
            borderWidth: 1,
            marginHorizontal: Dimensions.r8,
            marginBottom: 12,
            borderRadius: 25,
            paddingVertical: 7,
            borderColor: ThemeStyle.mainColor,
            backgroundColor: isSelected
              ? ThemeStyle.mainColor
              : ThemeStyle.foreground,
          }}
          onPress={() => {
            if (isSelected) {
              selectedTags.splice(selectedTags.indexOf(data), 1);
            } else {
              selectedTags.push(data);
            }
            this.setState({selectedTags});
          }}>
          <Text
            style={[
              TextStyles.GeneralText,
              {
                color: isSelected ? ThemeStyle.white : ThemeStyle.mainColor,
              },
            ]}>
            {data}
          </Text>
        </TouchableOpacity>,
      );
    });
    return (
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          paddingVertical: Dimensions.marginRegular,
          marginHorizontal: -Dimensions.r8,
        }}>
        {elementsList}
      </View>
    );
  };

  render() {
    const {navigation, user} = this.props;
    const {isUpdated, image, isEditPractice} = this.state;
    return this.renderWithSafeArea(
      <View style={ThemeStyle.pageContainer}>
        <Header
          title={isEditPractice ? 'Edit Practice' : 'Become a Coach'}
          goBack={() => navigation.pop()}
        />
        <ScrollView
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
              avatarSource={image}
              size={Dimensions.r72}
              style={{marginLeft: 0, marginRight: Dimensions.marginRegular}}
            />
            <TouchableOpacity
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
                Change Picture
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
            </TouchableOpacity>
          </View>
          <InputField
            label="Practice Name"
            onPress={() => {
              this.nameInput.focus();
            }}
            renderInputComponent={() => (
              <CustomInput
                ref={ref => {
                  this.nameInput = ref;
                }}
                defaultValue={this.name}
                placeholder="DBT Skills"
                placeholderTextColor={ThemeStyle.textExtraLight}
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
          <Text
            style={[
              TextStyles.GeneralText,
              {color: ThemeStyle.textLight, marginTop: Dimensions.marginLarge},
            ]}>
            Description
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor: ThemeStyle.foreground,
              borderRadius: Dimensions.r20,
              paddingVertical: Dimensions.marginRegular,
              paddingHorizontal: Dimensions.r24,
              marginBottom: Dimensions.marginRegular,
              marginTop: Dimensions.marginRegular,
            }}>
            <CustomInput
              ref={ref => {
                this.descriptionInput = ref;
              }}
              defaultValue={this.description}
              placeholder="Describe your practice here.."
              placeholderTextColor={ThemeStyle.textExtraLight}
              underlineColorAndroid="transparent"
              style={[
                TextStyles.GeneralTextBold,
                {color: ThemeStyle.mainColor, minHeight: Dimensions.r72},
              ]}
              multiline
              onChangeText={text => {
                this.description = text.trim();
                this.setState({
                  isUpdated: true,
                });
              }}
              blurOnSubmit={false}
            />
          </View>
          <Text
            style={[
              TextStyles.GeneralText,
              {color: ThemeStyle.textLight, marginTop: Dimensions.marginLarge},
            ]}>
            Category (Select at least 1)
          </Text>
          {this.renderTagsList()}
          {/* {!isEditPractice && (
            <Fragment>
              <Text
                style={[
                  TextStyles.GeneralText,
                  {
                    color: ThemeStyle.textLight,
                    marginTop: Dimensions.marginLarge,
                  },
                ]}>
                Payments
              </Text>
              <InputField
                label="Stripe"
                onPress={() => {
                  this.nameInput.focus();
                }}
                renderInputComponent={() => (
                  <Text
                    style={[
                      TextStyles.GeneralTextBold,
                      {color: ThemeStyle.mainColor},
                    ]}>
                    Press to connect
                  </Text>
                )}
              />
            </Fragment>
          )} */}
        </ScrollView>
        <CustomButton
          name={`Done`}
          style={{
            position: 'absolute',
            bottom: Dimensions.screenMarginRegular,
            left: Dimensions.screenMarginRegular,
            right: Dimensions.screenMarginRegular,
          }}
          onPress={this.onSubmit}
        />
      </View>,
    );
  }
}

export default withStore(BecomeCoachScreen, undefined, dispatch => ({
  getUserDetails: () => dispatch(fetchUserDetails(true)),
}));
