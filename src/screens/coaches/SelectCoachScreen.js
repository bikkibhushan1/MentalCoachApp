import React from 'react';
import {View, Text, Image} from 'react-native';
import BaseComponent from '../../components/BaseComponent';
import ThemeStyle from '../../styles/ThemeStyle';
import Header from '../../components/Header';
import {
  ReactiveBase,
  ReactiveList,
  ReactiveComponent,
} from '@appbaseio/reactivesearch-native';
import S3Image from '../../components/S3Image';
import TextStyles from '../../styles/TextStyles';
import Dimensions from '../../styles/Dimensions';
import {s3ProtectionLevel} from '../../constants';
import {TouchableOpacity} from 'react-native-gesture-handler';
import ReactiveInputComponent from '../../components/ReactiveInputComponent';
import Card from '../../components/Card';
import {isNullOrEmpty, errorMessage} from '../../utils';
import CustomInput from '../../components/CustomInput';
import Icon from '../../components/Icon';
import _ from 'lodash';
import {appsyncClient} from '../../../App';
import {addCoCoach} from '../../queries/program';
import {withStore} from '../../utils/StoreUtils';
import {showMessage} from 'react-native-flash-message';
import CustomButton from '../../components/Button';

class SelectCoachScreen extends BaseComponent {
  constructor(props) {
    super(props);
    this.state.selectedCoaches = [];
    this.state.isCohort = props.navigation.getParam('isCohort', false);
    this.state.program = props.navigation.getParam('program', {});
    const existingCoaches = _.cloneDeep(this.state.program.coCoach) || [];
    this.state.existingCoaches = existingCoaches.map(coach => coach.userId);
  }

  onSubmit = () => {
    const {isCohort, program, selectedCoaches} = this.state;
    const {setLoading, navigation} = this.props;
    setLoading(true);
    const variables = {
      coachId: selectedCoaches,
    };
    if (isCohort) {
      variables.cohortId = program.id;
    } else {
      variables.programId = program.id;
    }
    appsyncClient
      .mutate({
        mutation: addCoCoach,
        variables,
        refetchQueries: ['getProgramWithSchedules'],
      })
      .then(data => {
        console.log('ADD CO COACH', data);
        setLoading(false);
        if (data.data && data.data.addCoCoach) {
          const res = data.data.addCoCoach;
          if (res.success) {
            showMessage({
              type: 'success',
              message: res.message || 'Successfully sent co-coach request',
            });
            navigation.pop();
          } else {
            showMessage(errorMessage(res.message));
          }
        } else {
          showMessage(errorMessage());
        }
      })
      .catch(err => {
        console.log('ERROR ADD CO COACH', err);
        setLoading(false);
        showMessage(errorMessage());
      });
  };

  renderCoachItem = res => {
    const {selectedCoaches, existingCoaches} = this.state;
    const {user} = this.props;
    if (!res || res.userId === user.userId) {
      return null;
    }
    const coachId = res.userId;
    const isSelected = selectedCoaches.includes(coachId);
    const isDisabled = existingCoaches.includes(coachId);
    return (
      <CoachItem
        res={res}
        initialSelectionState={isSelected}
        isDisabled={isDisabled}
        onPress={() => {
          const selectedIndex = selectedCoaches.indexOf(coachId);
          if (selectedIndex !== -1) {
            selectedCoaches.splice(selectedIndex, 1);
          } else {
            selectedCoaches.push(coachId);
          }
          this.setState({selectedCoaches, canSubmit: selectedCoaches.length});
        }}
      />
    );
  };

  render() {
    const {navigation} = this.props;
    const {canSubmit} = this.state;
    return this.renderWithSafeArea(
      <ReactiveBase
        app="coachsearch"
        url="https://search-peer-to-peer-support-group-waru576b6oz4afvmtus5lnhcte.us-east-1.es.amazonaws.com/">
        <View style={ThemeStyle.pageContainer}>
          <Header
            goBack={() => {
              navigation.pop();
            }}
            title={'Add Co-Coaches'}
            navBarStyle={{backgroundColor: 'transparent'}}
          />
          <Card
            cardRadius={Dimensions.r32}
            style={{
              marginHorizontal: Dimensions.screenMarginRegular,
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
            <ReactiveComponent componentId="searchFilter" filterLabel="Search">
              <ReactiveInputComponent
                renderInputComponent={({selectedValue, setQuery}) => (
                  <CustomInput
                    placeholder="Search by name, practice, tags"
                    underlineColorAndroid="transparent"
                    value={selectedValue}
                    style={[TextStyles.GeneralTextBold, ThemeStyle.searchInput]}
                    onChangeText={text => {
                      const query = isNullOrEmpty(text)
                        ? null
                        : {
                            query: {
                              query: {
                                match: {
                                  name: {
                                    query: text,
                                    operator: 'or',
                                  },
                                },
                              },
                            },
                            value: text,
                          };
                      setQuery(query);
                    }}
                    blurOnSubmit={false}
                  />
                )}
              />
            </ReactiveComponent>
          </Card>
          <View
            style={{
              paddingHorizontal: Dimensions.screenMarginRegular,
              paddingBottom: Dimensions.r72,
              flex: 1,
            }}>
            <ReactiveComponent
              componentId="coachFilter"
              defaultQuery={() => ({
                query: {
                  match: {
                    hasPractice: 'true',
                  },
                },
              })}
            />
            <ReactiveList
              dataField="name"
              componentId="results"
              react={{
                and: ['searchFilter', 'coachFilter'],
              }}
              onData={this.renderCoachItem}
              showResultStats={false}
              // excludeFields={['stripe', 'stripeAccountId', 'libraryItems']}
            />
          </View>
          <CustomButton
            style={{
              position: 'absolute',
              bottom: Dimensions.screenMarginRegular,
              left: Dimensions.screenMarginRegular,
              right: Dimensions.screenMarginRegular,
              backgroundColor: canSubmit ? null : ThemeStyle.disabled,
            }}
            name="Add Co-Coach"
            onPress={this.onSubmit}
            disabled={!canSubmit}
            noGradient={!canSubmit}
          />
        </View>
      </ReactiveBase>,
    );
  }
}

class CoachItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSelected: props.initialSelectionState,
      isDisabled: props.isDisabled,
    };
  }

  render() {
    const {res, onPress} = this.props;
    const {isSelected, isDisabled} = this.state;
    return (
      <TouchableOpacity
        key={res.userId}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          opacity: isDisabled ? 0.6 : 1,
        }}
        onPress={() => {
          if (isDisabled) {
            return;
          }
          this.setState({
            isSelected: !isSelected,
          });
          onPress();
        }}>
        <S3Image
          placeHolder={require('../../assets/images/image-placeholder.png')}
          filePath={res.picture}
          level={s3ProtectionLevel.PUBLIC}
          style={{
            width: Dimensions.r72,
            height: Dimensions.r72,
            backgroundColor: ThemeStyle.divider,
            borderRadius: Dimensions.r36,
            marginVertical: Dimensions.marginLarge,
          }}
          resizeMode="cover"
        />
        <View style={{paddingHorizontal: Dimensions.marginLarge, flex: 1}}>
          <Text style={TextStyles.Header2}>{res.name}</Text>
          {res.practice && (
            <View>
              <Text
                style={[
                  TextStyles.GeneralTextBold,
                  {marginVertical: Dimensions.marginExtraSmall},
                ]}>
                {res.practice && res.practice.title}
              </Text>
              <Text
                style={[
                  TextStyles.ContentText,
                  {flex: 1, marginRight: Dimensions.marginExtraLarge},
                ]}
                numberOfLines={2}>
                {res.practice && res.practice.description}
              </Text>
            </View>
          )}
        </View>
        <Icon
          family="MaterialIcons"
          name={
            isSelected || isDisabled ? 'check-box' : 'check-box-outline-blank'
          }
          size={24}
          color={
            isSelected || isDisabled
              ? ThemeStyle.mainColor
              : ThemeStyle.disabled
          }
        />
      </TouchableOpacity>
    );
  }
}

export default withStore(SelectCoachScreen);
