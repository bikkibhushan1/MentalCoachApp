import React from 'react';
import {StyleSheet, TouchableOpacity, Text} from 'react-native';
import ThemeStyle from '../styles/ThemeStyle';
import Dimensions from '../styles/Dimensions';
import TextStyles from '../styles/TextStyles';

const InputField = ({label, onPress, renderInputComponent, style}) => {
  return (
    <TouchableOpacity style={[styles.itemContainer, style]} onPress={onPress}>
      <Text
        style={{
          ...TextStyles.GeneralTextBold,
          marginRight: Dimensions.marginLarge,
        }}>
        {label}
      </Text>
      {renderInputComponent()}
    </TouchableOpacity>
  );
};
export default InputField;

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: ThemeStyle.foreground,
    borderRadius: Dimensions.r20,
    paddingVertical: Dimensions.r28,
    paddingHorizontal: Dimensions.r24,
    marginBottom: Dimensions.marginRegular,

    shadowColor: 'rgba(78,103,193,0.2)',
    shadowOffset: {height: 2},
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
});
