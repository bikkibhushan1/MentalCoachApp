//import liraries
import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import ThemeStyle from '../../styles/ThemeStyle';
import Dimensions, {windowDimensions} from '../../styles/Dimensions';

import TextStyles, {fontFamily} from '../../styles/TextStyles';

// create a component
class splashtest extends Component {
  render() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',

          marginTop: windowDimensions.height / 4,
        }}>
        <Image
          source={require('./../../assets/images/Life-coach-symbol.png')}
          style={{
            alignSelf: 'center',
            resizeMode: 'center',
          }}
        />

        <View
          style={{
            flex: 1,
            alignItems: 'center',
            flexDirection: 'column',
          }}>
          <Text
            style={{
              fontSize: 32,
              fontFamily: fontFamily.bold,
              marginTop: -80,
            }}>
            LIFE COACH
          </Text>
          <Text style={{color: ThemeStyle.mainColor, fontSize: 20}}>
            Powered by Swasth
          </Text>
        </View>
      </View>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
  },
});

//make this component available to the app
export default splashtest;

// <View style={ThemeStyle.pageContainer}>
//   <View
//     style={{
//       flex: 1,
//       justifyContent: 'center',
//       padding: Dimensions.screenMarginWide,
//     }}>
//     <Text
//       style={{
//         fontSize: 32,
//         fontFamily: fontFamily.bold,
//         marginBottom: 4,
//       }}>
//       Welcome to
//     </Text>
//     <Text
//       style={{
//         fontSize: 40,
//         fontFamily: fontFamily.extra_bold,
//         marginBottom: 8,
//         color: ThemeStyle.mainColor,
//       }}>
//       Swasth Coach
//     </Text>
//     <Text style={TextStyles.SubHeader2}>Your personal coach</Text>
//   </View>
// </View>
