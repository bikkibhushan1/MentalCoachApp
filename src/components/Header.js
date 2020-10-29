import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Platform,
  Image,
  TouchableOpacity,
} from 'react-native';
import ThemeStyle from './../styles/ThemeStyle';
import textStyles from './../styles/TextStyles';

const Header = props => {
  let onIconClick = props.goBack;
  let iconName = require('../assets/images/arrow-icon.png');

  if (props.isDrawer) {
    onIconClick = props.openDrawer;
    iconName = require('../assets/images/Menu.png');
  }
  if (props.isClose) {
    onIconClick = props.onClose;
    iconName = require('../assets/images/cross.png');
  }
  if (props.icon) {
    iconName = props.icon;
    onIconClick = props.onIconClick;
  }
  return (
    <View style={[styles.navBar, props.navBarStyle]}>
      <View
        style={{
          flex: 1,
          alignItems: 'flex-start',
          marginLeft: 12,
          justifyContent: 'center',
        }}>
        <TouchableHighlight
          style={{flex: 1, justifyContent: 'center', padding: 8}}
          underlayColor={ThemeStyle.accentColor + '33'}
          onPress={onIconClick}>
          <Image
            source={iconName}
            style={{
              tintColor: props.isLightContent
                ? '#fff'
                : props.goBack
                ? ThemeStyle.textRegular
                : undefined,
            }}
          />
        </TouchableHighlight>
      </View>
      <View style={{flex: 3, alignItems: 'center', justifyContent: 'center'}}>
        <Text
          style={[
            textStyles.SubHeaderBold,
            {
              color: props.isLightContent ? '#fff' : ThemeStyle.textRegular,
              textAlign: 'center',
            },
          ]}>
          {props.title}
        </Text>
      </View>
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        {props.rightIcon && (
          <TouchableOpacity
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={props.onRightIconClick}>
            {props.rightIcon()}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  navBar: {
    backgroundColor: ThemeStyle.backgroundColor,
    height: Platform.OS === 'ios' ? 64 : 54,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
