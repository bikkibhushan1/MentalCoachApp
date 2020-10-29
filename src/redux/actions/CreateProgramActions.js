import {appsyncClient} from '../../../App';
import {
  addProgramMutation,
  getProgramWithSchedules,
} from '../../queries/program';
import {showMessage} from 'react-native-flash-message';
import {errorMessage} from '../../utils';

export const ACTIONS = {
  SET_PROGRAM: 'SET_PROGRAM',
  UPDATE_PROGRAM: 'UPDATE_PROGRAM',
};

export const updateProgramDetails = program => ({
  type: ACTIONS.UPDATE_PROGRAM,
  payload: program,
});

export const createProgram = (program, onSuccess, onFail = () => {}) => {
  console.log('creating program', program);
  return dispatch => {
    return appsyncClient
      .mutate({
        mutation: addProgramMutation,
        variables: {
          program,
        },
      })
      .then(data => {
        console.log('CREATED PROGRAM', data);
        if (data.data && data.data.addProgram) {
          return onSuccess(data.data.addProgram);
        }
        onFail();
      })
      .catch(err => {
        console.log('ERROR CREATING PROGRAM', err);
        showMessage(
          errorMessage('Failed to create program. Please try again.'),
        );
        onFail();
      });
  };
};

export const fetchFullProgram = (programId, onProgramFetched) => {
  const fullProgramQuery = appsyncClient
    .watchQuery({
      query: getProgramWithSchedules,
      fetchPolicy: 'cache-and-network',
      variables: {
        programId: programId,
      },
    })
    .subscribe({
      next: data => {
        console.log('PROGRAM DETAILS', data);
        if (data.loading && !data.data) {
          return;
        }
        if (data.data.getProgramWithSchedules) {
          fullProgramQuery.unsubscribe();
          onProgramFetched(data.data.getProgramWithSchedules);
        }
      },
      error: error => {
        console.log('ERROR FETCHING PROGRAM DETAILS', error);
        fullProgramQuery.unsubscribe();
        onProgramFetched(null);
      },
    });
};
