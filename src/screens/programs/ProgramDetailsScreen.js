import React from 'react';
import {View, ScrollView, Image, Text, TouchableOpacity} from 'react-native';
import BaseComponent from '../../components/BaseComponent';
import ThemeStyle from '../../styles/ThemeStyle';
import Header from '../../components/Header';
import Dimensions from '../../styles/Dimensions';
import TextStyles from '../../styles/TextStyles';
import CustomButton from '../../components/Button';
import {appsyncClient} from '../../../App';
import {getProgramWithSchedules} from '../../queries/program';
import {joinCohort} from '../../queries/cohort';
import {withStore} from '../../utils/StoreUtils';
import {errorMessage} from '../../utils';
import JoinProgramModal from '../../modals/JoinProgramModal';
import AddPaymentModal from '../../modals/AddPaymentModal';
import {showMessage} from 'react-native-flash-message';
import {programStatus} from '../../constants';
import ProgramImageBackground from '../../components/ProgramImageBackground';
import ProgramItemDetail from './ProgramItemDetail';
import ProgramContent from './programDetails/ProgramContent';
import ProgramMenuModal from '../../modals/ProgramMenuModal';
import ProgramCohorts from './programDetails/ProgramCohorts';
import AddCohortModal from '../../modals/AddCohortModal';
import ProgramCohortsModal from '../../modals/ProgramCohortsModal';
import ProgramJoinRequests from './programDetails/ProgramJoinRequests';
import ProgramMarketing from './programDetails/ProgramMarketing';

class ProgramDetailsScreen extends BaseComponent {
  constructor(props) {
    super(props);
    this.state.topSafeArea = ThemeStyle.foreground;
    this.state.program = props.navigation.getParam('program', {});
    this.state.selectedTab = props.navigation.getParam(
      'selectedTab',
      'Content',
    );
    this.tabs = [];
  }

  componentDidMount() {
    this.fetchFullProgram();
  }

  componentWillUnmount() {
    if (this.fullProgramQuery) {
      this.fullProgramQuery.unsubscribe();
    }
  }

  fetchFullProgram = () => {
    const {program} = this.state;
    const {setLoading, user, navigation} = this.props;
    setLoading(true);
    this.fullProgramQuery = appsyncClient
      .watchQuery({
        query: getProgramWithSchedules,
        fetchPolicy: 'cache-and-network',
        variables: {
          programId: program.id,
        },
      })
      .subscribe({
        next: data => {
          console.log('PROGRAM DETAILS', data);
          if (data.loading && !data.data) {
            return;
          }
          setLoading(false);
          const programData = data.data.getProgramWithSchedules;
          if (programData) {
            let joinedCohort = null;
            let joinedCohortCount = 0;
            const isUserProgram = user.userId === programData.coachId;
            const isCoCoach = programData.coCoach
              .map(coCoach => coCoach.userId)
              .includes(user.userId);
            this.tabs =
              isUserProgram || isCoCoach
                ? ['Cohorts', 'Content', 'Join Requests', 'Marketing']
                : ['Cohorts', 'Content'];
            if (!isUserProgram && !isCoCoach) {
              if (programData.cohorts) {
                programData.cohorts.forEach(cohort => {
                  if (cohort.canViewDetails) {
                    joinedCohort = cohort;
                    joinedCohortCount++;
                  }
                });
              }
            }
            if (joinedCohort && joinedCohortCount === 1) {
              navigation.replace('CohortDetails', {
                program: programData,
                cohort: joinedCohort,
              });
            } else {
              this.setState({
                program: programData,
                isUserProgram,
                isCoCoach,
              });
            }
          }
        },
        error: error => {
          setLoading(false);
          console.log('ERROR FETCHING PROGRAM DETAILS', error);
        },
      });
  };

  handleJoin = (program, cohort, tokenId) => {
    const input = {
      coachId: program.coachId,
      cohortId: cohort.id,
    };
    if (tokenId) {
      input.token = tokenId;
    }
    console.log('INPUT', input);
    this.joinModal.hide();
    this.joinCohort(input);
  };

  joinCohort = input => {
    const {setLoading} = this.props;
    setLoading(true);
    appsyncClient
      .mutate({
        mutation: joinCohort,
        variables: {
          input,
        },
        refetchQueries: ['getProgramWithSchedules'],
      })
      .then(data => {
        console.log('JOINED PROGRAM', data);
        setLoading(false);
        if (data.data && data.data.joinCohort && data.data.joinCohort.success) {
          showMessage({
            type: 'success',
            message: data.data.joinCohort.message,
          });
        } else {
          showMessage(errorMessage(data.data.joinCohort.message));
        }
      })
      .catch(err => {
        console.log('ERROR IN JOINING PROGRAM', err);
        setLoading(false);
        showMessage(errorMessage('Failed to join. Please try again'));
      });
  };

  renderTabItem = tab => {
    const {selectedTab} = this.state;
    const isSelected = selectedTab === tab;
    return (
      <TouchableOpacity
        onPress={() => {
          this.setState({
            selectedTab: tab,
          });
        }}
        style={{
          flex: 1,
          alignItems: 'center',
          paddingHorizontal: Dimensions.marginLarge,
          paddingTop: Dimensions.marginLarge,
        }}>
        <Text
          style={{
            ...TextStyles.GeneralTextBold,
            color: isSelected ? ThemeStyle.mainColor : ThemeStyle.textRegular,
          }}>
          {tab}
        </Text>
        {isSelected && (
          <View
            style={{
              width: '100%',
              height: Dimensions.r4,
              borderRadius: Dimensions.r2,
              backgroundColor: ThemeStyle.mainColor,
              marginTop: Dimensions.marginRegular,
            }}
          />
        )}
      </TouchableOpacity>
    );
  };

  renderTabContent = () => {
    const {selectedTab, program, isUserProgram, isCoCoach} = this.state;
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
      isUserProgram,
      isCoCoach,
    };
    switch (selectedTab) {
      case 'Cohorts':
        return (
          <ProgramCohorts
            {...commonProps}
            onAddCohort={() => {
              this.addCohortModal.show({});
            }}
            onJoinCohort={cohort => {
              this.joinModal.show(program, cohort);
            }}
          />
        );
      case 'Content':
        return <ProgramContent {...commonProps} />;
      case 'Join Requests':
        return <ProgramJoinRequests {...commonProps} />;
      case 'Marketing':
        return <ProgramMarketing {...commonProps} />;
    }
  };

  render() {
    const {navigation, setLoading} = this.props;
    const {program, isUserProgram, isCoCoach} = this.state;
    return (
      <View
        style={[
          ThemeStyle.pageContainer,
          {marginBottom: Dimensions.safeAreaPaddingBottom},
        ]}>
        <ScrollView contentContainerStyle={{paddingBottom: Dimensions.r96}}>
          <View
            style={{
              width: '100%',
              overflow: 'hidden',
              borderBottomLeftRadius: Dimensions.r24,
              borderBottomRightRadius: Dimensions.r24,
              paddingVertical: Dimensions.r24,
              paddingHorizontal: Dimensions.screenMarginRegular,
            }}>
            <ProgramImageBackground program={program} />
            <ProgramItemDetail
              program={program}
              index={0}
              fullDisplay
              style={{
                marginTop: Dimensions.safeAreaPaddingTop + Dimensions.r24,
              }}
              renderOptions={() =>
                program.status === programStatus.PUBLISHED ? (
                  <CustomButton
                    onPress={() => {
                      this.programCohortsModal.show({});
                    }}
                    name={
                      isUserProgram || isCoCoach
                        ? '+ Invite'
                        : program.canViewDetails
                        ? 'Joined'
                        : 'Join'
                    }
                    noGradient
                    style={{
                      backgroundColor: ThemeStyle.green,
                      borderRadius: Dimensions.r8,
                    }}
                  />
                ) : null
              }
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{
              backgroundColor: ThemeStyle.foreground,
              marginVertical: Dimensions.marginLarge,
            }}>
            {this.tabs.map(tab => this.renderTabItem(tab))}
          </ScrollView>
          {this.renderTabContent()}
        </ScrollView>
        <Header
          title=""
          goBack={() => {
            navigation.pop();
          }}
          navBarStyle={{
            backgroundColor: 'transparent',
            position: 'absolute',
            top: Dimensions.safeAreaPaddingTop,
            left: 0,
            right: 0,
          }}
          isLightContent
          rightIcon={() =>
            isUserProgram || isCoCoach ? (
              <Image
                source={require('../../assets/images/dots-icon.png')}
                style={{tintColor: ThemeStyle.white}}
              />
            ) : null
          }
          onRightIconClick={() => {
            if (!isUserProgram && !isCoCoach) {
              return null;
            }
            this.programMenu.show();
          }}
        />
        {program.status === programStatus.DRAFT && isUserProgram && (
          <CustomButton
            style={{
              position: 'absolute',
              left: Dimensions.screenMarginRegular,
              bottom: 0,
              right: Dimensions.screenMarginRegular,
            }}
            name="Publish"
            onPress={() => this.addCohortModal.show({isPublish: true})}
          />
        )}
        <JoinProgramModal
          ref={ref => {
            this.joinModal = ref;
          }}
          onJoin={this.handleJoin}
        />
        <AddPaymentModal
          ref={ref => {
            this.addPaymentModal = ref;
          }}
          navigation={navigation}
        />
        <ProgramMenuModal
          ref={ref => {
            this.programMenu = ref;
          }}
          navigation={navigation}
          program={program}
          setLoading={setLoading}
          isUserProgram={isUserProgram}
        />
        <AddCohortModal
          ref={ref => {
            this.addCohortModal = ref;
          }}
          navigation={navigation}
          program={program}
          setLoading={setLoading}
        />
        <ProgramCohortsModal
          ref={ref => {
            this.programCohortsModal = ref;
          }}
          navigation={navigation}
          program={program}
          setLoading={setLoading}
          onSelect={cohort => {
            if (isUserProgram || isCoCoach) {
              navigation.navigate('InviteUser', {
                program: cohort,
              });
            } else {
              this.joinModal.show(program, cohort);
            }
          }}
        />
      </View>
    );
  }
}

export default withStore(ProgramDetailsScreen);
