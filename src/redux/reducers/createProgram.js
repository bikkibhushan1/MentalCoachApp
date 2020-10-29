import {ACTIONS} from '../actions/CreateProgramActions';

const initialState = {
  program: {},
};

export default function createProgram(state = initialState, action) {
  switch (action.type) {
    case ACTIONS.SET_PROGRAM:
      return Object.assign({}, state, {
        program: action.payload,
      });
    case ACTIONS.UPDATE_PROGRAM:
      return Object.assign({}, state, {
        program: {
          ...state.program,
          ...action.payload,
        },
      });
    default:
      return state;
  }
}
