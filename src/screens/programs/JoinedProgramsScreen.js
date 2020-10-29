import React from 'react';
import {
  View,
  ScrollView,
  Image,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import BaseComponent from '../../components/BaseComponent';
import ThemeStyle from '../../styles/ThemeStyle';
import Header from '../../components/Header';
import Dimensions from '../../styles/Dimensions';
import TextStyles from '../../styles/TextStyles';
import Card from '../../components/Card';
import CustomButton from '../../components/Button';
import {TextInput} from 'react-native-gesture-handler';
import {appsyncClient} from '../../../App';
import {getPrograms, getJoinedPrograms} from '../../queries/user';
import ProgramItem from './ProgramItem';
import {withStore} from '../../utils/StoreUtils';
import {NoData} from '../../components/NoData';
import CustomInput from '../../components/CustomInput';

class JoinedProgramScreen extends BaseComponent {
  constructor(props) {
    super(props);
    this.state.joinedPrograms = [];
    this.state.hasMoreContent = true;
  }

  componentDidMount() {
    this.props.setLoading(true);
    this.fetchPrograms();
  }

  fetchPrograms = () => {
    const {joinedLastKey, hasMoreContent} = this.state;
    if (!hasMoreContent) {
      console.log('NO MORE JOINED PROGRAMS TO FETCH');
      return;
    }
    console.log('FETCHING PROGRAMS', joinedLastKey);
    this.programsQuery = appsyncClient
      .watchQuery({
        query: getJoinedPrograms,
        variables: {
          lastKey: joinedLastKey,
        },
        fetchPolicy: 'cache-and-network',
      })
      .subscribe({
        next: data => {
          console.log('JOINED PROGRAMS', data);
          this.props.setLoading(false);
          if (data.loading && !data.data) {
            return;
          }
          if (data.data.getUserPrograms) {
            this.programsQuery.unsubscribe();
            this.setState(
              prevState => {
                if (
                  prevState.joinedLastKey ===
                  data.data.getUserPrograms.LastEvaluatedKey
                ) {
                  return null;
                }
                const {joinedPrograms} = prevState;
                console.log('join', prevState.LastEvaluatedKey, joinedPrograms);
                joinedPrograms.push(...data.data.getUserPrograms.Items);
                return {
                  joinedPrograms,
                  joinedLastKey: data.data.getUserPrograms.LastEvaluatedKey,
                  hasMoreContent: !!data.data.getUserPrograms.LastEvaluatedKey,
                };
              },
              () => this.onFilterChange(this.searchText),
            );
          }
        },
        error: error => {
          this.props.setLoading(false);
          console.log('ERROR FETCHING JOINED PROGRAMS', error);
        },
      });
  };

  renderProgramItem = ({item: program, index}) => {
    const {navigation} = this.props;
    if (!program) {
      return null;
    }
    return (
      <ProgramItem
        program={program}
        index={index}
        onPress={() => {
          navigation.navigate('ProgramDetails', {
            program,
          });
        }}
      />
    );
  };

  onFilterChange = (text = '') => {
    const {joinedPrograms} = this.state;
    this.searchText = text;
    const filteredPrograms = joinedPrograms.filter(item => {
      return item.name.toLowerCase().includes(text.toLowerCase());
    });
    this.setState({
      filteredPrograms,
    });
  };

  render() {
    const {navigation} = this.props;
    const {filteredPrograms} = this.state;
    return this.renderWithSafeArea(
      <View style={ThemeStyle.pageContainer}>
        <Header
          title="Joined Programs"
          goBack={() => {
            navigation.pop();
          }}
          //   rightIcon={() => (
          //     <Image source={require('../../assets/images/Add-icon.png')} />
          //   )}
          //   onRightIconClick={() => {
          //     navigation.navigate('CreateProgram');
          //   }}
        />
        <View
          style={{
            paddingHorizontal: Dimensions.screenMarginRegular,
          }}>
          <Card
            cardRadius={Dimensions.r32}
            style={{
              marginBottom: Dimensions.marginRegular,
            }}
            contentStyle={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: Dimensions.marginLarge,
            }}>
            <Image
              source={require('../../assets/images/search-icon.png')}
              style={{
                width: Dimensions.r16,
                height: Dimensions.r16,
                marginRight: Dimensions.marginSmall,
              }}
              resizeMode="contain"
            />
            <CustomInput
              placeholder="Search"
              style={[TextStyles.GeneralTextBold, ThemeStyle.searchInput]}
              onChangeText={this.onFilterChange}
            />
          </Card>
          <Card
            style={{marginVertical: Dimensions.marginLarge}}
            contentStyle={{padding: Dimensions.marginLarge}}>
            {filteredPrograms && filteredPrograms.length ? (
              <FlatList
                keyExtractor={item => item.id}
                data={filteredPrograms}
                renderItem={this.renderProgramItem}
                onEndReached={this.fetchPrograms}
              />
            ) : (
              <NoData />
            )}
          </Card>
        </View>
      </View>,
    );
  }
}

export default withStore(JoinedProgramScreen);
