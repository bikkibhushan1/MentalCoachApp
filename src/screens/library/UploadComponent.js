import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  TextInput,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {View} from 'react-native-animatable';
import ImagePicker from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import {PERMISSIONS, RESULTS} from 'react-native-permissions';
import ThemeStyle from '../../styles/ThemeStyle';
import Dimensions from '../../styles/Dimensions';
import TextStyles from '../../styles/TextStyles';
import Card from '../../components/Card';
import {uploadTypes, s3ProtectionLevel} from '../../constants';
import {Storage} from 'aws-amplify';
import {appsyncClient} from '../../../App';
import {addLibraryItems} from '../../queries/library';
import {showMessage} from 'react-native-flash-message';
import {errorMessage, isNullOrEmpty, generateFilePath} from '../../utils';
import validator from 'validator';
import {withStore} from '../../utils/StoreUtils';
import RNFetchBlob from 'rn-fetch-blob';
import CustomInput from '../../components/CustomInput';

const styles = StyleSheet.create({
  uploadOption: {
    backgroundColor: ThemeStyle.foreground,
    borderRadius: Dimensions.r12,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    paddingVertical: Dimensions.r24,
    marginHorizontal: Dimensions.marginExtraSmall,
    ...ThemeStyle.shadow(),
  },
  uploadOptionText: {
    marginTop: Dimensions.marginSmall,
    ...TextStyles.ContentText,
  },
});

class UploadComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedType: null,
      selectedItems: props.initialItems || {
        links: [],
        pdfs: [],
        images: [],
      },
    };
    this.link = '';
  }

  onUploadItem = async selectedType => {
    this.setState({
      selectedType,
    });
    this.props.setLoading(true);
    try {
      switch (selectedType) {
        case uploadTypes.LINK:
          await this.onAddLink();
          break;
        case uploadTypes.IMAGE:
          await this.onPickImage();
          break;
        case uploadTypes.PDF:
          await this.onPickPDF();
          break;
      }
    } catch (error) {
      console.log(error);
      this.props.setLoading(false);
      if (typeof error === 'string') {
        showMessage(errorMessage(error));
      } else {
        showMessage(errorMessage('Something went wrong. Please try again'));
      }
    }
  };

  onAddLink = () => {
    if (
      isNullOrEmpty(this.link) ||
      !validator.isURL(this.link, {protocols: ['http', 'https']})
    ) {
      console.log('INVALID LINK');
      throw 'Please enter a valid URL';
    }
    this.addToLibrary(this.link);
  };

  onPickImage = async () => {
    const options = {
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    ImagePicker.launchImageLibrary(options, async response => {
      try {
        if (!response.didCancel && response.data) {
          console.log('RESPONSE', response.fileName, response.type);
          let fileName = response.fileName;
          if (!fileName) {
            var getFilename = response.uri.split('/');
            fileName = getFilename[getFilename.length - 1];
          }
          const filePath = generateFilePath(
            this.props.user,
            this.state.selectedType,
          );
          console.log('AWS UPLOAD', filePath, fileName);
          const data = await Storage.put(
            `${filePath}/${fileName}`,
            new Buffer(response.data, 'base64'),
            {
              contentType: 'image/png',
              level: s3ProtectionLevel.PROTECTED,
            },
          );
          console.log('AWS UPLOAD', data);
          this.addToLibrary(`${filePath}/${fileName}`);
        } else {
          this.props.setLoading(false);
          return showMessage(errorMessage('Please select an image'));
        }
      } catch (err) {
        this.props.setLoading(false);
        showMessage(errorMessage(typeof err === 'string' ? err : null));
      }
    });
  };

  onPickPDF = async () => {
    if (Platform.OS === 'android') {
      let permissionError = false;
      const status = await PermissionsAndroid.requestMultiple([
        PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
      ]);
      if (status) {
        Object.values(status).forEach(value => {
          if (value !== RESULTS.GRANTED) {
            permissionError = true;
          }
        });
      }
      if (permissionError) {
        this.props.setLoading(false);
        return showMessage(
          errorMessage(
            'Please grant the required permissions to read external storage',
          ),
        );
      }
    }
    const res = await DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
    });
    if (res) {
      let fileUri = res.uri;
      let filePath;
      console.log(res);
      if (Platform.OS === 'ios') {
        let arr = fileUri.split('/');
        const dirs = RNFetchBlob.fs.dirs.DocumentDir;
        const basePath = dirs.replace('Documents', '');
        console.log('DIRS', basePath, dirs);
        let path = fileUri.split(basePath)[1];
        filePath = `${basePath}${path}`;
      } else {
        filePath = fileUri;
      }
      console.log(filePath);
      const data = await RNFetchBlob.fs.readFile(filePath, 'base64');
      let fileName = res.name || `Audio file`;
      const awsFilePath = generateFilePath(
        this.props.user,
        this.state.selectedType,
      );
      const response = await Storage.put(
        `${awsFilePath}/${fileName}`,
        new Buffer(data, 'base64'),
        {
          level: s3ProtectionLevel.PROTECTED,
          contentType: res.type,
        },
      );
      console.log('AWS UPLOAD', response);
      this.addToLibrary(`${awsFilePath}/${fileName}`);
    } else {
      throw 'Please select a file';
    }
  };

  addToLibrary = async item => {
    const {selectedType, selectedItems} = this.state;
    const {isSelect, setLoading} = this.props;
    const libraryItems = {
      links: [],
      pdfs: [],
      images: [],
    };
    libraryItems[selectedType].push(item);
    console.log('ADDING TO LIBRARY', libraryItems);
    try {
      const response = await appsyncClient.mutate({
        mutation: addLibraryItems,
        variables: {
          libraryItems,
        },
      });
      showMessage({
        type: 'success',
        message:
          selectedType === uploadTypes.LINK
            ? 'Link added successfully'
            : 'Upload successful',
      });
      console.log('ADDED TO LIBRARY', response, isSelect);
      if (isSelect) {
        selectedItems[selectedType].push(item);
        this.setState({
          selectedItems,
        });
        this.props.onSelect(selectedItems);
      }
      this.props.setLoading(false);
      return response;
    } catch (err) {
      console.log(err);
      setLoading(false);
      showMessage(errorMessage('Failed to add to library'));
    }
  };

  render() {
    const {selectedType, selectedItems} = this.state;
    const {
      navigation,
      containerStyle,
      isSelect,
      onSelect,
      hideLibrary,
    } = this.props;
    return (
      <View style={containerStyle}>
        <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
          <TouchableOpacity
            key={uploadTypes.LINK}
            onPress={() => {
              this.setState({selectedType: uploadTypes.LINK});
            }}
            style={styles.uploadOption}>
            <Image source={require('../../assets/images/link-icon.png')} />
            <Text style={styles.uploadOptionText}>Link</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              this.onUploadItem(uploadTypes.PDF);
            }}
            key={uploadTypes.PDF}
            style={styles.uploadOption}>
            <Image source={require('../../assets/images/pdf-icon.png')} />
            <Text style={styles.uploadOptionText}>Documents</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              this.onUploadItem(uploadTypes.IMAGE);
            }}
            style={styles.uploadOption}>
            <Image source={require('../../assets/images/image-icon.png')} />
            <Text style={styles.uploadOptionText}>Image</Text>
          </TouchableOpacity>
        </View>
        {selectedType === uploadTypes.LINK && (
          <Card
            style={{marginVertical: Dimensions.marginLarge}}
            contentStyle={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: Dimensions.marginExtraLarge,
            }}>
            <CustomInput
              autoCapitalize={false}
              autoCorrect={false}
              keyboardType="url"
              placeholder="http://www.swasth.coach"
              onChangeText={text => {
                this.link = text;
              }}
            />
            <TouchableOpacity
              onPress={() => {
                this.onUploadItem(uploadTypes.LINK);
              }}>
              <Text
                style={{
                  ...TextStyles.GeneralTextBold,
                  color: ThemeStyle.mainColor,
                  marginHorizontal: Dimensions.marginSmall,
                }}>
                Add Link
              </Text>
            </TouchableOpacity>
          </Card>
        )}
        {!hideLibrary && (
          <Card style={{marginVertical: Dimensions.marginLarge}}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('MyLibrary', {
                  isSelect,
                  selectedItems,
                  onSelect,
                })
              }
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                padding: Dimensions.marginLarge,
              }}>
              <Image source={require('../../assets/images/upload-icon.png')} />
              <Text
                style={{
                  ...TextStyles.GeneralTextBold,
                  color: ThemeStyle.mainColor,
                  marginHorizontal: Dimensions.marginSmall,
                }}>
                Pick from your uploads
              </Text>
            </TouchableOpacity>
          </Card>
        )}
      </View>
    );
  }
}

export default withStore(UploadComponent);
