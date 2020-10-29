export const MEDITATION_ENDPOINT =
  'https://svsca4lrog.execute-api.us-east-1.amazonaws.com/prod/api/meditation/';
export const API_HOST = 'svsca4lrog.execute-api.us-east-1.amazonaws.com';
export const CONTENT_PATH = 'https://d2ot3z5xcrn0h2.cloudfront.net/';
export const CONTENT_PATH_HTTP = 'http://d2ot3z5xcrn0h2.cloudfront.net/';
import AwsConfigDev from '../../aws-export-dev';
import AwsConfigProd from '../../aws-export';
import {Auth} from 'aws-amplify';
import moment from 'moment';
import AppConfigs from './AppConfigs';
import ThemeStyle from '../styles/ThemeStyle';

export const getHeaders = token => {
  let auth_date = new Date();
  let headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'x-access-token': token,
    'X-Amz-Date': auth_date.toISOString(),
    host: API_HOST,
    Authorization: token,
  };
  return headers;
};

export const APP = AppConfigs.COACHING_APP;

const ENV = {
  dev: {
    APP_SYNC_URL: APP.graphql.dev,
    SWASTH_COMMONS_ENDPOINT_URL:
      'https://ybudbtbn75hgje3ael2kau7zk4.appsync-api.us-east-1.amazonaws.com/graphql',
    ES_ENDPOINT: 
      'https://search-peer-to-peer-support-group-waru576b6oz4afvmtus5lnhcte.us-east-1.es.amazonaws.com/',
    awsConfig: AwsConfigDev,
    validateReceiptIos: true,
    appId: APP.id,
    Region: 'us-east-1',
    AuthMode: 'AMAZON_COGNITO_USER_POOLS',
    stripeClientID: APP.stripe.client_id.dev,
    stripeKey: APP.stripe.publishable_key.dev,
    pinpointAppId: APP.pinpoint.dev,
  },
  prod: {
    APP_SYNC_URL: APP.graphql.prod,
    SWASTH_COMMONS_ENDPOINT_URL:
      'https://haf7cr5vtvg7xk2ebhd3hfi2iq.appsync-api.us-east-1.amazonaws.com/graphql',
    ES_ENDPOINT: 
      'https://search-peer-to-peer-support-group-waru576b6oz4afvmtus5lnhcte.us-east-1.es.amazonaws.com/',
    awsConfig: AwsConfigProd,
    validateReceiptIos: true,
    appId: APP.id,
    Region: 'us-east-1',
    AuthMode: 'AMAZON_COGNITO_USER_POOLS',
    stripeClientID: APP.stripe.client_id.prod,
    stripeKey: APP.stripe.publishable_key.prod,
    pinpointAppId: APP.pinpoint.prod,
  },
};

export const isPremiumApp = () => {
  // Set to true if you want to override subscription status
  return true;
  //return true;
};

export const getEnvVars = (env = '') => {
  if (env === null || env === undefined || env === '') {
    return ENV.dev;
  }
  if (env.indexOf('dev') !== -1) {
    return ENV.dev;
  }
  if (env.indexOf('staging') !== -1) {
    return ENV.staging;
  }
  if (env.indexOf('prod') !== -1) {
    return ENV.prod;
  }
};

export const getAmplifyConfig = endpoint => ({
  aws_appsync_graphqlEndpoint: endpoint,
  aws_appsync_region: 'us-east-1',
  apiKey: null,
  aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
  API: {
    graphql_endpoint: endpoint,
    graphql_headers: async () => {
      let token = await Auth.currentSession();
      token = token.idToken.jwtToken;
      // console.log(token);
      return {
        Authorization: token,
      };
    },
  },
});

export const AppSyncConfig = {
  //   "graphqlEndpoint": getEnvVars(Constants.manifest.releaseChannel),
  region: 'us-east-1',
  authenticationType: 'AMAZON_COGNITO_USER_POOLS',
  apiKey: null,
};

export const moodColors = {
  1: '#78c446',
  2: '#c5de44',
  3: '#face4a',
  4: '#f4a040',
  5: '#eb3944',
};

export const moodImages = {
  1: require('../assets/images/great-mood.png'),
  2: require('../assets/images/good-mood.png'),
  3: require('../assets/images/Okay-mood.png'),
  4: require('../assets/images/bad-mood.png'),
  5: require('../assets/images/awful-mood.png'),
};

export const Moods = [
  {
    id: 1,
    src: require('../assets/images/great-mood.png'),
    name: 'Great',
    color: moodColors[1],
    value: 5,
  },
  {
    id: 2,
    src: require('../assets/images/good-mood.png'),
    name: 'Good',
    color: moodColors[2],
    value: 4,
  },
  {
    id: 3,
    src: require('../assets/images/Okay-mood.png'),
    name: 'Okay',
    color: moodColors[3],
    value: 3,
  },
  {
    id: 4,
    src: require('../assets/images/bad-mood.png'),
    name: 'Bad',
    color: moodColors[4],
    value: 2,
  },
  {
    id: 5,
    src: require('../assets/images/awful-mood.png'),
    name: 'Awful',
    color: moodColors[5],
    value: 1,
  },
];

export const moduleColors = {
  Values: '#800080',
  'Committed Action (Do What it Takes)': '#228B22',
  'Self-as-Context (Awareness)': '#FF6347',
  'Acceptance (Expansion)': '#005B96',
  'Contacting the Present Moment': '#008A85',
  'Defusion (Watch your thinking)': '#F41B46',
};

export const flowConstants = {
  HOMEWORK: 0,
  ENTRY_FLOW: 1,
  EXERCISE: 2,
  ACT_MEASURE: 3,
};

export const actMeasureTypes = {
  WEEKLY: 'Weekly',
  DAILY: 'Daily',
};

export const timeLineItemTypes = {
  DATE_GROUP: 'DateGroup',
  ENTRY: 'Entry',
  EXERCISE: 'Exercise',
  MEDITATION: 'Meditations',
  PRACTICE_IDEAS: 'Practice Ideas',
};

export const preferenceTypes = {
  TYPE_ENTRY: 'entry',
  TYPE_ENTRY_FLOW: 'entry_flow',
};

export const favouriteTypes = {
  EXERCISE: 'Exercise',
  LESSON: 'Lesson',
  MEDITATION: 'Meditation',
  PRACTICE_IDEA: 'PracticeIdea',
};

export const communityTypes = {
  DISCUSSIONS: 'discussions',
  PEER_GROUPS: 'peerGroups',
};

export const programDurationPeriods = {
  DAYS: 'DAYS',
  WEEK: 'WEEKS',
  MONTH: 'MONTHS',
};

export const programTypes = {
  GROUP: 'GROUP',
  INDIVIDUAL: 'INDIVIDUAL',
};

export const uploadTypes = {
  LINK: 'links',
  PDF: 'pdfs',
  IMAGE: 'images',
};

export const sessionTypes = {
  TASK: 'TASK',
  VIDEO: 'VIDEO',
  PHYSICAL_MEETING: 'PHYSICALMEETING',
};

export const sessionRepeatTypes = {
  NONE: 'NONE',
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
};

export const appTypes = {
  DBT: {
    name: 'DBT Coach',
    icon: require('../assets/images/DBT-coach-logo.png'),
    key: 'DC',
  },
  ACT: {
    name: 'ACT',
    icon: require('../assets/images/ACT-coach-logo.png'),
    key: 'AC',
  },
  CBT: {
    name: 'CBT Companion',
    icon: require('../assets/images/CBT-companion-logo.png'),
    key: 'CC',
  },
};

export const appContentTypes = {
  LESSON: 'lessons',
  EXERCISE: 'exercises',
  PRACTICE_IDEA: 'practiceIdeas',
  MEDITATION: 'meditations',
};

export const s3ProtectionLevel = {
  PROTECTED: 'protected',
  PRIVATE: 'private',
  PUBLIC: 'public',
};

export const chatTypes = {
  DIRECT: 'DIRECT',
  PROGRAM: 'PROGRAM',
};

export const inviteStatus = {
  ACCEPTED: 'ACCEPTED',
  PENDING: 'PENDING',
};

export const programStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
};

export const programGradients = {
  venice_blue: ['#085078', '#85D8CE'],
  kashmir: ['#614385', '#516395'],
};

export const asyncStorageConstants = {
  weeklyMeasures: function(currentDate = moment()) {
    return `@act${currentDate.format('ww YYYY')}`;
  },
  dailyMeasures: function(currentDate = moment()) {
    return `@act${currentDate.format('DD MMM YYYY')}`;
  },
  premiumStatus: 'PREMIUM_STATUS',
  hasPremium: 'HAS_PREMIUM',
  userInfo: 'USER_INFO',
  clearLocalStorage: 'CLEAR_LOCAL_STORAGE_1',
};

export const getMeditationAudioPath = filename => {
  return `${CONTENT_PATH}meditations/audio_files/${filename}.mp3`;
};

export const exerciseTypes = {
  MULTI_SELECT_WITH_RATING: 'multiSelectWithRating',
  MULTI_SELECT_WITH_OPTIONS: 'multiSelectWithOptions',
  RATING: 'Rating',
  TEXT: 'text',
  MULTI_SELECT: 'multiSelect',
  RATING_DISCRETE: 'RatingDiscrete',
  SINGLE_SELECT: 'singleSelect',
  DISPLAY: 'display',
  GROUP: 'group',
  SINGLE_SELECT_WITH_FLOW: 'singleSelectWithFlow',
  SINGLE_SELECT_WITH_RATING: 'singleSelectWithRating',
  TEXT_VIEW: 'textView',
  CHALLENGE: 'challenge',
  CHECKLIST: 'checklist',
  PRIORITY_RATING: 'priorityRating',
  GROUPED_ITEMS: 'groupedItems',
  AUDIO: 'audio',
};
