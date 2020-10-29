import React, {Component} from 'react';
import {StyleSheet, Text, ActivityIndicator, View, Image} from 'react-native';
import BaseComponent from '../../components/BaseComponent';
import {generateRandomID, errorMessage} from '../../utils';
import {appsyncClient} from '../../../App';
import {authenticateStripeToken} from '../../queries/user';
import {withStore} from '../../utils/StoreUtils';
import {showMessage} from 'react-native-flash-message';
import {getEnvVars} from '../../constants';
import WebView from 'react-native-webview';
import URL from 'url-parse';
import Header from '../../components/Header';
import ThemeStyle from '../../styles/ThemeStyle';
import TextStyles from '../../styles/TextStyles';
import Dimensions from '../../styles/Dimensions';
import Icon from '../../components/Icon';
import {fetchUserProfile} from '../../redux/actions/UserActions';

const redirectURL = `https://coaching-app/auth/stripe`;

class ConnectStripeScreen extends BaseComponent {
  constructor(props) {
    super(props);
    this.state.showSuccess = false;
    this.state.onAuthorizationSuccess = props.navigation.getParam(
      'onAuthorizationSuccess',
      () => {},
    );
    this.state.csrfState = generateRandomID();
  }

  getURL = () => {
    const {csrfState} = this.state;
    const {user} = this.props;
    let userName = user.name.split(' ');
    let firstName = userName[0];
    let lastName = userName.length > 1 ? userName[1] : '';
    const capabilities = ['card_payments', 'transfers'];
    return `https://connect.stripe.com/express/oauth/authorize?client_id=${
      getEnvVars().stripeClientID
    }&state=${csrfState}&stripe_user[email]=${
      user.email
    }&stripe_user[first_name]=${firstName}&stripe_user[last_name]=${lastName}`;
  };

  onTokenReceived = token => {
    const {setLoading, navigation, getUserDetails} = this.props;
    const {onAuthorizationSuccess} = this.state;
    this.setState({
      showSuccess: true,
    });
    setLoading(true);
    appsyncClient
      .mutate({
        mutation: authenticateStripeToken,
        variables: {
          token,
        },
      })
      .then(data => {
        console.log('AUTHORIZED TOKEN', data);
        setLoading(false);
        if (
          data.data &&
          data.data.authenticateStripeToken &&
          data.data.authenticateStripeToken.success
        ) {
          getUserDetails();
          onAuthorizationSuccess();
          navigation.pop();
        } else {
          showMessage(
            errorMessage(
              'Failed to authenticate your account. Please try again',
            ),
          );
        }
      })
      .catch(err => {
        console.log('ERROR IN AUTHENTICATING STRIPE', err);
        setLoading(false);
        showMessage(
          errorMessage('Failed to authenticate your account. Please try again'),
        );
      });
  };

  render() {
    const {navigation} = this.props;
    const {showSuccess} = this.state;
    return this.renderWithSafeArea(
      <React.Fragment>
        <Header title="Connect Stripe" goBack={() => navigation.pop()} />
        {showSuccess ? (
          <View
            style={[
              ThemeStyle.pageContainer,
              {justifyContent: 'center', alignItems: 'center'},
            ]}>
            <Icon
              family="Ionicons"
              name="ios-checkmark-circle"
              size={Dimensions.r96}
              color={ThemeStyle.green}
            />
            <Text style={TextStyles.GeneralTextBold}>
              Stripe details collected. Please wait while we authenticating your
              request
            </Text>
          </View>
        ) : (
          <WebView
            ref={ref => {
              this.webview = ref;
            }}
            onNavigationStateChange={this.onLoad}
            style={styles.container}
            source={{uri: this.getURL()}}
            onError={syntheticEvent => {
              const {nativeEvent} = syntheticEvent;
              console.warn('WebView error: ', nativeEvent);
            }}
            startInLoadingState={true}
            renderLoading={() => (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#0001',
                }}>
                <ActivityIndicator color={ThemeStyle.mainColor} size="large" />
              </View>
            )}
          />
        )}
      </React.Fragment>,
    );
  }

  onLoad = state => {
    const {csrfState} = this.state;
    if (state.url.indexOf(redirectURL) != -1) {
      try {
        const urlDetails = URL(state.url, true);
        console.log('GETTING URL DETAILS', urlDetails, urlDetails.query);
        if (
          urlDetails.query.code &&
          urlDetails.query.state &&
          urlDetails.query.state === csrfState
        ) {
          this.onTokenReceived(urlDetails.query.code);
        }
      } catch (err) {
        console.warn(err);
        showMessage(errorMessage());
      }
    }
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default withStore(ConnectStripeScreen, undefined, dispatch => ({
  getUserDetails: () => dispatch(fetchUserProfile()),
}));
