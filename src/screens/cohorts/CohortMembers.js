import React from 'react';
import {TouchableOpacity, View, Text} from 'react-native';
import Dimensions from '../../styles/Dimensions';
import ThemeStyle from '../../styles/ThemeStyle';
import TextStyles from '../../styles/TextStyles';
import {appsyncClient} from '../../../App';
import {NoData} from '../../components/NoData';
import {s3ProtectionLevel} from '../../constants';
import S3Image from '../../components/S3Image';
import {
  approveCohortJoinRequest,
  rejectCohortJoinRequest,
} from '../../queries/cohort';
import {showMessage} from 'react-native-flash-message';
import {errorMessage} from '../../utils';
import {getCohortClients} from '../../queries/cohort';

export default class CohortMembers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      program: props.program,
      isUserProgram: props.isUserProgram,
      isCoCoach: props.isCoCoach,
      joinRequests: [],
    };
  }

  static getDerivedStateFromProps(props, state) {
    return {
      program: props.program,
      isUserProgram: props.isUserProgram,
      isCoCoach: props.isCoCoach,
    };
  }

  componentDidMount() {
    this.fetchMembers();
  }

  componentWillUnmount() {
    if (this.joinedMembersQuery) {
      this.joinedMembersQuery.unsubscribe();
    }
  }

  fetchMembers = () => {
    const {program} = this.state;
    const {setLoading} = this.props;
    setLoading(true);
    console.log('FETCHING COHORT MEMBERS', program.id);
    this.joinedMembersQuery = appsyncClient
      .watchQuery({
        query: getCohortClients,
        fetchPolicy: 'cache-and-network',
        variables: {
          cohortId: program.id,
        },
      })
      .subscribe({
        next: data => {
          console.log('COHORT MEMBERS', data);
          if (data.loading && !data.data) {
            return;
          }
          const members = data.data.getCohortClients;
          setLoading(false);
          this.setState({
            members,
          });
        },
        error: error => {
          setLoading(false);
          console.log('ERROR FETCHING COHORT MEMBERS', error);
        },
      });
  };

  onRequestAction = (joinRequest, isAcceptType) => {
    const {setLoading} = this.props;
    setLoading(true);
    let mutation;
    let key;
    if (isAcceptType) {
      key = 'approveCohortJoinRequest';
      mutation = approveCohortJoinRequest;
    } else {
      key = 'rejectCohortJoinRequest';
      mutation = rejectCohortJoinRequest;
    }
    appsyncClient
      .mutate({
        mutation: mutation,
        variables: {
          cohortId: joinRequest.cohortId,
          userId: joinRequest.userId,
        },
        refetchQueries: ['getProgramJoinRequests'],
      })
      .then(data => {
        console.log('JOIN REQUEST ACTION', data);
        setLoading(false);
        if (data.data && data.data[key]) {
          const res = data.data[key];
          if (res.success) {
          } else {
            showMessage(errorMessage(res.message));
          }
        } else {
          showMessage(errorMessage());
        }
      })
      .catch(err => {
        console.log('ERROR JOIN REQUEST ACTION', err);
        setLoading(false);
        showMessage(errorMessage());
      });
  };

  renderAction = (joinRequest, isAcceptType) => {
    const {isUserProgram, isCoCoach} = this.props;
    if (!isUserProgram && !isCoCoach) {
      return null;
    }
    return (
      <TouchableOpacity
        onPress={() => this.onRequestAction(joinRequest, isAcceptType)}
        style={{
          backgroundColor: isAcceptType
            ? ThemeStyle.green + '33'
            : ThemeStyle.red + '33',
          paddingVertical: Dimensions.marginSmall,
          paddingHorizontal: Dimensions.marginLarge,
          marginLeft: Dimensions.marginRegular,
          borderRadius: Dimensions.r24,
        }}>
        <Text
          style={[
            TextStyles.GeneralTextBold,
            {color: isAcceptType ? '#4BC68A' : ThemeStyle.red},
          ]}>
          {isAcceptType ? 'Accept' : 'Block'}
        </Text>
      </TouchableOpacity>
    );
  };

  render() {
    const {members} = this.state;
    return (
      <View style={ThemeStyle.pageContainer}>
        {members && members.length ? (
          members.map(joinRequest => {
            return (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginHorizontal: Dimensions.screenMarginRegular,
                  borderBottomWidth: Dimensions.r1,
                  borderColor: ThemeStyle.divider,
                  paddingVertical: Dimensions.marginSmall,
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <S3Image
                    placeHolder={require('../../assets/images/image-placeholder.png')}
                    filePath={joinRequest.picture}
                    level={s3ProtectionLevel.PUBLIC}
                    style={{
                      width: Dimensions.r48,
                      height: Dimensions.r48,
                      backgroundColor: ThemeStyle.divider,
                      borderRadius: Dimensions.r24,
                      marginBottom: Dimensions.marginRegular,
                    }}
                    resizeMode="cover"
                  />
                  <Text
                    style={[
                      TextStyles.GeneralTextBold,
                      {marginLeft: Dimensions.marginSmall},
                    ]}>
                    {joinRequest.name}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  {this.renderAction(joinRequest)}
                </View>
              </View>
            );
          })
        ) : (
          <NoData style={{marginTop: Dimensions.r64}} message="No members" />
        )}
      </View>
    );
  }
}
