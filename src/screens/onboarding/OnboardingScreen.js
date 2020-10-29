import React from 'react';
import {StyleSheet, Text, View, Image, Button} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';

const slides = [
  {
    key: 's1',
    text:
      'Your one-stop shop for physical, emotional and spiritual well-being and personal growth.',
    maintitle: 'Welcome to the Life Coach',
    image: require('./../../assets/images/onboarding_assets/dimensions.png'),
  },
  {
    key: 's2',
    maintitle: 'Flexible and Personalized and Group Coaching',
    text:
      'Find flexible and afforable options including free programs from leading coaches at a breakthrough Price.',
    image: {
      uri:
        'https://raw.githubusercontent.com/AboutReact/sampleresource/master/intro_flight_ticket_booking.png',
    },
  },
  {
    key: 's3',
    maintitle: 'Programs across all dimensions of wellness',
    text:
      'We at Life Coach take a holistic view of health and created programs across all dimensions of wellness.',
    image: {
      uri:
        'https://raw.githubusercontent.com/AboutReact/sampleresource/master/intro_discount.png',
    },
  },
  {
    key: 's4',
    maintitle: 'Programs and Techniques that work',
    text:
      ' All our programs are rooted in evidence-based approaches to help you improve your overall well-being.',
    image: {
      uri:
        'https://raw.githubusercontent.com/AboutReact/sampleresource/master/intro_best_deals.png',
    },
  },
  {
    key: 's5',
    maintitle: 'Join now and grow with our coaches',
    text:
      'Learn from top-tier certified coches, specialized in physical and behavioral health coaching.',
    image: {
      uri:
        'https://raw.githubusercontent.com/AboutReact/sampleresource/master/intro_bus_ticket_booking.png',
    },
  },
];

export default class App extends React.Component {
  _renderItem = ({item}) => {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',

          paddingBottom: 150,
        }}>
        <Image style={styles.image} source={item.image} />
        <Text style={styles.maintitle}>{item.maintitle}</Text>
        <Text style={styles.text}>{item.text}</Text>
      </View>
    );
  };
  _onDone = () => {
    this.setState({showRealApp: true});
  };
  _onSkip = () => {
    this.setState({showRealApp: true});
  };
  render() {
    return (
      <AppIntroSlider
        renderItem={this._renderItem}
        data={slides}
        onDone={this._onDone}
        onSkip={this._onSkip}
      />
    );
  }
}

const styles = StyleSheet.create({
  image: {
    width: 200,
    height: 200,
  },
  text: {
    fontSize: 18,
    color: 'blue',
    textAlign: 'center',
    padding: 0,
    margin: 0,
  },
  maintitle: {
    fontSize: 25,
    color: 'blue',
    textAlign: 'center',
    paddingTop: 100,
    margin: 0,
  },
  dotStyle: {backgroundColor: 'rgba(144, 255, 0, .0)'},
  activeDotStyle: {backgroundColor: 'rgba(255, 255, 255, .0)'},
});
