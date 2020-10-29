import React from 'react';
import {View, TouchableOpacity, Text, TextInput} from 'react-native';
import BaseComponent from '../../components/BaseComponent';
import ThemeStyle from '../../styles/ThemeStyle';
import Header from '../../components/Header';
import Dimensions from '../../styles/Dimensions';
import TextStyles from '../../styles/TextStyles';
import {withStore} from '../../utils/StoreUtils';
import InputField from '../../components/InputField';
import {isNullOrEmpty, errorMessage} from '../../utils';
import {appsyncClient} from '../../../App';
import {showMessage} from 'react-native-flash-message';
import validator from 'validator';
import CustomButton from '../../components/Button';
import CustomInput from '../../components/CustomInput';
import {inviteUserToCohort} from '../../queries/cohort';

class InviteUserScreen extends BaseComponent {
  constructor(props) {
    super(props);
    this.state.program = props.navigation.getParam('program', {});
  }

  onSendInvite = () => {
    const {program} = this.state;
    const {setLoading} = this.props;
    if (isNullOrEmpty(this.email) || !validator.isEmail(this.email)) {
      return showMessage(errorMessage('Please enter a valid email address'));
    }
    if (isNullOrEmpty(this.body)) {
      return showMessage(errorMessage('Please enter a message'));
    }
    setLoading(true);
    appsyncClient
      .mutate({
        mutation: inviteUserToCohort,
        variables: {
          cohortId: program.id,
          email: this.email,
        },
      })
      .then(data => {
        console.log('SENT INVITE', data);
        setLoading(false);
        if (data.data && data.data.inviteUserToCohort) {
          if (data.data.inviteUserToCohort.success) {
            showMessage({type: 'success', message: 'Invite sent successfully'});
          } else {
            showMessage(errorMessage(data.data.inviteUserToCohort.message));
          }
        } else {
          showMessage(errorMessage());
        }
      })
      .catch(err => {
        console.log('ERROR SENDING INVITE', err);
        setLoading(false);
        showMessage(errorMessage('Failed to send invite. Please try again.'));
      });
  };

  render() {
    const {navigation} = this.props;
    const {program} = this.state;
    return this.renderWithSafeArea(
      <View style={ThemeStyle.pageContainer}>
        <Header
          title="Invite"
          goBack={() => {
            navigation.pop();
          }}
        />
        <View
          style={{
            paddingHorizontal: Dimensions.screenMarginRegular,
          }}>
          <InputField
            onPress={() => {
              this.emailInput.focus();
            }}
            label={'TO'}
            renderInputComponent={() => {
              return (
                <CustomInput
                  ref={ref => {
                    this.emailInput = ref;
                  }}
                  placeholder="Email"
                  placeholderTextColor={ThemeStyle.textExtraLight}
                  style={[
                    TextStyles.GeneralTextBold,
                    {
                      color: ThemeStyle.mainColor,
                      width: '100%',
                      marginLeft: Dimensions.marginRegular,
                    },
                  ]}
                  onChangeText={text => {
                    this.email = text;
                  }}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  autoCapitalize="none"
                />
              );
            }}
          />
          <TouchableOpacity
            style={{
              backgroundColor: ThemeStyle.foreground,
              borderRadius: Dimensions.r20,
              paddingVertical: Dimensions.r28,
              paddingHorizontal: Dimensions.r24,
              marginBottom: Dimensions.marginRegular,
            }}
            onPress={() => {
              this.descriptionInput.focus();
            }}>
            <Text style={TextStyles.GeneralTextBold}>{`Message`}</Text>
            <CustomInput
              ref={ref => {
                this.descriptionInput = ref;
              }}
              defaultValue={this.description}
              style={[
                TextStyles.GeneralTextBold,
                {
                  color: ThemeStyle.mainColor,
                  marginTop: Dimensions.marginSmall,
                  minHeight: Dimensions.r144,
                },
              ]}
              onChangeText={text => {
                this.body = text;
              }}
              blurOnSubmit={false}
              multiline={true}
            />
          </TouchableOpacity>
        </View>
        <CustomButton
          name="Send Invite"
          style={{
            position: 'absolute',
            bottom: Dimensions.screenMarginRegular,
            left: Dimensions.screenMarginWide,
            right: Dimensions.screenMarginWide,
          }}
          onPress={this.onSendInvite}
        />
      </View>,
    );
  }
}

export default withStore(InviteUserScreen);
