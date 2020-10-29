import NetInfo from '@react-native-community/netinfo';
import {showMessage} from 'react-native-flash-message';
import {errorMessage} from '.';
import {getOfflineModal} from '../modals/OfflineModal';

let isUserOnline = false;
let unsubscribeNetworkListener = null;

export function setOnline(status) {
  isUserOnline = status;
}

export function isOnline() {
  return isUserOnline;
}

function onNetworkStatusChange(info) {
  console.log('NETWORK STATE CHANGED', info);
  setOnline(info.isInternetReachable);
}

export function addNetworkChangeListener() {
  unsubscribeNetworkListener = NetInfo.addEventListener(onNetworkStatusChange);
}

export function removeNetworkChangeListener() {
  unsubscribeNetworkListener();
}

export function showOfflineMessage(msg, showToast) {
  if (!isOnline()) {
    if (showToast) {
      showMessage(
        errorMessage(msg || 'Please connect to the internet and try again.'),
      );
    } else {
      getOfflineModal() &&
        getOfflineModal().show({
          message: msg,
        });
    }
  }
}

export function performNetworkTask(action, errorMessage, showToast) {
  if (isOnline()) {
    action && action();
  } else {
    showOfflineMessage(errorMessage, showToast);
  }
}
