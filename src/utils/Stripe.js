import stripe from 'tipsi-stripe';
import {getEnvVars} from '../constants';

stripe.setOptions({
  publishableKey: getEnvVars().stripeKey,
  // merchantId: 'MERCHANT_ID', // Optional
  // androidPayMode: 'test', // Android only
});

export default stripe;
