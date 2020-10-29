import React from 'react';
import {View} from 'react-native';
import FooterComponent from './FooterComponent';
import tabRoutes from './routes';
import Dashboard from '../dashboard/Dashboard';
import CoachesScreen from '../coaches/CoachesScreen';
import EventsScreen from '../events/EventsScreen';
import ProfileScreen from '../profile/ProfileScreen';
import MessagesScreen from '../messages/MessagesScreen';
import chatHelper from '../../services/twiio';

let tabbar;

export const getTabBar = () => {
  return tabbar;
};

const setTabBar = ref => {
  tabbar = ref;
};

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: tabRoutes.Dashboard.name,
      tabBarVisible: true,
    };
    setTabBar(this);
  }

  componentDidMount() {
    chatHelper.login();
  }

  componentWillUnmount() {}

  onChangeSelectedTab = activeTab => {
    this.overrideActiveTab = null;
    this.setState({
      activeTab,
    });
  };

  toggleTabBar = tabBarVisible => {
    this.setState({
      tabBarVisible,
    });
  };

  render() {
    const {activeTab} = this.state;
    const {navigation} = this.props;
    if (navigation.state.params) {
      this.overrideActiveTab = navigation.state.params.activeTab;
      navigation.state.params.activeTab = null;
    }
    console.log('PARaMS', activeTab, this.overrideActiveTab);
    const currentTab = this.overrideActiveTab || activeTab;
    return (
      <View style={{flex: 1}}>
        {currentTab === tabRoutes.Dashboard.name && (
          <Dashboard
            navigation={navigation}
            onChangeSelectedTab={this.onChangeSelectedTab}
          />
        )}
        {currentTab === tabRoutes.Coaches.name && (
          <CoachesScreen
            navigation={navigation}
            toggleTabBar={this.toggleTabBar}
          />
        )}
        {currentTab === tabRoutes.Events.name && (
          <EventsScreen navigation={navigation} />
        )}
        {currentTab === tabRoutes.Profile.name && (
          <ProfileScreen
            navigation={navigation}
            toggleTabBar={this.toggleTabBar}
            onChangeSelectedTab={this.onChangeSelectedTab}
          />
        )}
        {currentTab === tabRoutes.Messages.name && (
          <MessagesScreen navigation={navigation} />
        )}
        <View
          style={{
            display: this.state.tabBarVisible ? 'flex' : 'none',
            position: 'absolute',
            bottom: 24,
            left: 0,
            right: 0,
          }}>
          <FooterComponent
            navigation={navigation}
            onChangeSelectedTab={this.onChangeSelectedTab}
          />
        </View>
      </View>
    );
  }
}
