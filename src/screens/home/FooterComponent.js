import React, {Component} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import tabRoutes from './routes';
import ThemeStyle from '../../styles/ThemeStyle';
import TextStyles from '../../styles/TextStyles';
import Dimensions from '../../styles/Dimensions';

export default class FooterContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentRoute: tabRoutes.Dashboard.name,
    };
  }

  isActive = name => {
    return this.state.currentRoute === name;
  };

  activeOpacity = name => {
    return this.isActive(name) ? 1 : 0.7;
  };

  navigateTo = (name, params) => {
    const {onChangeSelectedTab} = this.props;
    console.log('NAVIGATION', this.state.currentRoute, name, params);
    if (this.state.currentRoute !== name) {
      onChangeSelectedTab(name);
      this.setState({
        currentRoute: name,
      });
    }
  };

  renderItem(image, route) {
    const isActive = this.isActive(route);
    return (
      <TouchableOpacity
        style={[styles.button, isActive ? styles.buttonActive : {}]}
        onPress={() => {
          this.navigateTo(route);
        }}>
        <Image
          source={image}
          style={{
            tintColor: isActive ? ThemeStyle.mainColor : ThemeStyle.disabled,
            width: Dimensions.r20,
            height: Dimensions.r20,
            marginRight: Dimensions.marginSmall,
          }}
          resizeMode="contain"
        />
        {isActive && (
          <Text
            style={[
              TextStyles.ContentTextBold,
              {
                color: ThemeStyle.mainColor,
              },
            ]}>
            {route}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <React.Fragment>
        <View
          style={[
            {
              backgroundColor: 'white',
              borderRadius: Dimensions.r32,
              paddingVertical: Dimensions.marginRegular,
              paddingHorizontal: Dimensions.marginRegular,
              marginHorizontal: Dimensions.marginLarge,
            },
            ThemeStyle.shadow({shadowOffset: {height: -12}}),
          ]}>
          <View style={styles.footer}>
            {this.renderItem(
              require('../../assets/images/messages-tab-icon.png'),
              tabRoutes.Messages.name,
            )}
            {this.renderItem(
              require('../../assets/images/Todos-tab-icon.png'),
              tabRoutes.Events.name,
            )}
            {this.renderItem(
              require('../../assets/images/dashboard-tab-icon.png'),
              tabRoutes.Dashboard.name,
            )}
            {this.renderItem(
              require('../../assets/images/coaches-tab-icon.png'),
              tabRoutes.Coaches.name,
            )}
            {this.renderItem(
              require('../../assets/images/profile-tab-icon.png'),
              tabRoutes.Profile.name,
            )}
          </View>
        </View>
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    padding: Dimensions.r12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    flexDirection: 'row',
  },
  buttonActive: {
    backgroundColor: ThemeStyle.mainColorLight,
    borderRadius: Dimensions.r24,
  },
});
