//import liraries
import React, {Component, useState} from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ThemeStyle from '../../styles/ThemeStyle';
import Dimensions, {windowDimensions} from '../../styles/Dimensions';
import Header from '../../components/Header';
import TextStyles, {fontFamily} from '../../styles/TextStyles';
import moment from 'moment';
import Button from '../../components/Button';

import {FlatList, ScrollView} from 'react-native-gesture-handler';
import BaseComponent from '../../components/BaseComponent';
import CustomButton from '../../components/Button';
import {appsyncClient} from '../../../App';
import {getNotifications} from '../../queries/notification';
import NotificationView from './NotificationView';

class NotificationScreen extends BaseComponent {
  constructor(props) {
    super(props);
    this.state.topSafeArea = ThemeStyle.divider;
    this.state.isTodayNotification = true;
  }
  renderSeparator = () => {
    return <View style={styles.divider} />;
  };
  componentWillUnmount() {
    if (this.notificationsQuery) {
      this.notificationsQuery.unsubscribe();
    }
  }
  componentDidMount() {
    this.fetchNotifications();
  }
  fetchNotifications = () => {
    this.notificationsQuery = appsyncClient
      .watchQuery({
        query: getNotifications,

        fetchPolicy: 'cache-and-network',
      })
      .subscribe({
        next: data => {
          console.log('NOTIFICATIONS', data);
          if (data.loading && !data.data) {
            return;
          }
          if (data.data.getNotifications) {
            this.setState({
              notifications: data.data.getNotifications,
            });
          }
        },
        error: error => {
          console.log('ERROR FETCHING JOINED PROGRAMS', error);
        },
      });
  };
  render() {
    const {navigation} = this.props;
    const {notifications, isTodayNotification} = this.state;

    return this.renderWithSafeArea(
      <LinearGradient
        style={ThemeStyle.pageContainer}
        colors={[ThemeStyle.divider, ThemeStyle.divider]}
        start={{x: 1, y: 0.1}}>
        <View
          style={{
            marginTop: Dimensions.marginLarge,
            justifyContent: 'center',
          }}>
          <Header
            title="Notifications"
            isLightContent={false}
            navBarStyle={{backgroundColor: 'transparent'}}
            goBack={() => {
              navigation.pop();
            }}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text
            style={{
              ...TextStyles.HeaderBold,
              marginTop: Dimensions.r30,
              marginStart: Dimensions.screenMarginRegular,
              color: ThemeStyle.textRegular,
            }}>
            Today
          </Text>

          <View
            style={{
              paddingHorizontal: Dimensions.screenMarginRegular,
              marginTop: Dimensions.marginExtraSmall,
            }}>
            <FlatList
              // ItemSeparatorComponent={this.renderSeparator}
              contentContainerStyle={styles.flatListContainer}
              data={notifications}
              renderItem={({item, index}) => {
                if (
                  parseInt(moment().diff(moment(item.createdAt), 'hours'), 10) <
                  23
                ) {
                  // this.state.isTodayNotification = true;
                  return <NotificationView value={item} />;
                }
                // else return {noView};
              }}
            />
          </View>

          {/* Earlier */}

          <Text
            style={{
              ...TextStyles.HeaderBold,

              marginTop: Dimensions.marginLarge,

              marginStart: Dimensions.screenMarginRegular,
              color: ThemeStyle.textRegular,
            }}>
            Earlier
          </Text>

          <View
            style={{
              paddingHorizontal: Dimensions.screenMarginRegular,
              marginTop: Dimensions.marginExtraSmall,
            }}>
            <FlatList
              // ItemSeparatorComponent={this.renderSeparator}
              contentContainerStyle={styles.flatListContainer}
              data={notifications}
              renderItem={({item, index}) => {
                if (
                  parseInt(
                    moment().diff(moment(item.createdAt), 'hours'),
                    10,
                  ) >= 24
                ) {
                  // this.state.isEarlierNotification = true;
                  return (
                    <NotificationView
                      value={item}
                      index={index}
                      // size={Object.keys(notifications).length}
                    />
                  );
                }
              }}
            />
          </View>
        </ScrollView>
        <CustomButton
          name={`Clear all invitations`}
          noGradient
          // onPress={this.onLogout}
          style={{
            borderWidth: Dimensions.r2,
            borderColor: ThemeStyle.mainColor,
            marginStart: Dimensions.screenMarginRegular,
            marginEnd: Dimensions.screenMarginRegular,
            marginTop: Dimensions.marginRegular,
            marginBottom: Dimensions.marginRegular,
          }}
          textStyle={{...TextStyles.Header2, color: ThemeStyle.mainColor}}
        />
      </LinearGradient>,
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  flatListContainer: {
    paddingHorizontal: Dimensions.marginSmall,
    borderTopLeftRadius: Dimensions.r20,
    borderTopRightRadius: Dimensions.r20,
    borderBottomLeftRadius: Dimensions.r20,
    borderBottomRightRadius: Dimensions.r20,
    backgroundColor: ThemeStyle.white,
    shadowOffset: {height: Dimensions.r2},
    shadowOpacity: 0.35,
    shadowRadius: Dimensions.r10,
    elevation: Dimensions.r4,
    borderWidth: Dimensions.r2,
    borderColor: 'transparent',
  },
  divider: {
    height: Dimensions.r1,
    width: '100%',
    backgroundColor: ThemeStyle.disabledLight,
    marginStart: Dimensions.marginLarge,
  },
});

export default NotificationScreen;

const dummy_data = [{}, {}, {}];
