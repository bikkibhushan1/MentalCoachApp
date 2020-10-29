import React, {Component} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Platform,
} from 'react-native';
import textStyles from '../styles/TextStyles';
import ThemeStyle from '../styles/ThemeStyle';
import Icon from '../components/Icon';
import CustomButton from '../components/Button';
import {isNullOrEmpty, errorMessage} from '../utils';
import {showMessage} from 'react-native-flash-message';
import TextStyles from '../styles/TextStyles';
import Dimensions from '../styles/Dimensions';
import CustomInput from '../components/CustomInput';

const durationPeriods = ['DAYS', 'WEEKS', 'MONTHS'];

export default class EditDurationModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
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

  show = (options = {}) => {
    this.setState({
      visible: true,
      durationInterval: options.durationInterval,
      durationPeriod: options.durationPeriod,
    });
  };

  hide = () => {
    this.setState({
      visible: false,
      message: undefined,
    });
  };

  onConfirm = () => {
    const {durationPeriod, durationInterval} = this.state;
    const {onDurationSelected} = this.props;
    if (
      !durationInterval ||
      isNaN(parseInt(durationInterval)) ||
      parseInt(durationInterval) < 1
    ) {
      return showMessage(
        errorMessage('Please enter valid interval for duration'),
      );
    }
    if (!durationPeriod) {
      return showMessage(
        errorMessage('Please enter valid period for duration'),
      );
    }
    onDurationSelected(parseInt(durationInterval), durationPeriod);
    this.hide();
  };

  renderDurationPeriod = period => {
    const {durationPeriod} = this.state;
    const isSelected = durationPeriod === period;
    return (
      <TouchableOpacity
        key={period}
        style={{
          flex: 1,
          paddingHorizontal: Dimensions.r14,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          marginHorizontal: 8,
          borderRadius: 25,
          paddingVertical: Dimensions.r10,
          borderColor: isSelected ? ThemeStyle.mainColor : ThemeStyle.textLight,
          backgroundColor: isSelected
            ? ThemeStyle.mainColor
            : ThemeStyle.foreground,
        }}
        onPress={() => {
          this.setState({
            durationPeriod: period,
          });
        }}>
        <Text
          style={[
            textStyles.GeneralText,
            {
              color: isSelected ? ThemeStyle.white : ThemeStyle.textLight,
            },
          ]}>
          {period}
        </Text>
      </TouchableOpacity>
    );
  };

  render() {
    const {keyboardHeight, durationInterval} = this.state;
    const {title} = this.props;
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
                paddingVertical: Dimensions.r24,
                paddingHorizontal: Dimensions.screenMarginRegular,
                borderTopLeftRadius: Dimensions.r24,
                borderTopRightRadius: Dimensions.r24,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={[textStyles.SubHeader2]}>{title || 'Duration'}</Text>
              <CustomInput
                defaultValue={`${durationInterval || 0}`}
                placeholder={'00'}
                keyboardType="number-pad"
                underlineColorAndroid="transparent"
                style={[
                  TextStyles.SubHeaderBold,
                  {
                    paddingVertical: Dimensions.marginRegular,
                    paddingHorizontal: Dimensions.marginExtraLarge,
                    borderRadius: Dimensions.r8,
                    backgroundColor: ThemeStyle.divider,
                    minWidth: Dimensions.r96,
                    textAlign: 'center',
                    marginVertical: Dimensions.r24,
                  },
                ]}
                onChangeText={text => {
                  this.setState({
                    durationInterval: text,
                  });
                }}
                blurOnSubmit
              />
              <View style={{flexDirection: 'row'}}>
                {durationPeriods.map(this.renderDurationPeriod)}
              </View>
              <CustomButton
                onPress={this.onConfirm}
                name="Confirm"
                style={{
                  marginVertical: Dimensions.screenMarginWide,
                  width: '100%',
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}
