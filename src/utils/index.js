import {Linking, Platform} from 'react-native';
import {v4 as uuid} from 'uuid';
import {isOnline, showOfflineMessage} from './NetworkUtils';
import {showMessage} from 'react-native-flash-message';
import URL from 'url-parse';
import {
  programTypes,
  programDurationPeriods,
  sessionTypes,
  uploadTypes,
} from '../constants';
import moment, {duration} from 'moment';
import validator from 'validator';

export function omitDeep(obj, key) {
  if (Array.isArray(obj)) {
    return omitDeepArrayWalk(obj, key);
  }
  const keys = Object.keys(obj);
  const newObj = {};
  keys.forEach(i => {
    if (i !== key) {
      const val = obj[i];
      if (Array.isArray(val)) {
        newObj[i] = omitDeepArrayWalk(val, key);
      } else if (typeof val === 'object' && val !== null) {
        newObj[i] = omitDeep(val, key);
      } else {
        newObj[i] = val;
      }
    }
  });
  return newObj;
}

function omitDeepArrayWalk(arr, key) {
  return arr.map(val => {
    if (Array.isArray(val)) {
      return omitDeepArrayWalk(val, key);
    } else if (typeof val === 'object') {
      return omitDeep(val, key);
    }
    return val;
  });
}

export const errorMessage = message => ({
  message: message ? message : 'Something went wrong',
  type: 'danger',
});

export const showApiError = (showToast, message) => {
  if (isOnline()) {
    showMessage(errorMessage(message));
  } else {
    showOfflineMessage(message, showToast);
  }
};

export const groupByModules = (data = []) => {
  let modules = {};
  data.map(item => {
    if (modules.hasOwnProperty(item.module)) {
      modules[item.module].push(item);
    } else {
      modules[item.module] = [item];
    }
  });
  return modules;
};

export const call = ({number, prompt = true}) => {
  const url = `${
    Platform.OS === 'ios' && prompt ? 'telprompt:' : 'tel:'
  }${number}`;
  Linking.openURL(url).catch(err => console.log('Call Error: ', err));
};

export function pluralString(quantity, string, pluralString) {
  if (quantity > 1) {
    return ' ' + (pluralString ? pluralString : string + 's');
  } else {
    return ' ' + string;
  }
}

export function hashCode(s) {
  var h = 0,
    l = s.length,
    i = 0;
  if (l > 0) {
    while (i < l) {
      h = ((h << 5) - h + s.charCodeAt(i++)) | 0;
    }
  }
  return h;
}

export function stringToColour(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = '#';
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xff;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
}

export function mapUserIdToNickname(group) {
  const map = {};
  if (group && group.participants) {
    group.participants.forEach(item => {
      map[item.userId] = item.nickname;
    });
  }
  return map;
}

export function generateRandomID() {
  return uuid();
}

export function compareVersions(v1, v2, options) {
  let lexicographical = options && options.lexicographical,
    zeroExtend = options && options.zeroExtend,
    v1parts = v1.split(`.`),
    v2parts = v2.split(`.`);

  function isValidPart(x) {
    return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
  }

  if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
    return NaN;
  }

  if (zeroExtend) {
    while (v1parts.length < v2parts.length) {
      v1parts.push(`0`);
    }
    while (v2parts.length < v1parts.length) {
      v2parts.push(`0`);
    }
  }

  if (!lexicographical) {
    v1parts = v1parts.map(Number);
    v2parts = v2parts.map(Number);
  }

  for (let i = 0; i < v1parts.length; ++i) {
    if (v2parts.length == i) {
      return 1;
    }

    if (v1parts[i] == v2parts[i]) {
      continue;
    } else if (v1parts[i] > v2parts[i]) {
      return 1;
    } else {
      return -1;
    }
  }

  if (v1parts.length != v2parts.length) {
    return -1;
  }

  return 0;
}

export const isNullOrEmpty = string => {
  return !string || string === '';
};

export const generateFilePath = (user, type) => {
  return `${user.username}/${type}`;
};

export const getFileDetailsFromUrl = url => {
  try {
    // console.log('GETTING URL DETAILS', url);
    // const urlDetails = new URL(url);
    // const filePath = urlDetails.pathname;
    if (validator.isURL(url, {protocols: ['http', 'https']})) {
      return {
        fileName: url,
        type: uploadTypes.LINK,
      };
    }
    const fileName = url.split('/')[url.split('/').length - 1];
    // console.log('FILE PATH', filePath, fileName);
    return {
      filePath: url,
      fileName,
    };
  } catch (err) {
    console.log(err);
    return {filePath: url};
  }
};

export const getLibraryItemsPath = libraryItems => {
  const libraryItemPaths = {links: libraryItems.links, pdfs: [], images: []};
  libraryItems.pdfs.forEach(pdf => {
    libraryItemPaths.pdfs.push(getFileDetailsFromUrl(pdf).filePath);
  });
  libraryItems.images.forEach(image => {
    libraryItemPaths.images.push(getFileDetailsFromUrl(image).filePath);
  });
  return libraryItemPaths;
};

export const getDisplayPrice = price => {
  try {
    if (isNaN(price) || !price || price == 0) {
      return `FREE`;
    } else {
      return `$${price / 100}`;
    }
  } catch (err) {
    console.warn(err);
    return `FREE`;
  }
};

export const getProgramDisplayType = type => {
  if (type === programTypes.GROUP) {
    return `Group`;
  } else {
    return `Individual`;
  }
};

export const getProgramDisplayDuration = duration => {
  let period = 'Week';
  if (!duration) {
    return null;
  }
  switch (duration.period) {
    case programDurationPeriods.DAYS:
      period = 'Day';
      break;
    case programDurationPeriods.WEEK:
      period = 'Week';
      break;
    case programDurationPeriods.MONTH:
      period = 'Month';
      break;
  }
  if (duration.interval > 1) {
    period += `s`;
  }
  return `${duration.interval} ${period}`;
};

export const groupSessionsByModule = sessions => {
  if (!sessions || !sessions.length) {
    return null;
  }
  const modules = {};
  sessions.forEach(session => {
    let module = modules[session.module];
    if (!module) {
      module = {
        name: session.module,
        payment: session.payment,
        isFree: session.isFree,
        coachId: session.coachId,
        programId: session.programId,
        sessions: [],
      };
    }
    module.sessions.push(session);
    modules[session.module] = module;
  });
  Object.values(modules).forEach(module => {
    module.sessions.sort((a, b) => {
      const date1 = moment(a.startDate);
      const date2 = moment(b.startDate);
      return date1.isBefore(date2) ? -1 : 1;
    });
    module.startDate = module.sessions[0].startDate;
    module.endDate = module.sessions[module.sessions.length - 1].startDate;
    module.isJoined = module.sessions[0].canViewDetails;
    module.id = module.sessions[0].moduleId;
  });
  return modules;
};

export const getProgramContent = (sessions, isCohort) => {
  if (!sessions || !sessions.length) {
    return {modules: [], tasks: []};
  }
  const tasks = [];
  const modules = {};
  sessions.forEach(session => {
    if (!session.module) {
      tasks.push(session);
    } else {
      let module = modules[session.module];
      if (!module) {
        module = {
          name: session.module,
          payment: session.payment,
          isFree: session.isFree,
          coachId: session.coachId,
          image: session.image,
          sessions: [],
        };
        if (isCohort) {
          module.cohortId = session.cohortId;
        } else {
          module.programId = session.programId;
        }
      }
      module.sessions.push(session);
      modules[session.module] = module;
    }
  });
  const comparator = (a, b) => {
    if (isCohort) {
      const date1 = moment(a.startDate);
      const date2 = moment(b.startDate);
      return date1.isBefore(date2) ? -1 : 1;
    } else {
      return a.relativeDays - b.relativeDays;
    }
  };
  Object.values(modules).forEach(module => {
    module.sessions.sort(comparator);
    module.startDate = module.sessions[0].startDate;
    module.endDate = module.sessions[module.sessions.length - 1].startDate;
    module.id = module.sessions[0].moduleId;
  });
  tasks.sort(comparator);
  return {modules: Object.values(modules), tasks};
};

export const groupSessionsByDate = (sessions, isCohort) => {
  if (!sessions || !sessions.length) {
    return null;
  }
  const sessionsGroups = [];
  sessions.forEach(session => {
    let sessionDateKey;
    let sessionDateValue;
    if (isCohort) {
      sessionDateKey = moment(session.startDate).format('DD-MM-YYYY');
      sessionDateValue = session.startDate;
    } else {
      sessionDateKey = session.relativeDays;
      sessionDateValue = session.relativeDays;
    }
    let dateGroup = sessionsGroups.find(
      group => group.dateKey === sessionDateKey,
    );
    if (dateGroup) {
      dateGroup.sessions.push(session);
    } else {
      dateGroup = {
        dateKey: sessionDateKey,
        dateValue: sessionDateValue,
        sessions: [session],
      };
      sessionsGroups.push(dateGroup);
    }
  });
  return sessionsGroups;
};

export const getSessionTypeDetails = sessionType => {
  const type = {};
  switch (sessionType) {
    case sessionTypes.TASK:
      type.name = 'Task';
      type.image = require('../assets/images/Life-Coach-redsign-Assets/Duration-icon.png');
      type.tintColor = '#39F';
      break;
    case sessionTypes.PHYSICAL_MEETING:
      type.name = 'In-Office Session';
      type.image = require('../assets/images/Life-Coach-redsign-Assets/observe-icon.png');
      type.tintColor = '#39F';
      break;
    case sessionTypes.VIDEO:
      type.name = 'Video';
      type.image = require('../assets/images/Life-Coach-redsign-Assets/wise-mind-icon.png');
      type.tintColor = '#39F';
      break;
  }
  return type;
};

export const getProgramInputFromDetails = program => {
  const {
    id,
    coachId,
    cohorts,
    invites,
    status,
    sessions,
    coCoach,
    ...details
  } = program;
  return omitDeep(details, '__typename');
};

export const getCohortInputFromDetails = cohort => {
  const {
    id,
    programId,
    coachId,
    channelId,
    joinedMembers,
    canViewDetails,
    invites,
    sessions,
    startDate,
    createdAt,
    coCoach,
    ...details
  } = cohort;
  return omitDeep(details, '__typename');
};

export const getCohortDates = cohort => {
  if (!cohort) {
    return null;
  }
  return `${moment(cohort.startDate).format('MMM DD, YYYY')} - ${moment(
    cohort.endDate,
  ).format('MMM DD, YYYY')}`;
};
