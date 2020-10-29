import React, {Component} from 'react';
import {Modal, View, Text} from 'react-native';
import textStyles from '../styles/TextStyles';
import ThemeStyle from '../styles/ThemeStyle';
import Icon from '../components/Icon';
import CustomButton from '../components/Button';

export default class OfflineModal extends Component {
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
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                <Icon
                  size={32}
                  color={ThemeStyle.mainColor}
                  name="ios-information-circle-outline"
                  family="Ionicons"
                />
                <Text
                  style={[
                    textStyles.HeaderBold,
                    {
                      marginLeft: 16,
                    },
                  ]}>
                  {'You are offline'}
                </Text>
              </View>
              <Text
                style={[
                  textStyles.SubHeaderBold,
                  {
                    fontSize: 16,
                  },
                ]}>
                {this.state.message
                  ? this.state.message
                  : 'Sorry, the requested data is not available offline. Please connect to the internet and try again. '}
              </Text>
              <CustomButton
                style={{flex: 1, marginTop: 32}}
                onPress={() => {
                  this.setState({
                    visible: false,
                  });
                  // this.props.onBack && this.props.onBack();
                }}
                name="Okay"
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

let offlineModal = undefined;

export function setOfflineModal(ref) {
  offlineModal = ref;
}

export function getOfflineModal() {
  return offlineModal;
}
