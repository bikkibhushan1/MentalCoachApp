import React from 'react';
import {Modal, Image, Linking} from 'react-native';
import {View, Text} from 'react-native-animatable';
import Dimensions from '../styles/Dimensions';
import TextStyles from '../styles/TextStyles';
import CustomButton from '../components/Button';
import ThemeStyle from '../styles/ThemeStyle';

export default class AddPaymentModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      program: {},
    };
  }

  show = program => {
    this.setState({
      visible: true,
      program,
    });
  };

  hide = () => {
    this.setState({visible: false});
  };

  render() {
    const {visible} = this.state;
    if (!visible) return null;
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.showAddPaymentModal}
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
                borderRadius: Dimensions.r24,
                padding: Dimensions.marginExtraLarge,
                margin: Dimensions.marginRegular,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Image source={require('../assets/images/important-icon.png')} />
              <Text
                style={[
                  TextStyles.SubHeaderBold,
                  {textAlign: 'center', margin: Dimensions.marginLarge},
                ]}>
                Important!
              </Text>
              <Text
                style={[
                  TextStyles.GeneralText,
                  {textAlign: 'center'},
                ]}>{`If you'd like to accept payments through the platform, you must register or login to your stripe account `}</Text>
              <CustomButton
                style={{width: '100%', marginTop: Dimensions.marginLarge}}
                onPress={() => {
                  const {navigation} = this.props;
                  this.hide();
                  navigation.navigate('ConnectStripe', {
                    onAuthorizationSuccess: () => {},
                  });
                }}
                name="Continue"
              />
              <CustomButton
                style={{
                  width: '100%',
                  marginTop: Dimensions.marginRegular,
                  backgroundColor: ThemeStyle.disabledLight,
                }}
                noGradient
                onPress={() => {
                  this.setState({visible: false});
                }}
                textStyle={{
                  color: ThemeStyle.textLight,
                }}
                name="Skip"
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}
