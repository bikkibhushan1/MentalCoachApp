import React from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Text,
  TextInput,
} from 'react-native';
import BaseComponent from '../../components/BaseComponent';
import ThemeStyle from '../../styles/ThemeStyle';
import Header from '../../components/Header';
import chatHelper from '../../services/twiio';
import Dimensions from '../../styles/Dimensions';
import ChatItem from './ChatItem';
import Card from '../../components/Card';
import TextStyles from '../../styles/TextStyles';
import {chatTypes} from '../../constants';
import {withStore} from '../../utils/StoreUtils';
import {appsyncClient} from '../../../App';
import {getAllChannels} from '../../queries/messages';
import {NoData} from '../../components/NoData';
import CustomInput from '../../components/CustomInput';

class MessagesScreen extends BaseComponent {
  constructor(props) {
    super(props);
    this.state.selectedType = chatTypes.DIRECT;
    this.filterText = '';
  }

  async componentDidMount() {
    this.fetchChannels();
  }

  componentWillUnmount() {
    if (this.channelsQuery) {
      this.channelsQuery.unsubscribe();
    }
  }

  fetchChannels = () => {
    const {selectedType} = this.state;
    this.channelsQuery = appsyncClient
      .watchQuery({
        query: getAllChannels,
        fetchPolicy: 'cache-and-network',
      })
      .subscribe({
        next: data => {
          console.log('USER CHANNELS', data);
          if (data.loading && !data.data) {
            return;
          }
          this.props.setLoading(false);
          if (data.data.getAllChannels) {
            const groupChannels = [];
            const directChannels = [];
            data.data.getAllChannels.forEach(channel => {
              if (channel.channelType === chatTypes.DIRECT) {
                directChannels.push(channel);
              } else {
                groupChannels.push(channel);
              }
            });
            console.log('CHANNELS', groupChannels);
            this.setState({
              channels: data.data.getAllChannels,
              groupChannels,
              directChannels,
              filteredChannels:
                selectedType === chatTypes.DIRECT
                  ? directChannels
                  : groupChannels,
            });
          }
        },
        error: error => {
          console.log('ERROR FETCHING USER CHANNELS', error);
          this.props.setLoading(false);
        },
      });
  };

  renderTabItem = ({type, name}) => {
    const {selectedType} = this.state;
    const isActive = selectedType === type;
    return (
      <TouchableOpacity
        onPress={() => {
          this.setState(
            {
              selectedType: type,
            },
            this.onFilterChange,
          );
        }}
        style={{
          flex: 1,
          alignItems: 'center',
          paddingTop: Dimensions.marginLarge,
        }}>
        <Text
          style={{
            ...TextStyles.GeneralTextBold,
            color: isActive ? ThemeStyle.mainColor : ThemeStyle.textRegular,
          }}>
          {name}
        </Text>
        {isActive && (
          <View
            style={{
              width: '70%',
              height: Dimensions.r4,
              borderRadius: Dimensions.r2,
              backgroundColor: ThemeStyle.mainColor,
              marginTop: Dimensions.marginSmall,
            }}
          />
        )}
      </TouchableOpacity>
    );
  };

  onFilterChange = () => {
    const {groupChannels, directChannels, selectedType} = this.state;
    let channels =
      selectedType === chatTypes.DIRECT ? directChannels : groupChannels;
    const filteredChannels = channels.filter(item => {
      return item.displayName
        .toLowerCase()
        .includes(this.filterText.toLowerCase());
    });
    this.setState(prevState => ({
      filteredChannels,
      refreshData: !prevState.refreshData,
    }));
  };

  render() {
    const {filteredChannels, selectedType, refreshData} = this.state;
    const {navigation, user} = this.props;
    return this.renderWithSafeArea(
      <View style={ThemeStyle.pageContainer}>
        <Header title="Messages" icon={null} />
        <Card
          cardRadius={Dimensions.r32}
          style={{
            marginHorizontal: Dimensions.screenMarginRegular,
          }}
          contentStyle={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: Dimensions.marginLarge,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <View style={{}}>
              <Image
                source={require('../../assets/images/search-icon.png')}
                style={{
                  width: Dimensions.r16,
                  height: Dimensions.r16,
                  marginRight: Dimensions.marginSmall,
                  alignSelf: 'center',
                }}
                resizeMode="contain"
              />
            </View>

            <View style={{alignSelf: 'center'}}>
              <CustomInput
                placeholder="Search"
                style={[TextStyles.GeneralTextBold, ThemeStyle.searchInput]}
                underlineColorAndroid="transparent"
                onChangeText={text => {
                  this.filterText = text;
                  this.onFilterChange();
                }}
              />
            </View>
          </View>
        </Card>

        <Card style={{margin: Dimensions.screenMarginRegular}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            {this.renderTabItem({type: chatTypes.DIRECT, name: 'Direct'})}
            {this.renderTabItem({type: chatTypes.PROGRAM, name: 'Group'})}
          </View>
          {filteredChannels && filteredChannels.length ? (
            <FlatList
              id={selectedType}
              keyExtractor={item => item.channelId}
              data={filteredChannels}
              renderItem={({item, index}) => (
                <ChatItem
                  channel={item}
                  navigation={navigation}
                  user={user}
                  showTopBorder={index !== 0}
                />
              )}
            />
          ) : (
            <View style={{width: '100%', height: Dimensions.r168}}>
              <NoData />
            </View>
          )}
        </Card>
      </View>,
    );
  }
}

export default withStore(MessagesScreen);
