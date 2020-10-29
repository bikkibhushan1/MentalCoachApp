import Dashboard from '../dashboard/Dashboard';
import CoachesScreen from '../coaches/CoachesScreen';
import ProfileScreen from '../profile/ProfileScreen';
import EventsScreen from '../events/EventsScreen';
import MessagesScreen from '../messages/MessagesScreen';

export default {
  Dashboard: {
    name: 'Dashboard',
    screen: Dashboard,
  },

  Coaches: {
    name: 'Coaches',
    screen: CoachesScreen,
  },

  Profile: {
    name: 'Profile',
    screen: ProfileScreen,
  },

  Events: {
    name: 'Events',
    screen: EventsScreen,
  },

  Messages: {
    name: 'Messages',
    screen: MessagesScreen,
  },
};
