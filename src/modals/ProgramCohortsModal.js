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
import {isNullOrEmpty, errorMessage} from '../utils';
import {showMessage} from 'react-native-flash-message';
import Dimensions, {windowDimensions} from '../styles/Dimensions';
import {appsyncClient} from '../../App';
import {addCohort} from '../queries/cohort';
import {ScrollView} from 'react-native-gesture-handler';
import ProgramCohorts from '../screens/programs/programDetails/ProgramCohorts';

export default class ProgramCohortsModal extends Component {
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
      program: options.program,
    });
  };

  hide = () => {
    this.setState({
      visible: false,
      program: null,
    });
  };

  onSelectDate = date => {
    this.setState({
      selectedDate: date.toISOString(),
      isDatePickerVisible: false,
    });
  };

  onConfirm = () => {
    const {selectedDate, isPublish} = this.state;
    const {setLoading, program} = this.props;
    setLoading(true);
    appsyncClient
      .mutate({
        mutation: addCohort,
        variables: {
          programId: program.id,
          startDate: selectedDate,
        },
        refetchQueries: ['getProgramWithSchedules'],
      })
      .then(data => {
        console.log('ADDED COHORT', data);
        setLoading(false);
        if (data.data && data.data.addCohort) {
          showMessage(
            isPublish
              ? 'Successfully published program'
              : 'Successfully added cohort',
          );
          this.hide();
        }
      })
      .catch(err => {
        console.log('ERROR IN ADDING COHORT', err);
        setLoading(false);
        showMessage(errorMessage('Failed to add cohort. Please try again'));
      });
    this.hide();
  };

  render() {
    const {keyboardHeight} = this.state;
    const {program, onSelect, isUserProgram, isCoCoach} = this.props;
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
                borderTopLeftRadius: Dimensions.r24,
                borderTopRightRadius: Dimensions.r24,
                minHeight: windowDimensions.height * 0.4,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: Dimensions.marginLarge,
                  justifyContent: 'space-between',
                  paddingHorizontal: Dimensions.screenMarginRegular,
                }}>
                <Text style={[textStyles.SubHeaderBold]}>
                  {'Select Cohort'}
                </Text>
                <TouchableOpacity onPress={this.hide}>
                  <Image source={require('../assets/images/cross-icon.png')} />
                </TouchableOpacity>
              </View>
              <ScrollView style={{flex: 1}}>
                <ProgramCohorts
                  program={program}
                  isUserProgram={isUserProgram}
                  isCoCoach={isCoCoach}
                  onSelect={cohort => {
                    this.hide();
                    onSelect(cohort);
                  }}
                  hideAddCohort
                />
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}
