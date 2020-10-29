import React from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Image,
} from 'react-native';
import Icon from '../../components/Icon';
import ThemeStyle from '../../styles/ThemeStyle';
import TextStyles from '../../styles/TextStyles';
const {width} = Dimensions.get('window');

export default (MessageInput = props => {
  return (
    <View
      style={{
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: props.lightBackground ? '#fff' : ThemeStyle.divider,
      }}>
      <TextInput
        ref={props.setRef}
        style={[
          TextStyles.GeneralText,
          {
            width: width - 84,
            height: 36,
            backgroundColor: props.lightBackground ? '#F2F2F2' : '#fff',
            paddingHorizontal: 16,
            borderRadius: 24,
            paddingTop: 8,
            marginRight: 16,
          },
        ]}
        multiline={true}
        underlineColorAndroid="transparent"
        placeholder={props.placeholder || 'Enter message'}
        onChangeText={props.onChangeText}
        onSubmitEditing={props.onSend}
      />
      <TouchableOpacity
        style={{
          height: 48,
          width: 48,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={props.onSend}>
        <Image
          source={require('../../assets/images/send.png')}
          style={{tintColor: ThemeStyle.mainColor, width: 32}}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
});
