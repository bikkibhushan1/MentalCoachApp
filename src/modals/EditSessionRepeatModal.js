import React, {Component} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  Platform,
  Image,
} from 'react-native';
import textStyles from '../styles/TextStyles';
import ThemeStyle from '../styles/ThemeStyle';
import CustomButton from '../components/Button';
import TextStyles from '../styles/TextStyles';
import Dimensions from '../styles/Dimensions';
import {sessionRepeatTypes} from '../constants';

export default class EditSessionRepeatModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      tags: [],
      keyboardHeight: 0,
    };
  }

  componentWillMount() {
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this.onKeyboardDidShow,
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this.onKeyboardDidHide,
    );
  }

  onKeyboardDidShow = e => {
    this.setState({
      keyboardHeight: Platform.OS === 'ios' ? e.endCoordinates.height : 0,
    });
  };

  onKeyboardDidHide = () => {
    this.setState({
      keyboardHeight: 0,
    });
  };

  componentWillUnmount() {
    this.keyboardDidShowListener && this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener && this.keyboardDidHideListener.remove();
  }

  show = options => {
    this.setState({
      visible: true,
      repeat: options.repeat,
    });
  };

  hide = () => {
    this.setState({
      visible: false,
    });
  };

  onConfirm = () => {
    const {onRepeatSelected} = this.props;
    const {repeat} = this.state;
    onRepeatSelected(repeat);
    this.hide();
  };

  renderRepeatItem = repeatType => {
    const {repeat} = this.state;
    const isSelected = repeat === repeatType;
    return (
      <TouchableOpacity
        onPress={() => {
          this.setState({repeat: repeatType});
        }}
        style={{
          flexDirection: 'row',
          borderWidth: isSelected ? Dimensions.r1 : 0,
          padding: Dimensions.marginLarge,
          marginHorizontal: Dimensions.screenMarginWide,
          alignItems: 'center',
          borderRadius: Dimensions.r8,
          borderColor: ThemeStyle.mainColor,
          justifyContent: 'space-between',
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={TextStyles.GeneralTextBold}>{repeatType}</Text>
        </View>
        {isSelected && (
          <Image source={require('../assets/images/selected-icon.png')} />
        )}
      </TouchableOpacity>
    );
  };

  render() {
    const {keyboardHeight} = this.state;
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.visible}
        onRequestClose={() => {
          this.setState({
            visible: false,
          });
          // this.props.onBack && this.props.onBack();
        }}>
        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.42)'}}>
          <View
            style={{
              flex: 1,
              position: 'absolute',
              bottom: keyboardHeight,
              left: 0,
              right: 0,
            }}>
            <View
              style={{
                backgroundColor: ThemeStyle.foreground,
                shadowColor: 'grey',
                shadowOffset: {width: 15, height: 5},
                shadowOpacity: 0.5,
                shadowRadius: 10,
                paddingVertical: 24,
                paddingHorizontal: Dimensions.screenMarginRegular,
                borderTopLeftRadius: Dimensions.r24,
                borderTopRightRadius: Dimensions.r24,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: Dimensions.marginLarge,
                  justifyContent: 'space-between',
                }}>
                <Text style={[textStyles.SubHeaderBold]}>{'Repeat'}</Text>
                <TouchableOpacity onPress={this.hide}>
                  <Image source={require('../assets/images/cross-icon.png')} />
                </TouchableOpacity>
              </View>
              {Object.values(sessionRepeatTypes).map(this.renderRepeatItem)}
              <CustomButton
                onPress={this.onConfirm}
                name="Done"
                style={{marginTop: Dimensions.screenMarginWide}}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}
