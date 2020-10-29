import React from 'react';
import {Modal, View, Text} from 'react-native';
import Button from '../components/Button';
import Icon from '../components/Icon';
import TextStyles from '../styles/TextStyles';
import ThemeStyle from '../styles/ThemeStyle';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {Image} from 'react-native-animatable';
import Dimensions from '../styles/Dimensions';

export default class AddScheduleToProgramModal extends React.Component {
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
      title: null,
      message: undefined,
    });
  };

  render() {
    const {title, message, onContinue} = this.state;
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
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Icon
                    size={32}
                    color={ThemeStyle.mainColor}
                    name="ios-information-circle-outline"
                    family="Ionicons"
                  />
                  <Text
                    style={[
                      TextStyles.HeaderBold,
                      {
                        marginLeft: 16,
                      },
                    ]}>
                    {title}
                  </Text>
                </View>
                <TouchableOpacity onPress={this.hide}>
                  <Image source={require('../assets/images/cross-icon.png')} />
                </TouchableOpacity>
              </View>
              <Text
                style={[
                  TextStyles.SubHeaderBold,
                  {
                    fontSize: 16,
                  },
                ]}>
                {message ||
                  'Do you want to add this schedule to the program as well?'}
              </Text>
              <Button
                style={{flex: 1, marginTop: 32}}
                name="Yes"
                onPress={() => {
                  this.hide();
                  onContinue(true);
                }}
              />
              <Button
                style={{
                  flex: 1,
                  marginTop: 16,
                  backgroundColor: ThemeStyle.divider,
                }}
                name="No"
                noGradient
                onPress={() => {
                  this.hide();
                  onContinue(false);
                }}
                textStyle={{color: ThemeStyle.textRegular}}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}
