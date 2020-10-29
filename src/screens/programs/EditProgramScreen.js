import React from 'react';
import {View} from 'react-native';
import BaseComponent from '../../components/BaseComponent';
import ThemeStyle from '../../styles/ThemeStyle';
import Header from '../../components/Header';
import LinearGradient from 'react-native-linear-gradient';
import Dimensions from '../../styles/Dimensions';
import CustomButton from '../../components/Button';
import {withStore} from '../../utils/StoreUtils';
import {s3ProtectionLevel, programGradients} from '../../constants';
import StepIndicator from 'react-native-step-indicator';
import S3Image from '../../components/S3Image';
import ProgramNameInput from './ProgramNameInput';
import {ScrollView} from 'react-native-gesture-handler';
import ProgramOverviewScreen from './ProgramOverviewScreen';
import PaymentScreen from './PaymentScreen';
import {resetToProgramDetails} from '../../navigators/actions';
import {createProgram} from '../../redux/actions/CreateProgramActions';

const stepSelectedColor = '#fff';
const stepUnselectedColor = '#bbba';

const stepIndicatorStyles = {
  stepIndicatorSize: Dimensions.r12,
  currentStepIndicatorSize: Dimensions.r14,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: stepSelectedColor,
  stepStrokeWidth: 3,
  stepStrokeFinishedColor: stepSelectedColor,
  stepStrokeUnFinishedColor: stepUnselectedColor,
  separatorFinishedColor: stepSelectedColor,
  separatorUnFinishedColor: stepUnselectedColor,
  stepIndicatorFinishedColor: stepSelectedColor,
  stepIndicatorUnFinishedColor: stepUnselectedColor,
  stepIndicatorCurrentColor: stepSelectedColor,
  stepIndicatorLabelFontSize: 13,
  currentStepIndicatorLabelFontSize: 13,
  stepIndicatorLabelCurrentColor: stepSelectedColor,
  stepIndicatorLabelFinishedColor: stepSelectedColor,
  stepIndicatorLabelUnFinishedColor: stepUnselectedColor,
  labelColor: stepUnselectedColor,
  labelSize: Dimensions.r12,
  currentStepLabelColor: stepSelectedColor,
};

const stepLabels = ['Name', 'Details', 'Payment', 'Confirm'];

class CreateProgramScreen extends BaseComponent {
  constructor(props) {
    super(props);
    this.state.program = {
      gradient: Object.values(programGradients)[
        Math.floor(Math.random() * Object.keys(programGradients).length)
      ],
    };
    this.state.currentPage = 0;
  }

  onContinue = program => {
    const {currentPage} = this.state;
    const {setLoading, createProgram, navigation} = this.props;
    if (currentPage === 3) {
      setLoading(true);
      createProgram(
        program,
        data => {
          setLoading(false);
          program.id = data.id;
          navigation.dispatch(resetToProgramDetails(program));
        },
        () => {
          setLoading(false);
        },
      );
    } else {
      this.setState({
        program,
        currentPage: currentPage + 1,
      });
    }
  };

  onBack = () => {
    const {currentPage} = this.state;
    const {navigation} = this.props;
    if (currentPage === 0) {
      navigation.pop();
    } else {
      this.setState({
        currentPage: currentPage - 1,
      });
    }
  };

  renderPageContent = () => {
    const {currentPage, program} = this.state;
    const {user, setLoading, navigation} = this.props;
    const commonProps = {
      ref: ref => {
        this.currentScreen = ref;
      },
      onContinue: this.onContinue,
      user,
      setLoading,
      navigation,
      program,
    };
    switch (currentPage) {
      case 0:
        return (
          <ProgramNameInput
            onUpdateImage={image => {
              program.image = image;
              this.setState({
                program,
              });
            }}
            {...commonProps}
          />
        );
      case 1:
        return <ProgramOverviewScreen {...commonProps} editable />;
      case 2:
        return <PaymentScreen {...commonProps} />;
      case 3:
        return (
          <ProgramOverviewScreen {...commonProps} isFullView editable={false} />
        );
    }
  };

  render() {
    console.log('safe area', Dimensions.safeAreaPaddingTop);
    const {program, currentPage} = this.state;
    return (
      <View
        style={[
          ThemeStyle.pageContainer,
          {
            paddingTop: Dimensions.safeAreaPaddingTop,
            marginBottom: Dimensions.safeAreaPaddingBottom,
          },
        ]}>
        <View
          style={{
            height: 250,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}>
          {program.image ? (
            <S3Image
              filePath={program.image}
              level={s3ProtectionLevel.PUBLIC}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#000',
              }}
              resizeMode="cover">
              <View
                style={{
                  width: '100%',
                  height: '1000%',
                  backgroundColor: '#0008',
                }}
              />
            </S3Image>
          ) : (
            <LinearGradient
              colors={program.gradient}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          )}
          <Header
            title="Create Program"
            goBack={this.onBack}
            isLightContent
            navBarStyle={{
              backgroundColor: 'transparent',
              marginTop: Dimensions.safeAreaPaddingTop,
            }}
          />
          <View style={{marginVertical: Dimensions.r28}}>
            <StepIndicator
              customStyles={stepIndicatorStyles}
              currentPosition={currentPage}
              labels={stepLabels}
              stepCount={stepLabels.length}
            />
          </View>
        </View>
        <View
          key={stepLabels[currentPage]}
          style={{
            marginTop: 180,
            backgroundColor: ThemeStyle.backgroundColor,
            borderTopLeftRadius: Dimensions.r24,
            borderTopRightRadius: Dimensions.r24,
            overflow: currentPage === 0 ? 'visible' : 'hidden',
            flex: 1,
          }}>
          <ScrollView
            style={{overflow: 'visible'}}
            contentContainerStyle={{paddingBottom: Dimensions.r96}}
            bounces={currentPage === 0 ? false : true}>
            {this.renderPageContent()}
          </ScrollView>
        </View>
        <CustomButton
          name="Continue"
          style={{
            position: 'absolute',
            bottom: Dimensions.r12,
            left: Dimensions.screenMarginWide,
            right: Dimensions.screenMarginWide,
          }}
          onPress={() => {
            this.currentScreen.onContinue();
          }}
        />
      </View>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  createProgram: (program, onSuccess, onFail) =>
    dispatch(createProgram(program, onSuccess, onFail)),
});

export default withStore(CreateProgramScreen, undefined, mapDispatchToProps);
