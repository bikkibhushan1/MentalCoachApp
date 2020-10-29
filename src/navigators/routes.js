import {createDrawerNavigator} from 'react-navigation-drawer';
import SplashScreen from '../screens/splash/SplashScreen';

import HomeScreen from '../screens/home/HomeScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import MyPracticeScreen from '../screens/practice/MyPracticeScreen';
import MyProgramsScreen from '../screens/programs/MyProgramsScreen';
import CreateProgramScreen from '../screens/programs/CreateProgramScreen';
import ProgramOverviewScreen from '../screens/programs/ProgramOverviewScreen';
import LoginScreen from '../screens/login/LoginScreen';
import ForgotPasswordScreen from '../screens/login/ForgotPassword';
import SignUpScreen from '../screens/login/SignUpScreen';
import BecomeCoachScreen from '../screens/profile/BecomeCoachScreen';
import UploadDocumentsScreen from '../screens/library/UploadDocumentScreen';
import MyLibraryScreen from '../screens/library/MyLibraryScreen';
import ImageViewer from '../screens/library/ViewImage';
import PaymentScreen from '../screens/programs/PaymentScreen';
import ProgramDetailsScreen from '../screens/programs/ProgramDetailsScreen';
import NewSessionsScreen from '../screens/sessions/NewSessionsScreen';
import ModuleDetailsScreen from '../screens/programs/ModuleDetailsScreen';
import SessionDetailsScreen from '../screens/sessions/SessionDetailsScreen';
import InviteUserScreen from '../screens/programs/InviteUserScreen';
import AppContentScreen from '../screens/sessions/AppContentScreen';
import CoachDetailsScreen from '../screens/coaches/CoachDetailsScreen';
import ConnectStripeScreen from '../screens/payment/ConnectStripeScreen';
import ChatScreen from '../screens/messages/ChatScreen';
import VideoChatScreen from '../screens/messages/VideoChatScreen';
import JoinedProgramsScreen from '../screens/programs/JoinedProgramsScreen';
import EditProgramScreen from '../screens/programs/EditProgramScreen';
import CohortDetailsScreen from '../screens/cohorts/CohortDetailsScreen';
import FeaturedProgramsScreen from '../screens/programs/FeaturedProgramsScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import SelectCoachScreen from '../screens/coaches/SelectCoachScreen';
import NotificationScreen from '../screens/notification/NotificationScreen';
import EventsScreen from '../screens/events/EventsScreen';

// const DrawerRoutes = createDrawerNavigator(
//   {},
//   {
//     drawerWidth: 250,
//     drawerPosition: 'left',
//     drawerType: 'slide',
//     // contentComponent: Drawermenu,
//     initialRouteName: 'TabNav',
//     overlayColor: '#0000',
//     unmountInactiveRoutes: true,
//   },
// );

const Routes = {
  Splash: {
    screen: SplashScreen,
  },
  EventsScreen: {
    screen: EventsScreen,
  },

  OnboardingScreen: {
    screen: OnboardingScreen,
  },

  NotificationScreen: {
    screen: NotificationScreen,
  },

  SignUp: {
    screen: SignUpScreen,
  },
  Login: {
    screen: LoginScreen,
  },
  ForgotPassword: {
    screen: ForgotPasswordScreen,
  },
  Home: {
    screen: HomeScreen,
  },
  EditProfile: {
    screen: EditProfileScreen,
  },
  BecomeCoach: {
    screen: BecomeCoachScreen,
  },
  MyPractice: {
    screen: MyPracticeScreen,
  },
  MyPrograms: {
    screen: MyProgramsScreen,
  },
  JoinedPrograms: {
    screen: JoinedProgramsScreen,
  },
  MyLibrary: {
    screen: MyLibraryScreen,
  },
  UploadDocument: {
    screen: UploadDocumentsScreen,
  },
  ViewImage: {
    screen: ImageViewer,
  },
  CreateProgram: {
    screen: CreateProgramScreen,
  },
  ProgramOverview: {
    screen: ProgramOverviewScreen,
  },
  ProgramPayment: {
    screen: PaymentScreen,
  },
  InviteUser: {
    screen: InviteUserScreen,
  },
  ProgramDetails: {
    screen: ProgramDetailsScreen,
  },
  EditProgram: {
    screen: EditProgramScreen,
  },
  CohortDetails: {
    screen: CohortDetailsScreen,
  },
  ModuleDetails: {
    screen: ModuleDetailsScreen,
  },
  NewSession: {
    screen: NewSessionsScreen,
  },
  SessionDetails: {
    screen: SessionDetailsScreen,
  },
  AppContent: {
    screen: AppContentScreen,
  },
  CoachDetails: {
    screen: CoachDetailsScreen,
  },
  SelectCoaches: {
    screen: SelectCoachScreen,
  },
  ConnectStripe: {
    screen: ConnectStripeScreen,
  },
  Chat: {
    screen: ChatScreen,
  },
  VideoChat: {
    screen: VideoChatScreen,
  },
  FeaturedProgramsScreen: {
    screen: FeaturedProgramsScreen,
  },
};

export default Routes;
