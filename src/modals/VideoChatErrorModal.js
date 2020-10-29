import React from 'react';
import {Modal, View, Text} from 'react-native';
import Button from '../components/Button';
import Icon from '../components/Icon';
import TextStyles from '../styles/TextStyles';
import ThemeStyle from '../styles/ThemeStyle';

export default class VideoChatErrorModal extends React.Component {
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
    const {title, message} = this.state;
    const {onRetryConnection, onExit} = this.props;
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
                    TextStyles.HeaderBold,
                    {
                      marginLeft: 16,
                    },
                  ]}>
                  {title}
                </Text>
              </View>
              <Text
                style={[
                  TextStyles.SubHeaderBold,
                  {
                    fontSize: 16,
                  },
                ]}>
                {message ? message : 'Failed to connect'}
              </Text>
              <Button
                style={{flex: 1, marginTop: 32}}
                name="Retry"
                onPress={onRetryConnection}
              />
              <Button
                style={{flex: 1, marginTop: 16}}
                name="Exit Video Session"
                onPress={onExit}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}
