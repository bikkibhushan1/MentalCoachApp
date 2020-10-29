import React from 'react';
import {TextInput, View} from 'react-native';

export default class CustomInput extends React.Component {
  focus() {
    this.input.focus();
  }

  render() {
    return (
      <TextInput
        textAlign={'auto'}
        ref={ref => {
          this.input = ref;
        }}
        underlineColorAndroid="transparent"
        {...this.props}
        style={[{padding: 0}, this.props.style]}
      />
    );
  }
}
