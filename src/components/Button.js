import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Platform} from 'react-native';
import textStyle from '../styles/TextStyles';
import ThemeStyle from '../styles/ThemeStyle';
import LinearGradient from 'react-native-linear-gradient';

const CustomButton = props => {
  const Component = props.noGradient ? View : LinearGradient;
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      underlayColor={ThemeStyle.accentColor + '66'}
      onPress={props.onPress}
      disabled={props.disabled}
      style={[styles.touches, props.style]}>
      {!props.noGradient && (
        <LinearGradient
          style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}
          colors={ThemeStyle.gradientColor}
          start={props.noGradient ? undefined : {x: 0.8, y: 0}}
          end={props.noGradient ? undefined : {x: 0, y: 1}}
        />
      )}
      {props.renderIcon && (
        <View style={{marginRight: 8}}>{props.renderIcon()}</View>
      )}
      <Text style={[textStyle.GeneralText, styles.text, props.textStyle]}>
        {props.name}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  touches: {
    borderRadius: 32,
    minWidth: 128,
    paddingVertical: 16,
    paddingHorizontal: 24,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
