import React from 'react';
import {View, Text, Platform} from 'react-native';
import BaseComponent from '../../components/BaseComponent';
import ThemeStyle from '../../styles/ThemeStyle';
import Header from '../../components/Header';
import CalendarStrip from 'react-native-calendar-strip';
import moment from 'moment';
import Dimensions from '../../styles/Dimensions';
import TextStyles, {fontFamily} from '../../styles/TextStyles';
import {appsyncClient} from '../../../App';
import {getSessionsCalendarView} from '../../queries/session';
import {getMonthRange} from '../../utils/DateTimeUtils';
import {showMessage} from 'react-native-flash-message';
import {errorMessage, getSessionTypeDetails} from '../../utils';
import {FlatList, TouchableOpacity} from 'react-native-gesture-handler';
import Card from '../../components/Card';
import {NoData} from '../../components/NoData';
import {Image} from 'react-native-animatable';
import {withStore} from '../../utils/StoreUtils';
import Loader from '../../components/Loader';
import {getProgramWithSchedules} from '../../queries/program';

class EventsScreen extends BaseComponent {
  constructor(props) {
    super(props);
    const cohortDetails = this.props.navigation.getParam('cohortDetails', {});
    this.state.selectedDate = moment();
    this.state.currentMonth = moment();
    this.state.loading = false;
    this.state.cohortDetails = cohortDetails;
  }

  componentDidMount() {
    this.fetchAppointments();
  }

  fetchAppointments() {
    const {currentMonth} = this.state;
    this.setState({loading: true});
    this.appointmentsQuery = appsyncClient
      .watchQuery({
        query: getSessionsCalendarView,
        variables: getMonthRange(currentMonth, 'fortnight'),
        fetchPolicy: 'network-only',
      })
      .subscribe({
        next: res => {
          this.setState({
            loading: false,
          });
          console.log('FETCHED APPOINTMENTS', res);
          if (res.loading && !res.data) {
            return;
          }
          if (res.data && res.data.getSessionsCalendarView) {
            this.appointmentsByDay = {};
            res.data.getSessionsCalendarView.forEach(element => {
              const date = element.date;
              this.appointmentsByDay[date] = [...element.sessions];
            });
            console.log('FILTERED APPOINTMENTS', this.appointmentsByDay);
            this.appointmentsQuery.unsubscribe();
            this.setState(prevState => {
              return {
                refreshList: !prevState.refreshList,
              };
            });
          }
        },
        error: err => {
          console.log(err);
          this.appointmentsQuery.unsubscribe();
          this.setState({
            loading: false,
          });
          showMessage(errorMessage());
        },
      });
  }

  navigateToSession = session => {
    const {setLoading, navigation} = this.props;
    setLoading(true);
    this.fullProgramQuery = appsyncClient
      .watchQuery({
        query: getProgramWithSchedules,
        fetchPolicy: 'cache-and-network',
        variables: {
          programId: session.programId,
        },
      })
      .subscribe({
        next: data => {
          console.log('PROGRAM DETAILS', data);
          if (data.loading && !data.data) {
            return;
          }
          setLoading(false);
          this.fullProgramQuery.unsubscribe();
          if (data.data.getProgramWithSchedules) {
            navigation.navigate('SessionDetails', {
              session,
              program: data.data.getProgramWithSchedules,
            });
          }
        },
        error: error => {
          setLoading(false);
          this.fullProgramQuery.unsubscribe();
          console.log('ERROR FETCHING PROGRAM DETAILS', error);
        },
      });
  };

  render() {
    const {selectedDate, refreshList, loading, cohortDetails} = this.state;

    const {navigation, user} = this.props;

    const appointments =
      this.appointmentsByDay &&
      this.appointmentsByDay[selectedDate.format('YYYY-MM-DD')];
    console.log('RENDER APPOINTMENTS', appointments);
    return this.renderWithSafeArea(
      <View style={ThemeStyle.pageContainer}>
        <Header
          title="Events"
          navBarStyle={{
            backgroundColor: ThemeStyle.foreground,
            elevation: 4,
          }}
        />
        <View
          style={{
            backgroundColor: ThemeStyle.foreground,
            borderBottomLeftRadius: Dimensions.r24,
            borderBottomRightRadius: Dimensions.r24,
            overflow: 'hidden',
            ...ThemeStyle.shadow(),
          }}>
          <Text
            style={[
              TextStyles.HeaderBold,
              {
                color: ThemeStyle.mainColor,
                paddingHorizontal: Dimensions.screenMarginRegular,
                paddingTop: Platform.OS === 'android' ? Dimensions.r16 : 0,
              },
            ]}>
            {selectedDate.format('MMM DD ')}
            <Text style={TextStyles.SubHeader2}>
              {selectedDate.format(' YYYY')}
            </Text>
          </Text>
          <CalendarStrip
            ref={ref => {
              this.calendarStrip = ref;
            }}
            calendarColor={ThemeStyle.foreground}
            showMonth={false}
            updateWeek
            selectedDate={selectedDate}
            weekStripAnimation={{type: 'parallel'}}
            calendarAnimation={{type: 'sequence', duration: 30}}
            daySelectionAnimation={{
              type: 'background',
              duration: 200,
              highlightColor: ThemeStyle.mainColor,
            }}
            highlightDateNumberStyle={{color: ThemeStyle.white}}
            highlightDateNameStyle={{color: ThemeStyle.white}}
            style={{
              height: Dimensions.r96,
              width: '100%',
            }}
            onWeekChanged={newDate => {
              console.log('CURRENT WEEK', newDate.toString());
              this.setState({
                currentMonth: moment(newDate),
                selectedDate: moment(newDate),
              });
              this.fetchAppointments();
            }}
            onDateSelected={selectedDate => {
              this.setState({
                selectedDate: moment(selectedDate),
              });
            }}
          />
        </View>
        {loading ? (
          <Loader />
        ) : appointments && appointments.length ? (
          <FlatList
            contentContainerStyle={{
              paddingVertical: Dimensions.r24,
            }}
            data={appointments}
            renderItem={({item}) => (
              <Card
                cardRadius={Dimensions.r20}
                style={{
                  marginVertical: Dimensions.r8,
                  marginHorizontal: Dimensions.screenMarginRegular,
                }}>
                <TouchableOpacity
                  onPress={() => {
                    this.navigateToSession(item);
                  }}
                  style={{
                    paddingVertical: Dimensions.marginRegular,
                    marginLeft: Dimensions.marginRegular,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      // alignItems: 'center',
                      justifycontent: 'center',
                    }}>
                    <Image
                      style={{
                        width: Dimensions.r72,
                        height: Dimensions.r72,
                        alignself: 'center',

                        // ([TextStyles.GeneralText],

                        color: ThemeStyle.white,
                        borderRadius: Dimensions.r72,
                        paddingVertical: Dimensions.marginSmall,
                        // paddingHorizontal: Dimensions.marginLarge,
                        backgroundColor: ThemeStyle.mainColor,
                      }}
                      source={getSessionTypeDetails(item.type).image}
                    />
                    {/* {item.module} */}

                    {/* <Image
                      style={{
                        width: Dimensions.r28,
                        height: Dimensions.r24,
                        marginLeft: Dimensions.marginLarge,
                      }}
                      source={getSessionTypeDetails(item.type).image}
                    /> */}
                    <View
                      style={{
                        flexDirection: 'column',

                        justifyContent: 'center',
                        marginLeft: Dimensions.marginExtraLarge,
                      }}>
                      <Text
                        style={{
                          ...TextStyles.SubHeaderBold,
                        }}>
                        {item.name}
                      </Text>
                      <Text style={[TextStyles.SubHeader]}>
                        DBT for Anxiety
                      </Text>
                    </View>
                    <View
                      style={{
                        justifyContent: 'center',
                        alignItems: 'flex-end',

                        marginRight: Dimensions.marginExtraLarge,
                        flex: 1,
                      }}>
                      <Text
                        style={{
                          ...TextStyles.SubHeader2,
                          color: ThemeStyle.orange,
                        }}>
                        {moment(item.startDate).format('LT')}
                      </Text>
                      {/* condition for task done / date</Text> */}
                    </View>
                  </View>

                  {/* <Text style={TextStyles.ContentText}>{`${moment(
                      item.startDate,
                    ).format('hh:mm A')}`}</Text> */}
                  {/* <View
                    style={{
                      position: 'absolute',
                      top: Dimensions.marginExtraLarge,
                      right: Dimensions.marginExtraLarge,
                      backgroundColor: ThemeStyle.green,
                      borderRadius: Dimensions.r12,
                      paddingVertical: Dimensions.marginExtraSmall,
                      paddingHorizontal: Dimensions.marginLarge,
                    }}>
                    <Text
                      style={[
                        TextStyles.GeneralTextBold,
                        {color: ThemeStyle.white},
                      ]}>
                      {item.coachId === user.userId ? 'Created' : 'Joined'}
                    </Text>
                  </View> */}
                  {/* <Image
                    source={require('../../assets/images/arrow-icon.png')}
                    style={{
                      position: 'absolute',
                      bottom: Dimensions.r40,
                      right: Dimensions.marginExtraLarge,
                      tintColor: ThemeStyle.disabledLight,
                      transform: [{rotate: '180deg'}],
                    }}
                  /> */}
                </TouchableOpacity>
              </Card>
            )}
            extraData={refreshList}
          />
        ) : (
          <NoData message="You don't have any sessions scheduled for today" />
        )}
      </View>,
    );
  }
}

export default withStore(EventsScreen);
