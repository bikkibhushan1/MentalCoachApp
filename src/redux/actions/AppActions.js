export const APP_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
};

export const setLoading = isLoading => ({
  type: APP_ACTIONS.SET_LOADING,
  payload: isLoading,
});
