import {moderateScale} from 'react-native-size-matters';
import {Dimensions} from 'react-native';
import {getStatusBarHeight, getBottomSpace} from 'react-native-iphone-x-helper';

const scaleFactor = 0.2;

export const responsiveDimension = dimensionValue =>
  moderateScale(dimensionValue, scaleFactor);

export default {
  r1: responsiveDimension(1),
  r2: responsiveDimension(2),
  r4: responsiveDimension(4),
  r5: responsiveDimension(5),
  r6: responsiveDimension(6),
  r8: responsiveDimension(8),
  r10: responsiveDimension(10),
  r12: responsiveDimension(12),
  r14: responsiveDimension(14),
  r16: responsiveDimension(16),
  r18: responsiveDimension(18),
  r20: responsiveDimension(20),
  r21: responsiveDimension(21),
  r24: responsiveDimension(24),
  r28: responsiveDimension(28),
  r30: responsiveDimension(30),
  r32: responsiveDimension(32),
  r36: responsiveDimension(36),
  r40: responsiveDimension(40),
  r48: responsiveDimension(48),
  r52: responsiveDimension(52),
  r55: responsiveDimension(55),
  r64: responsiveDimension(64),
  r68: responsiveDimension(68),
  r70: responsiveDimension(70),
  r72: responsiveDimension(72),
  r78: responsiveDimension(78),
  r80: responsiveDimension(80),
  r96: responsiveDimension(96),
  r128: responsiveDimension(128),
  r140: responsiveDimension(140),
  r144: responsiveDimension(144),
  r150: responsiveDimension(150),
  r152: responsiveDimension(152),
  r168: responsiveDimension(168),
  r175: responsiveDimension(175),
  r190: responsiveDimension(190),
  r196: responsiveDimension(196),
  r235: responsiveDimension(235),
  r256: responsiveDimension(256),
  r360: responsiveDimension(360),
  r400: responsiveDimension(400),
  screenMarginWide: responsiveDimension(24),
  screenMarginRegular: responsiveDimension(20),
  marginExtraLarge: responsiveDimension(20),
  marginLarge: responsiveDimension(16),
  marginRegular: responsiveDimension(12),
  marginSmall: responsiveDimension(8),
  marginExtraSmall: responsiveDimension(4),

  safeAreaPaddingTop: getStatusBarHeight(true),
  safeAreaPaddingBottom: getBottomSpace(),
};

export const windowDimensions = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
};
