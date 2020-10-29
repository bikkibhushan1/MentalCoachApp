import {ACTIONS} from '../actions/UserActions';

const initialState = {
  attributes: null,
  profileImageUri: null,
  isCoach: false,
};

export default function user(state = initialState, action) {
  switch (action.type) {
    case ACTIONS.SET_USER:
      return Object.assign({}, state, {
        ...action.payload,
      });
    case ACTIONS.UPDATE_USER:
      return Object.assign({}, state, {
        ...state,
        ...action.payload,
      });
    case ACTIONS.SET_USER_IMAGE:
      return Object.assign({}, state, {
        profileImageUri: action.payload,
      });
    case ACTIONS.CLEAR_USER_STATE:
      return {
        attributes: null,
        profileImageUri: null,
        isCoach: false,
      };
    default:
      return state;
  }
}
