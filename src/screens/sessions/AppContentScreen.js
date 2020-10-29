import React from 'react';
import {View, FlatList, Text, TouchableOpacity, ScrollView} from 'react-native';
import BaseComponent from '../../components/BaseComponent';
import ThemeStyle from '../../styles/ThemeStyle';
import Header from '../../components/Header';
import Dimensions from '../../styles/Dimensions';
import TextStyles from '../../styles/TextStyles';
import Card from '../../components/Card';
import CustomButton from '../../components/Button';
import {TextInput} from 'react-native-gesture-handler';
import {withStore} from '../../utils/StoreUtils';
import {swasthCommonsClient} from '../../../App';
import {getAllHomeworkItems} from '../../queries/session';
import Icon from '../../components/Icon';
import CheckBox from 'react-native-check-box';
import {appTypes, appContentTypes} from '../../constants';
import {NoData} from '../../components/NoData';
import _ from 'lodash';
import CustomInput from '../../components/CustomInput';

class AppContentScreen extends BaseComponent {
  constructor(props) {
    super(props);
    this.state.app = props.navigation.getParam('app');
    this.state.onSelect = props.navigation.getParam('onSelect', () => {});
    const selectedItems = props.navigation.getParam('selectedItems');
    this.state.selectedItems = this.parseSelectedItems(selectedItems);
    this.state.selectedType = appContentTypes.EXERCISE;
    this.state.homeworkItems = [];
  }

  componentDidMount() {
    this.fetchHomeworkItems();
  }

  generateHomeworkItemData = () => {
    let items = [];
    if (!this.state.homeworkItems) {
      return [];
    }
    switch (this.state.selectedType) {
      case appContentTypes.EXERCISE:
        items = this.getFilteredItems(this.state.homeworkItems.exercises);
        break;
      case appContentTypes.MEDITATION:
        items = this.getFilteredItems(this.state.homeworkItems.meditations);
        break;
      case appContentTypes.LESSON:
        items = this.getFilteredItems(this.state.homeworkItems.lesson);
        break;
      case appContentTypes.PRACTICE_IDEA:
        items = this.getFilteredItems(this.state.homeworkItems.practiceIdea);
        break;
      default:
        items = [];
    }
    return {
      items,
    };
  };

  fetchHomeworkItems = () => {
    this.setState({
      loading: true,
    });
    const variables = {
      app: appTypes[this.state.app].key,
    };
    this.appContentQuery = swasthCommonsClient
      .watchQuery({
        query: getAllHomeworkItems,
        variables,
        fetchPolicy: 'cache-and-network',
      })
      .subscribe({
        next: data => {
          console.log('APP CONTENT', data);
          if (data.loading && !data.data) {
            return;
          }
          this.props.setLoading(false);
          if (data.data.getAllHomeworkItems) {
            this.setState(prevState => ({
              loading: false,
              homeworkItems: _.cloneDeep(data.data.getAllHomeworkItems),
              refreshList: !prevState.refreshList,
            }));
          }
        },
        error: error => {
          console.log('ERROR FETCHING APP CONTENT', error);
          this.props.setLoading(false);
        },
      });
  };

  getFilteredItems = items => {
    if (!items) {
      return [];
    }
    if (this.state.searchText && this.state.searchText.length) {
      return items.filter(item =>
        item.title
          .toLowerCase()
          .startsWith(this.state.searchText.toLowerCase()),
      );
    }
    return items;
  };

  parseSelectedItems = appContent => {
    const selectedItems = [];
    if (appContent) {
      appContent[appContentTypes.EXERCISE].forEach(item => {
        selectedItems.push({
          type: appContentTypes.EXERCISE,
          title: item,
        });
      });
      appContent[appContentTypes.MEDITATION].forEach(item => {
        selectedItems.push({
          type: appContentTypes.MEDITATION,
          title: item,
        });
      });
      appContent[appContentTypes.LESSON].forEach(item => {
        selectedItems.push({
          type: appContentTypes.LESSON,
          title: item,
        });
      });
      appContent[appContentTypes.PRACTICE_IDEA].forEach(item => {
        selectedItems.push({
          type: appContentTypes.PRACTICE_IDEA,
          title: item,
        });
      });
    }
    return selectedItems;
  };

  getSelectedItems = () => {
    const selectedItems = {
      [appContentTypes.LESSON]: [],
      [appContentTypes.EXERCISE]: [],
      [appContentTypes.PRACTICE_IDEA]: [],
      [appContentTypes.MEDITATION]: [],
    };
    this.state.selectedItems.forEach(item =>
      selectedItems[item.type].push(item.title),
    );
    return selectedItems;
  };

  renderTabItem = ({type, name}) => {
    const {selectedType} = this.state;
    const isActive = selectedType === type;
    return (
      <TouchableOpacity
        onPress={() => {
          this.setState({
            selectedType: type,
          });
        }}
        style={{
          flex: 1,
          alignItems: 'center',
          paddingTop: Dimensions.marginSmall,
          marginHorizontal: Dimensions.marginRegular,
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
              width: '105%',
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

  render() {
    const {navigation} = this.props;
    const {selectedItems} = this.state;
    return this.renderWithSafeArea(
      <View style={ThemeStyle.pageContainer}>
        <Header
          title="Content"
          goBack={() => {
            navigation.pop();
          }}
        />
        <Card
          cardRadius={Dimensions.r24}
          style={{margin: Dimensions.screenMarginRegular}}
          contentStyle={{paddingVertical: Dimensions.marginSmall}}>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            horizontal
            contentContainerStyle={{padding: Dimensions.marginRegular}}>
            {this.renderTabItem({
              type: appContentTypes.EXERCISE,
              name: 'Exercises',
            })}
            {this.renderTabItem({
              type: appContentTypes.MEDITATION,
              name: 'Meditations',
            })}
            {this.renderTabItem({
              type: appContentTypes.LESSON,
              name: 'Lessons',
            })}
            {this.renderTabItem({
              type: appContentTypes.PRACTICE_IDEA,
              name: 'Practice Ideas',
            })}
          </ScrollView>
          <View
            style={{
              margin: Dimensions.marginRegular,
              padding: Dimensions.r10,
              borderColor: ThemeStyle.divider,
              borderRadius: Dimensions.r24,
              borderWidth: Dimensions.r2,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Icon name="search" family="MaterialIcons" color="#bbb" size={20} />
            <CustomInput
              underlineColorAndroid="transparent"
              style={[
                TextStyles.ContentText,
                {
                  marginLeft: Dimensions.r12,
                  padding: 0,
                  flex: 1,
                },
              ]}
              placeholder="Search"
              placeholderTextColor={ThemeStyle.textExtraLight}
              onChangeText={text => {
                if (text && text.length) {
                  this.setState({
                    searchText: text,
                  });
                } else {
                  this.setState({
                    searchText: undefined,
                  });
                }
              }}
            />
          </View>
        </Card>
        <FlatList
          contentContainerStyle={{
            paddingTop: Dimensions.ms12,
            paddingBottom: Dimensions.r96,
            paddingHorizontal: Dimensions.screenMarginRegular,
          }}
          data={this.generateHomeworkItemData().items}
          ListEmptyComponent={<NoData />}
          renderItem={({item}) => {
            let isSelected = false;
            selectedItems.forEach((selectedItem, index) => {
              if (selectedItem.title === item.title) {
                isSelected = true;
              }
            });
            return (
              <Card
                cardRadius={Dimensions.r24}
                style={{marginVertical: Dimensions.marginSmall}}
                contentStyle={{
                  paddingVertical: Dimensions.marginExtraSmall,
                  paddingHorizontal: Dimensions.marginLarge,
                }}>
                <CheckBox
                  checkBoxColor={ThemeStyle.mainColor}
                  style={{
                    paddingVertical: Dimensions.r8,
                    borderBottomWidth: 1,
                    borderBottomColor: ThemeStyle.backgroundColor,
                  }}
                  onClick={() => {
                    this.setState(prevState => {
                      const {selectedItems} = prevState;
                      if (isSelected) {
                        item.type = prevState.selectedType;
                        selectedItems.forEach((selectedItem, index) => {
                          if (selectedItem.title === item.title) {
                            selectedItems.splice(index, 1);
                          }
                        });
                      } else {
                        item.type = prevState.selectedType;
                        selectedItems.push(item);
                      }
                      return {
                        selectedItems,
                        refreshList: !prevState.refreshList,
                      };
                    });
                  }}
                  rightTextStyle={{
                    ...TextStyles.GeneralTextBold,
                    color: item.isSelected
                      ? ThemeStyle.mainColor
                      : ThemeStyle.textLight,
                  }}
                  isChecked={isSelected}
                  rightText={item.title}
                />
              </Card>
            );
          }}
          extraData={this.state.refreshList}
          keyExtractor={item => item.id}
        />
        <CustomButton
          onPress={() => {
            console.log('SELECTED ITEMS', this.state.selectedItems);
            this.state.onSelect(this.getSelectedItems());
            navigation.pop();
          }}
          name="Done"
          style={{
            position: 'absolute',
            bottom: Dimensions.screenMarginRegular,
            left: Dimensions.screenMarginRegular,
            right: Dimensions.screenMarginRegular,
          }}
        />
      </View>,
    );
  }
}

export default withStore(AppContentScreen);
