import {APP_ACTIONS} from '../actions/AppActions';

const initialState = {
  isLoading: false,
};

export default function auth(state = initialState, action) {
  switch (action.type) {
    case APP_ACTIONS.SET_LOADING:
      return Object.assign({}, state, {
        isLoading: action.payload,
      });
    default:
      return state;
  }
}
