import React, {Component} from 'react';
import {View, ActivityIndicator} from 'react-native';
import ThemeStyle from '../styles/ThemeStyle';

export default class Loader extends Component {
  render() {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator animating={true} color={ThemeStyle.mainColor} />
      </View>
    );
  }
}
