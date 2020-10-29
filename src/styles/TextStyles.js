import {StyleSheet} from 'react-native';
import ThemeStyle from './ThemeStyle';

export const fontFamily = {
  extra_bold: 'AirbnbCerealApp-Bold',
  bold: 'AirbnbCerealApp-Medium',
  regular: 'AirbnbCerealApp-Book',
  thin: 'Apercu',
};

export default StyleSheet.create({
  HeaderExtraBold: {
    fontFamily: fontFamily.extra_bold,
    fontSize: 30,
    color: ThemeStyle.textDark,
  },
  HeaderBold: {
    fontFamily: fontFamily.bold,
    fontSize: 24,
    color: ThemeStyle.textDark,
  },
  HeaderBold2: {
    fontFamily: fontFamily.regular,
    fontSize: 30,
    color: ThemeStyle.textDark,
  },
  SubHeaderBold: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: ThemeStyle.textRegular,
  },
  SubHeaderBold2: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: ThemeStyle.textRegular,
    lineHeight: 29,
  },
  SubHeader: {
    fontFamily: fontFamily.regular,
    fontSize: 20,
    color: ThemeStyle.textRegular,
  },
  Header2: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    color: ThemeStyle.textRegular,
    lineHeight: 22,
  },
  SubHeader2: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: ThemeStyle.textRegular,
    lineHeight: 18,
  },

  GeneralText: {
    color: ThemeStyle.textRegular,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 17,
  },

  GeneralTextBold: {
    color: ThemeStyle.textRegular,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '600',
  },
  FooterText: {
    color: ThemeStyle.textExtraLight,
    fontFamily: fontFamily.regular,
    fontSize: 10,
    lineHeight: 13,
  },
  FooterTextBold: {
    color: ThemeStyle.textExtraLight,
    fontFamily: fontFamily.regular,
    fontSize: 10,
    lineHeight: 13,
  },
  ContentText: {
    fontFamily: fontFamily.regular,
    color: ThemeStyle.textRegular,
    fontSize: 12,
    lineHeight: 14,
  },
  ContentTextBold: {
    fontFamily: fontFamily.bold,
    color: ThemeStyle.textRegular,
    fontSize: 12,
    lineHeight: 14,
  },
});
