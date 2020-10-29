import React from 'react';
import {TouchableOpacity, View, Text, ScrollView} from 'react-native';
import Dimensions, {windowDimensions} from '../../../styles/Dimensions';
import ThemeStyle from '../../../styles/ThemeStyle';
import TextStyles from '../../../styles/TextStyles';
import {
  getProgramContent,
  groupSessionsByDate,
  errorMessage,
} from '../../../utils';
import moment from 'moment';
import ProgramImageBackground from '../../../components/ProgramImageBackground';
import {NoData} from '../../../components/NoData';
import SessionItem from '../../../components/SessionItem';
import Icon from '../../../components/Icon';
import ConfirmationModal from '../../../modals/ConfirmationModal';
import {appsyncClient} from '../../../../App';
import {deleteProgramModules} from '../../../queries/program';
import {showMessage} from 'react-native-flash-message';

export default class ProgramContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTab: 'Tasks',
      program: props.program,
      isCohort: props.isCohort,
      isUserProgram: props.isUserProgram,
      isCoCoach: props.isCoCoach,
      modules: [],
      tasks: [],
      selectedModuleIndex: 0,
    };
  }

  static getDerivedStateFromProps(props, state) {
    return {
      program: props.program,
      isCohort: props.isCohort,
      ...getProgramContent(props.program.sessions, props.isCohort),
      refreshList: !state.refreshList,
      isUserProgram: props.isUserProgram,
      isCoCoach: props.isCoCoach,
    };
  }

  deleteModule = module => {
    const {program} = this.state;
    const {setLoading} = this.props;
    setLoading(true);
    appsyncClient
      .mutate({
        mutation: deleteProgramModules,
        variables: {
          programId: program.id,
          moduleId: module.id,
        },
        refetchQueries: ['getProgramWithSchedules'],
      })
      .then(data => {
        console.log('DELETED PROGRAM MODULE', data);
        setLoading(false);
        if (
          data.data &&
          data.data.deleteProgramModules &&
          data.data.deleteProgramModules.success
        ) {
          showMessage({
            type: 'success',
            message:
              data.data.deleteProgramModules.message ||
              'Successfully deleted module',
          });
        } else {
          showMessage(errorMessage(data.data.deleteProgramModules.message));
        }
      })
      .catch(err => {
        console.log('ERROR IN DELETING PROGRAM MODULE', err);
        setLoading(false);
        showMessage(errorMessage('Failed to delete module. Please try again'));
      });
  };

  renderTabItem = (tab, borderStyle) => {
    const {selectedTab} = this.state;
    const isSelected = selectedTab === tab;
    return (
      <TouchableOpacity
        onPress={() => {
          this.setState({selectedTab: tab});
        }}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: Dimensions.marginRegular,
          backgroundColor: isSelected
            ? ThemeStyle.mainColor
            : ThemeStyle.divider,
          ...borderStyle,
        }}>
        <Text
          style={[
            TextStyles.GeneralTextBold,
            {color: isSelected ? ThemeStyle.white : ThemeStyle.textLight},
          ]}>
          {tab}
        </Text>
      </TouchableOpacity>
    );
  };

  renderDateGroup = dateGroup => {
    const {isCohort, program} = this.state;
    const {navigation, isUserProgram, isCoCoach} = this.props;
    return (
      <View
        key={dateGroup.dateKey}
        style={{
          backgroundColor: ThemeStyle.divider,
          marginHorizontal: Dimensions.screenMarginRegular,
          paddingHorizontal: Dimensions.marginLarge,
          paddingVertical: Dimensions.marginExtraLarge,
          marginTop: Dimensions.marginExtraLarge,
          borderRadius: Dimensions.r4,
          overflow: 'hidden',
        }}>
        <Text
          style={[
            TextStyles.SubHeader2,
            {
              color: ThemeStyle.mainColor,
              marginHorizontal: Dimensions.marginLarge,
            },
          ]}>
          {isCohort
            ? moment(dateGroup.dateValue).format('DD MMM YYYY')
            : `DAY ${dateGroup.dateValue}`}
        </Text>
        {dateGroup.sessions.map((item, index) => (
          <SessionItem
            session={item}
            index={index}
            onPress={() => {
              if (isUserProgram || isCoCoach || item.canViewDetails) {
                navigation.navigate('SessionDetails', {
                  session: item,
                  program,
                  isCohortSession: isCohort,
                });
              }
            }}
          />
        ))}
      </View>
    );
  };

  renderSessions = () => {
    const {modules, selectedModuleIndex, isCohort} = this.state;
    if (!modules || !modules.length) {
      return (
        <NoData
          style={{marginTop: Dimensions.r64}}
          message="No sessions added"
        />
      );
    }
    const currentModule = modules[selectedModuleIndex];

    return (
      <View style={{marginVertical: Dimensions.marginLarge}}>
        <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          horizontal
          contentContainerStyle={{
            paddingHorizontal: Dimensions.screenMarginRegular,
          }}>
          {modules.map((module, index) => {
            const isSelected = index === selectedModuleIndex;
            return (
              <TouchableOpacity
                onPress={() => {
                  this.setState({selectedModuleIndex: index});
                }}
                style={{
                  width: windowDimensions.width / 2,
                  height: windowDimensions.width / 4,
                  justifyContent: 'flex-end',
                  borderRadius: Dimensions.r8,
                  borderWidth: isSelected ? Dimensions.r2 : 0,
                  borderColor: ThemeStyle.mainColor,
                  overflow: 'hidden',
                  padding: Dimensions.marginRegular,
                  marginRight: Dimensions.marginRegular,
                }}>
                <ProgramImageBackground program={module} />
                <Text
                  style={[
                    TextStyles.GeneralText,
                    {color: ThemeStyle.textExtraLight},
                  ]}>{`${module.sessions.length} Sessions`}</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={[
                      TextStyles.GeneralTextBold,
                      {
                        color: ThemeStyle.white,
                        marginTop: Dimensions.marginExtraSmall,
                      },
                    ]}>
                    {module.name}
                  </Text>
                  {!isCohort && (
                    <TouchableOpacity
                      onPress={() => {
                        this.confirmationModal.show({
                          message: `Are you sure you want to delete the module ${
                            module.name
                          }?`,
                          onConfirm: () => {
                            this.deleteModule(module);
                          },
                        });
                      }}>
                      <Icon
                        size={Dimensions.r24}
                        color={ThemeStyle.red}
                        fontFamily="Ionicons"
                        name="ios-trash"
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {currentModule.sessions && currentModule.sessions.length ? (
          groupSessionsByDate(currentModule.sessions, isCohort).map(
            this.renderDateGroup,
          )
        ) : (
          <NoData
            style={{marginTop: Dimensions.r64}}
            message="No sessions added"
          />
        )}
      </View>
    );
  };

  renderTasks = () => {
    const {tasks, isCohort} = this.state;
    return tasks && tasks.length ? (
      groupSessionsByDate(tasks, isCohort).map(this.renderDateGroup)
    ) : (
      <NoData style={{marginTop: Dimensions.r64}} message="No tasks added" />
    );
  };

  render() {
    const {navigation} = this.props;
    const {
      program,
      selectedTab,
      isUserProgram,
      isCoCoach,
      isCohort,
    } = this.state;
    return (
      <View>
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: Dimensions.screenMarginRegular,
          }}>
          {this.renderTabItem('Tasks', {
            borderBottomLeftRadius: Dimensions.r8,
            borderTopLeftRadius: Dimensions.r8,
          })}
          {this.renderTabItem('Sessions', {
            borderTopRightRadius: Dimensions.r8,
            borderBottomRightRadius: Dimensions.r8,
          })}
        </View>
        {selectedTab === 'Tasks' ? this.renderTasks() : this.renderSessions()}
        {(isUserProgram || isCoCoach) && (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('NewSession', {
                program,
                isTask: selectedTab === 'Tasks',
                isCohortSchedule: isCohort,
              });
            }}
            style={{
              backgroundColor: ThemeStyle.green,
              borderRadius: Dimensions.r8,
              position: 'absolute',
              top: Dimensions.r48,
              right: Dimensions.screenMarginWide,
              paddingHorizontal: Dimensions.r12,
              paddingVertical: Dimensions.r10,
            }}>
            <Text
              style={[TextStyles.GeneralTextBold, {color: ThemeStyle.white}]}>
              ADD
            </Text>
          </TouchableOpacity>
        )}
        <ConfirmationModal
          ref={ref => {
            this.confirmationModal = ref;
          }}
        />
      </View>
    );
  }
}
