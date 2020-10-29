import {connect} from 'react-redux';
import {setLoading} from '../redux/actions/AppActions';

export const withStore = (
  component,
  mapState = () => ({}),
  mapDispatch = () => ({}),
) => {
  function mapStateToProps(state) {
    return {
      loading: state.app.loading,
      user: state.user,
      isCoach: state.user.isCoach,
      ...mapState(state),
    };
  }

  function mapDispatchToProps(dispatch) {
    return {
      setLoading: isLoading => dispatch(setLoading(isLoading)),
      ...mapDispatch(dispatch),
    };
  }

  return connect(
    mapStateToProps,
    mapDispatchToProps,
  )(component);
};
