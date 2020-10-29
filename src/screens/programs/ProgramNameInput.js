import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import ThemeStyle from '../../styles/ThemeStyle';
import TextStyles from '../../styles/TextStyles';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/Button';
import {generateFilePath, errorMessage, isNullOrEmpty} from '../../utils';
import {uploadTypes, s3ProtectionLevel} from '../../constants';
import {Storage} from 'aws-amplify';
import ImagePicker from 'react-native-image-picker';
import {showMessage} from 'react-native-flash-message';
import Dimensions, {responsiveDimension} from '../../styles/Dimensions';
import {withStore} from '../../utils/StoreUtils';

export default class ProgramNameInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.programName = props.program.name;
    this.programDescription = props.program.description;
  }

  pickImage = () => {
    const {program, onUpdateImage} = this.props;
    this.props.setLoading(true);
    const options = {
      title: 'Select Program Image',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    ImagePicker.showImagePicker(options, async response => {
      if (!response.didCancel && response.data) {
        console.log('RESPONSE', response.fileName, response.type);
        const source = {uri: response.uri};
        this.setState({
          avatarSource: source,
        });
        this.props.setLoading(true);
        let fileName = response.fileName;
        if (!fileName) {
          var getFilename = response.uri.split('/');
          fileName = getFilename[getFilename.length - 1];
        }
        const filePath = generateFilePath(this.props.user, uploadTypes.IMAGE);
        console.log('AWS UPLOAD', filePath, fileName);
        const data = await Storage.put(
          `${filePath}/${fileName}`,
          new Buffer(response.data, 'base64'),
          {
            contentType: 'image/png',
            level: s3ProtectionLevel.PUBLIC,
          },
        );
        program.image = `${filePath}/${fileName}`;
        onUpdateImage(program.image);
        this.props.setLoading(false);
        console.log('AWS UPLOAD', data);
      } else {
        this.props.setLoading(false);
        showMessage(errorMessage('Please select an image'));
      }
    });
  };

  onContinue = () => {
    const {onContinue, program} = this.props;
    if (isNullOrEmpty(this.programName)) {
      return showMessage(errorMessage('Please enter a program name'));
    }
    program.name = this.programName;
    program.description = isNullOrEmpty(this.programDescription)
      ? null
      : this.programDescription;
    onContinue(program);
  };

  render() {
    const {program} = this.props;
    return (
      <View style={{paddingHorizontal: Dimensions.screenMarginRegular}}>
        <Text
          style={[
            TextStyles.GeneralTextBold,
            {marginTop: Dimensions.r48, color: ThemeStyle.textLight},
          ]}>
          NAME
        </Text>
        <CustomInput
          style={[TextStyles.HeaderBold, {marginTop: Dimensions.marginRegular}]}
          placeholder={'Enter Name'}
          underlineColorAndroid="transparent"
          onChangeText={text => {
            text = text.trim();
            this.programName = text;
          }}
          defaultValue={program.name}
        />
        <Text
          style={[
            TextStyles.GeneralTextBold,
            {marginTop: Dimensions.r32, color: ThemeStyle.textLight},
          ]}>
          DESCRIPTION
        </Text>
        <CustomInput
          style={[
            TextStyles.GeneralText,
            {marginTop: Dimensions.marginRegular, height: Dimensions.r96},
          ]}
          placeholder={'Enter Description'}
          underlineColorAndroid="transparent"
          multiline={true}
          onChangeText={text => {
            text = text.trim();
            this.programDescription = text;
          }}
          defaultValue={program.description}
          maxLength={300}
        />
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: -Dimensions.r16,
            right: Dimensions.r32,
            backgroundColor: ThemeStyle.mainColor,
            borderRadius: Dimensions.r16,
            width: Dimensions.r32,
            height: Dimensions.r32,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={this.pickImage}>
          <Image source={require('../../assets/images/Add-icon.png')} />
        </TouchableOpacity>
      </View>
    );
  }
}
