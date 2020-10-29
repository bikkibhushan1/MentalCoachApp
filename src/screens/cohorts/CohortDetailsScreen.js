import React from 'react';
import {View, ScrollView, Image, Text, TouchableOpacity} from 'react-native';
import BaseComponent from '../../components/BaseComponent';
import ThemeStyle from '../../styles/ThemeStyle';
import Header from '../../components/Header';
import Dimensions from '../../styles/Dimensions';
import TextStyles from '../../styles/TextStyles';
import CustomButton from '../../components/Button';
import {appsyncClient} from '../../../App';
import {joinProgram} from '../../queries/program';
import {withStore} from '../../utils/StoreUtils';
import {errorMessage, getCohortDates} from '../../utils';
import JoinProgramModal from '../../modals/JoinProgramModal';
import AddPaymentModal from '../../modals/AddPaymentModal';
import {showMessage} from 'react-native-flash-message';
import ProgramImageBackground from '../../components/ProgramImageBackground';
import ProgramItemDetail from '../programs/ProgramItemDetail';
import ProgramContent from '../programs/programDetails/ProgramContent';
import ProgramMenuModal from '../../modals/ProgramMenuModal';
import {getCohort} from '../../queries/cohort';
import CohortMembers from './CohortMembers';

class CohortDetailsScreen extends BaseComponent {
  constructor(props) {
    super(props);
    this.state.topSafeArea = ThemeStyle.foreground;
    this.state.cohort = props.navigation.getParam('cohort', {});
    this.state.selectedTab = props.navigation.getParam(
      'selectedTab',
      'Members',
    );
    this.tabs = [];
  }

  componentDidMount() {
    this.fetchCohort();
  }

  componentWillUnmount() {
    if (this.cohortQuery) {
      this.cohortQuery.unsubscribe();
    }
  }

  fetchCohort = () => {
    const {cohort} = this.state;
    const {setLoading, user} = this.props;
    setLoading(true);
    this.cohortQuery = appsyncClient
      .watchQuery({
        query: getCohort,
        fetchPolicy: 'cache-and-network',
        variables: {
          cohortId: cohort.id,
        },
      })
      .subscribe({
        next: data => {
          console.log('COHORT DETAILS', data);
          if (data.loading && !data.data) {
            return;
          }
          setLoading(false);
          if (data.data.getCohort) {
            const cohort = data.data.getCohort;
            const isUserProgram = user.userId === cohort.coachId;
            const isCoCoach =
              cohort.coCoach &&
              cohort.coCoach
                .map(coCoach => coCoach.userId)
                .includes(user.userId);
            this.tabs = ['Members', 'Content'];
            this.setState({
              cohort,
              isUserProgram,
              isCoCoach,
            });
          }
        },
        error: error => {
          setLoading(false);
          showMessage(
            errorMessage(
              'Failed to fetch cohort details. Please check your internet connection and try again',
            ),
          );
          console.log('ERROR FETCHING COHORT DETAILS', error);
        },
      });
  };

  handleJoin = (program, module, tokenId) => {
    const input = {
      coachId: program.coachId,
      programId: program.id,
    };
    if (module) {
      input.moduleId = module.id;
    }
    if (tokenId) {
      input.token = tokenId;
    }
    console.log('INPUT', input);
    this.joinModal.hide();
    this.joinProgram(input);
  };

  joinProgram = input => {
    const {setLoading} = this.props;
    setLoading(true);
    appsyncClient
      .mutate({
        mutation: joinProgram,
        variables: {
          input,
        },
      })
      .then(data => {
        console.log('JOINED PROGRAM', data);
        setLoading(false);
        if (
          data.data &&
          data.data.joinProgram &&
          data.data.joinProgram.success
        ) {
          this.fetchFullProgram();
          showMessage({
            type: 'success',
            message: 'Joined successfully. You can now view the details.',
          });
        } else {
          showMessage(errorMessage('Failed to join. Please try again'));
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
    const {selectedTab, cohort, isUserProgram, isCoCoach} = this.state;
    const {user, setLoading, navigation} = this.props;
    const commonProps = {
      ref: ref => {
        this.currentScreen = ref;
      },
      onContinue: this.onContinue,
      user,
      setLoading,
      navigation,
      program: cohort,
      isUserProgram,
      isCoCoach,
      isCohort: true,
    };
    switch (selectedTab) {
      case 'Content':
        return <ProgramContent {...commonProps} />;
      case 'Members':
        return <CohortMembers {...commonProps} />;
    }
  };

  render() {
    const {navigation, setLoading} = this.props;
    const {cohort, isUserProgram, isCoCoach} = this.state;
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
            <ProgramImageBackground program={cohort} />
            <ProgramItemDetail
              program={cohort}
              isCohort
              index={0}
              fullDisplay
              style={{
                marginTop: Dimensions.safeAreaPaddingTop + Dimensions.r24,
              }}
              renderOptions={() => (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  {(isUserProgram || isCoCoach || cohort.canViewDetails) && (
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate('Chat', {
                          channel: {
                            channelId: cohort.channelId,
                            displayName: cohort.name,
                          },
                          description: getCohortDates(cohort),
                        });
                      }}
                      style={{
                        marginRight: Dimensions.marginRegular,
                      }}>
                      <Image
                        source={require('../../assets/images/messages-icon.png')}
                        style={{
                          width: Dimensions.r20,
                          height: Dimensions.r20,
                          tintColor: ThemeStyle.white,
                        }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  )}
                  {(isUserProgram || isCoCoach || cohort.canViewDetails) && (
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate('EventsScreen', {
                          // channel: {
                          //   channelId: cohort.channelId,
                          //   displayName: cohort.name,
                          // },
                          // description: getCohortDates(cohort),
                          cohortDetails: {
                            cohortId: cohort.id,
                          },
                        });
                      }}
                      style={{
                        marginRight: Dimensions.marginRegular,
                      }}>
                      <Image
                        source={require('../../assets/images/Calender-icon.png')}
                        style={{
                          width: Dimensions.r20,
                          height: Dimensions.r20,
                          tintColor: ThemeStyle.white,
                        }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  )}
                  <CustomButton
                    onPress={() => {
                      if (isUserProgram || isCoCoach) {
                        navigation.navigate('InviteUser', {
                          program: cohort,
                        });
                      } else {
                        if (!cohort.canViewDetails) {
                          if (cohort.joinedMembers < cohort.programSize) {
                            this.joinModal.show(cohort);
                          } else {
                            showMessage(
                              errorMessage('Sorry, this program is full.'),
                            );
                          }
                        }
                      }
                    }}
                    name={
                      isUserProgram || isCoCoach
                        ? '+ Invite'
                        : cohort.canViewDetails
                        ? 'Joined'
                        : 'Join'
                    }
                    noGradient
                    style={{
                      backgroundColor: ThemeStyle.green,
                      borderRadius: Dimensions.r8,
                    }}
                  />
                </View>
              )}
            />
          </View>
          <View
            style={{
              backgroundColor: ThemeStyle.foreground,
              marginVertical: Dimensions.marginLarge,
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
            {this.tabs.map(tab => this.renderTabItem(tab))}
          </View>
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
          program={cohort}
          setLoading={setLoading}
          isCohort
          isUserProgram={isUserProgram}
        />
      </View>
    );
  }
}

export default withStore(CohortDetailsScreen);
