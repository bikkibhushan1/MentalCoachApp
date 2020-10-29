import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Foundation from 'react-native-vector-icons/Foundation';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import Zocial from 'react-native-vector-icons/Zocial';
import AntDesign from 'react-native-vector-icons/AntDesign';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Feather from 'react-native-vector-icons/Feather';
import {Platform} from 'react-native';

export default class Icon extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    switch (this.props.family) {
      case 'Ionicons':
        this.Icon = Ionicons;
        break;
      case 'Entypo':
        this.Icon = Entypo;
        break;
      case 'FontAwesome':
        this.Icon = FontAwesome;
        break;
      case 'Foundation':
        this.Icon = Foundation;
        break;
      case 'MaterialIcons':
        this.Icon = MaterialIcons;
        break;
      case 'MaterialCommunityIcons':
        this.Icon = MaterialCommunityIcons;
        break;
      case 'Octicons':
        this.Icon = Octicons;
        break;
      case 'Zocial':
        this.Icon = Zocial;
        break;
      case 'SimpleLineIcons':
        this.Icon = SimpleLineIcons;
        break;
      case 'Feather':
        this.Icon = Feather;
        break;
      case 'EvilIcons':
        this.Icon = EvilIcons;
        break;
      case 'AntDesign':
        this.Icon = AntDesign;
        break;

      default:
        this.Icon = Ionicons;
    }
  }

  render() {
    const color = {color: this.props.color ? this.props.color : 'black'};
    return (
      <this.Icon
        name={this.props.name}
        size={this.props.size}
        style={[color, this.props.style]}
      />
    );
  }

  static propTypes = {
    family: PropTypes.string,
    name: PropTypes.string,
    color: PropTypes.string,
  };

  static defaultProps = {
    size: Platform.OS === 'ios' ? 30 : 28,
  };
}
