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
import {Switch} from 'react-native-gesture-handler';
import {appsyncClient} from '../../App';
import {deleteProgram, editProgramMutation} from '../queries/program';
import {showMessage} from 'react-native-flash-message';
import {
  errorMessage,
  getCohortInputFromDetails,
  getProgramInputFromDetails,
} from '../utils';
import {programStatus} from '../constants';
import {editCohortMutation} from '../queries/cohort';
import _ from 'lodash';

export default class ProgramMenuModal extends Component {
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
    });
  };

  hide = () => {
    this.setState({
      visible: false,
    });
  };

  onEditProgramProperties = properties => {
    const {isCohort, program, setLoading} = this.props;
    this.hide();
    setLoading(true);
    const programData = {...program, ...properties};
    let key;
    let mutation;
    let variables = {};
    const refetchQueries = [];
    if (isCohort) {
      key = 'editCohort';
      mutation = editCohortMutation;
      variables = {
        cohortId: program.id,
        cohort: getCohortInputFromDetails(programData),
      };
      refetchQueries.push('getCohort');
    } else {
      key = 'editProgram';
      mutation = editProgramMutation;
      variables = {
        programId: program.id,
        program: getProgramInputFromDetails(programData),
      };
      refetchQueries.push('getProgramWithSchedules');
    }
    console.log('updating program', variables);
    setLoading(true);
    appsyncClient
      .mutate({
        mutation,
        variables,
        refetchQueries,
      })
      .then(data => {
        console.log('EDITED PROGRAM', data);
        setLoading(false);
        if (data.data && data.data[key]) {
          showMessage({
            type: 'success',
            message: `Successfully edited ${isCohort ? 'cohort' : 'program'}`,
          });
          this.show();
        }
      })
      .catch(err => {
        setLoading(false);
        console.log('ERROR EDITING PROGRAM', err);
        showMessage(errorMessage('Failed to edit program. Please try again.'));
      });
  };

  onAddCoCoach = () => {
    const {navigation, program, isCohort} = this.props;
    navigation.navigate('SelectCoaches', {program, isCohort});
    this.hide();
  };

  onEditProgram = () => {
    const {navigation, program, isCohort} = this.props;
    navigation.navigate('EditProgram', {program, isCohort});
    this.hide();
  };

  onDeleteProgram = () => {
    const {program, setLoading, navigation} = this.props;
    this.hide();
    setLoading(true);
    appsyncClient
      .mutate({
        mutation: deleteProgram,
        variables: {
          programId: program.id,
        },
        refetchQueries: ['getPrograms'],
      })
      .then(data => {
        console.log('DELETED PROGRAM', data);
        setLoading(false);
        if (
          data.data &&
          data.data.deleteProgram &&
          data.data.deleteProgram.success
        ) {
          showMessage({
            type: 'success',
            message: 'Successfully deleted program',
          });
          navigation.pop();
        } else {
          showMessage(errorMessage(data.data.deleteProgram.message));
        }
      })
      .catch(err => {
        setLoading(false);
        console.log('ERROR DELETING PROGRAM', err);
        showMessage(
          errorMessage('Failed to delete program. Please try again.'),
        );
      });
  };

  renderSwitchPreference = props => {
    const {isCohort} = this.props;
    if (isCohort) {
      return null;
    }
    return (
      <View
        style={{
          flexDirection: 'row',
          padding: Dimensions.marginLarge,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <View style={{flex: 0.9}}>
          <Text style={TextStyles.SubHeader2}>{props.label}</Text>
          <Text style={TextStyles.GeneralText}>{props.description}</Text>
        </View>
        <Switch value={props.value} onValueChange={props.onPress} />
      </View>
    );
  };

  render() {
    const {keyboardHeight} = this.state;
    const {isCohort, program, isUserProgram} = this.props;
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
                <Text style={[textStyles.SubHeaderBold]}>{'Settings'}</Text>
                <TouchableOpacity onPress={this.hide}>
                  <Image source={require('../assets/images/cross-icon.png')} />
                </TouchableOpacity>
              </View>
              {this.renderSwitchPreference({
                label: 'Closed to new requests',
                description: 'Will not accept new client',
                onPress: () => {
                  this.onEditProgramProperties({
                    closedToNewRequest: !program.closedToNewRequest,
                  });
                },
                value: program.closedToNewRequest,
              })}
              {this.renderSwitchPreference({
                label: 'Hidden',
                description: 'You can hide your program from search results',
                onPress: () => {
                  this.onEditProgramProperties({
                    hideFromSearch: !program.hideFromSearch,
                  });
                },
                value: program.hideFromSearch,
              })}
              <CustomButton
                onPress={this.onAddCoCoach}
                name={'Add Co-Coach'}
                noGradient
                style={{
                  marginTop: Dimensions.screenMarginWide,
                  backgroundColor: ThemeStyle.green,
                }}
              />
              <CustomButton
                onPress={this.onEditProgram}
                name={isCohort ? 'Edit Cohort' : 'Edit Program'}
                style={{marginTop: Dimensions.marginRegular}}
              />
              {!isCohort &&
                program.status !== programStatus.PUBLISHED &&
                isUserProgram && (
                  <CustomButton
                    name={`Delete Program`}
                    noGradient
                    onPress={this.onDeleteProgram}
                    style={{
                      borderWidth: Dimensions.r2,
                      borderColor: ThemeStyle.red,
                      marginVertical: Dimensions.marginRegular,
                    }}
                    textStyle={{color: ThemeStyle.red}}
                  />
                )}
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}
