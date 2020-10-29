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

export default class EditProgramTagsModal extends Component {
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
      ...options,
      tags: options.tags || [],
    });
  };

  hide = () => {
    this.setState({
      visible: false,
      message: undefined,
    });
  };

  renderTagsList = () => {
    const {tags} = this.state;
    const {isEdit, onTagsUpdated} = this.props;
    const Component = isEdit ? TouchableOpacity : View;
    let elementsList = [];
    tags.map(data => {
      elementsList.push(
        <Component
          key={data}
          style={{
            paddingHorizontal: 15,
            borderWidth: 1,
            marginHorizontal: 8,
            marginBottom: 12,
            borderRadius: 25,
            paddingVertical: 7,
            borderColor: ThemeStyle.red,
            backgroundColor: ThemeStyle.foreground,
          }}
          onPress={() => {
            tags.splice(tags.indexOf(data), 1);
            this.setState({
              tags,
            });
            onTagsUpdated(tags);
          }}>
          <Text
            style={[
              {
                fontSize: 14,
                color: ThemeStyle.red,
              },
              textStyles.GeneralText,
            ]}>
            {data}
          </Text>
        </Component>,
      );
    });
    return elementsList.length > 0 ? (
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          paddingHorizontal: Dimensions.marginRegular,
        }}>
        {elementsList}
      </View>
    ) : (
      <Text
        style={[
          TextStyles.GeneralText,
          {
            paddingHorizontal: Dimensions.screenMarginRegular,
            paddingTop: Dimensions.marginSmall,
          },
        ]}>
        No Tags Added
      </Text>
    );
  };

  render() {
    const {isEdit} = this.props;
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
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: Dimensions.screenMarginRegular,
                }}>
                <Text style={[textStyles.HeaderBold]}>{'Tags'}</Text>
              </View>
              {this.renderTagsList()}
              {isEdit && (
                <View style={{padding: Dimensions.screenMarginRegular}}>
                  <Text
                    style={[
                      textStyles.SubHeaderBold,
                      {
                        fontSize: 16,
                      },
                    ]}>
                    {'Add Tag'}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <TextInput
                      ref={ref => {
                        this.tagInput = ref;
                      }}
                      placeholder={`Enter tag name`}
                      underlineColorAndroid="transparent"
                      style={[
                        textStyles.GeneralTextBold,
                        {color: ThemeStyle.mainColor, flex: 1},
                      ]}
                      onChangeText={text => {
                        this.tagName = text;
                      }}
                      blurOnSubmit={false}
                    />
                    <CustomButton
                      onPress={() => {
                        const {onTagsUpdated} = this.props;
                        const {tags} = this.state;
                        if (isNullOrEmpty(this.tagName)) {
                          return showMessage(
                            errorMessage('Please enter a tag name'),
                          );
                        }
                        if (this.tagName.length < 3) {
                          return showMessage(
                            errorMessage(
                              'Tag should be at least 3 characters long',
                            ),
                          );
                        }
                        tags.push(this.tagName);
                        this.setState({
                          tags,
                        });
                        this.tagInput.clear();
                        this.tagName = null;
                        onTagsUpdated(tags);
                      }}
                      name="Add"
                    />
                  </View>
                  <CustomButton
                    onPress={this.hide}
                    name="Done"
                    style={{marginTop: Dimensions.screenMarginWide}}
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}
