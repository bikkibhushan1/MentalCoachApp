import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import CachedImage from 'react-native-image-cache-wrapper';
import CustomButton from '../../components/Button';
import Dimensions from '../../styles/Dimensions';
import Icon from '../../components/Icon';
import S3Image from '../../components/S3Image';
import {s3ProtectionLevel} from '../../constants';

export default class ImageViewer extends Component {
  constructor(props) {
    super(props);
    this.state = this.props;
    console.log(this.state);
  }

  render() {
    return (
      <View style={localStyles.containerStyle}>
        <S3Image
          filePath={this.props.navigation.state.params.uri}
          level={s3ProtectionLevel.PROTECTED}
          style={[localStyles.imageStyle]}
          resizeMode={'contain'}
        />
        <TouchableOpacity
          onPress={() => this.props.navigation.goBack(null)}
          style={{position: 'absolute', top: 48, right: 24}}>
          <Icon
            name="ios-close-circle-outline"
            size={28}
            color="white"
            family="Ionicons"
          />
        </TouchableOpacity>
        {this.props.navigation.state.params.onDelete && (
          <CustomButton
            onPress={() => {
              this.props.navigation.state.params.onDelete();
              this.props.navigation.pop();
            }}
            name="Delete"
            style={{
              position: 'absolute',
              bottom: Dimensions.screenMarginRegular,
              left: Dimensions.screenMarginRegular,
              right: Dimensions.screenMarginRegular,
            }}
          />
        )}
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  buttonStyle: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    margin: 20,
  },
  imageStyle: {
    alignSelf: 'stretch',
    flex: 1,
  },
});
