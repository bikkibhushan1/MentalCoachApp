import React from 'react';
import {Modal, View, Text, Image} from 'react-native';
import Button from '../components/Button';
import Icon from '../components/Icon';
import TextStyles from '../styles/TextStyles';
import ThemeStyle from '../styles/ThemeStyle';
import Dimensions from '../styles/Dimensions';
import {TouchableOpacity} from 'react-native-gesture-handler';

export default class ConfirmationModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  show = options => {
    this.setState({
      visible: true,
      ...options,
    });
  };

  hide = () => {
    this.setState({
      visible: false,
      message: undefined,
    });
  };

  render() {
    const {message, onConfirm = () => {}} = this.state;
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.visible}
        onRequestClose={() => {}}>
        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.42)'}}>
          <View
            style={{
              flex: 1,
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
            }}>
            <View
              style={{
                backgroundColor: '#fff',
                shadowColor: 'grey',
                shadowOffset: {width: 15, height: 5},
                shadowOpacity: 0.5,
                shadowRadius: 10,
                paddingHorizontal: 24,
                paddingVertical: 24,
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
                <Text style={[TextStyles.SubHeaderBold]}>{'Confirm'}</Text>
                <TouchableOpacity onPress={this.hide}>
                  <Image source={require('../assets/images/cross-icon.png')} />
                </TouchableOpacity>
              </View>
              {message && (
                <Text
                  style={[
                    TextStyles.SubHeaderBold,
                    {
                      fontSize: 16,
                    },
                  ]}>
                  {message}
                </Text>
              )}
              <Button
                style={{flex: 1, marginTop: 32}}
                name={'Yes'}
                onPress={() => {
                  this.hide();
                  onConfirm();
                }}
              />
              <Button
                style={{
                  flex: 1,
                  marginTop: 16,
                  backgroundColor: ThemeStyle.disabledLight,
                }}
                textStyle={{color: ThemeStyle.textRegular}}
                noGradient
                name="No"
                onPress={this.hide}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}
