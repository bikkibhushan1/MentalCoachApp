import React, {Component} from 'react';
import {View, StyleSheet, PixelRatio, ActivityIndicator} from 'react-native';
import CachedImage from 'react-native-image-cache-wrapper';
import {Storage} from 'aws-amplify';
import ThemeStyle from '../styles/ThemeStyle';

export default class S3Image extends Component {
  constructor() {
    super();
    this.state = {
      urlLoaded: false,
      url: null,
      placeHolder: null,
    };
  }

  componentDidMount() {
    this.fetchImage();
  }

  fetchImage = async () => {
    const {filePath, level, placeHolder} = this.props;
    try {
      if (filePath) {
        const url = await Storage.get(filePath, {level});
        console.log('S3 URL', url);
        this.setState({
          urlLoaded: true,
          url,
        });
      } else {
        this.setState({
          urlLoaded: true,
          placeHolder,
        });
      }
    } catch (err) {
      console.warn(err);
    }
  };

  render() {
    return this.state.urlLoaded ? this.renderImage() : this.renderLoading();
  }

  renderLoading() {
    const {style, loaderColor, loaderSize} = this.props;
    return (
      <View style={[style, {justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator
          animating
          color={loaderColor || ThemeStyle.mainColor}
          size={loaderSize || loaderSize}
        />
      </View>
    );
  }

  renderPlaceHolder() {}

  renderImage() {
    const {placeHolder, url} = this.state;
    const {filePath} = this.props;
    return (
      <CachedImage
        key={filePath}
        style={this.props.style}
        source={!url ? placeHolder : {uri: url}}
        cacheKey={filePath}
        resizeMode={this.props.resizeMode}
        activityIndicator={
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
            }}>
            <ActivityIndicator />
          </View>
        }>
        {this.props.children}
      </CachedImage>
    );
  }
}

const styles = StyleSheet.create({
  background: {backgroundColor: 'rgba(0,0,0,0.2)'},
});
