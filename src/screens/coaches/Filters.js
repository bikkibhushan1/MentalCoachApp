import React from 'react';
import {ReactiveComponent} from '@appbaseio/reactivesearch-native';
import ReactiveInputComponent from '../../components/ReactiveInputComponent';
import {TextInput, Switch, ScrollView} from 'react-native-gesture-handler';
import TextStyles from '../../styles/TextStyles';
import ThemeStyle from '../../styles/ThemeStyle';
import InputField from '../../components/InputField';
import Dimensions from '../../styles/Dimensions';
import Header from '../../components/Header';
import {View} from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import CustomInput from '../../components/CustomInput';

export default ({showFilters, hide}) => {
  let nameInput;
  let genderInput;
  let cityInput;
  let countryInput;
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: showFilters ? 1 : 0,
        zIndex: showFilters ? 20 : -100,
        backgroundColor: ThemeStyle.backgroundColor,
      }}>
      <Header title="Filters" isClose onClose={hide} />
      <ScrollView
        style={{paddingHorizontal: Dimensions.screenMarginRegular}}
        contentContainerStyle={{paddingBottom: Dimensions.r96}}>
        <InputField
          onPress={() => {
            nameInput.focus();
          }}
          label="Name"
          renderInputComponent={() => {
            return (
              <ReactiveComponent componentId="nameFilter" filterLabel="Name">
                <ReactiveInputComponent
                  renderInputComponent={({selectedValue, setQuery}) => (
                    <CustomInput
                      ref={ref => {
                        nameInput = ref;
                      }}
                      placeholder={`Michael`}
                      underlineColorAndroid="transparent"
                      value={selectedValue}
                      style={[
                        TextStyles.GeneralTextBold,
                        {
                          color: ThemeStyle.mainColor,
                        },
                      ]}
                      onChangeText={text => {
                        setQuery({
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
                        });
                      }}
                      blurOnSubmit={false}
                    />
                  )}
                />
              </ReactiveComponent>
            );
          }}
        />
        <InputField
          label="Gender"
          onPress={() => {
            genderInput.show();
          }}
          renderInputComponent={() => (
            <ReactiveComponent componentId="genderFilter" filterLabel="Gender">
              <ReactiveInputComponent
                renderInputComponent={({selectedValue, setQuery}) => (
                  <ModalDropdown
                    ref={ref => {
                      genderInput = ref;
                    }}
                    defaultValue={selectedValue}
                    options={[`Male`, `Female`, `Other`]}
                    textStyle={[
                      TextStyles.GeneralTextBold,
                      {color: ThemeStyle.mainColor},
                    ]}
                    dropdownTextStyle={TextStyles.GeneralTextBold}
                    dropdownStyle={{minWidth: 100}}
                    onSelect={(_index, value) => {
                      setQuery({
                        query: {query: {match: {gender: value}}},
                        value,
                      });
                    }}
                  />
                )}
              />
            </ReactiveComponent>
          )}
        />
        <InputField
          onPress={() => {
            cityInput.focus();
          }}
          label="City"
          renderInputComponent={() => {
            return (
              <ReactiveComponent componentId="cityFilter" filterLabel="City">
                <ReactiveInputComponent
                  renderInputComponent={({selectedValue, setQuery}) => (
                    <CustomInput
                      ref={ref => {
                        cityInput = ref;
                      }}
                      placeholder="Indianapolis"
                      defaultValue={selectedValue}
                      underlineColorAndroid="transparent"
                      style={[
                        TextStyles.GeneralTextBold,
                        {color: ThemeStyle.mainColor},
                      ]}
                      onChangeText={text => {
                        setQuery({
                          query: {
                            query: {
                              match: {
                                address: {city: text},
                              },
                            },
                          },
                          value: text,
                        });
                      }}
                      blurOnSubmit={false}
                    />
                  )}
                />
              </ReactiveComponent>
            );
          }}
        />
        <InputField
          onPress={() => {
            countryInput.focus();
          }}
          label="Country"
          renderInputComponent={() => {
            return (
              <ReactiveComponent
                componentId="countryFilter"
                filterLabel="Country">
                <ReactiveInputComponent
                  renderInputComponent={({selectedValue, setQuery}) => (
                    <CustomInput
                      ref={ref => {
                        countryInput = ref;
                      }}
                      placeholder={'United States'}
                      defaultValue={selectedValue}
                      underlineColorAndroid="transparent"
                      style={[
                        TextStyles.GeneralTextBold,
                        {color: ThemeStyle.mainColor},
                      ]}
                      onChangeText={text => {
                        setQuery({
                          query: {
                            query: {
                              match: {
                                'address.country': text,
                              },
                            },
                          },
                          value: text,
                        });
                      }}
                      blurOnSubmit={false}
                    />
                  )}
                />
              </ReactiveComponent>
            );
          }}
        />
        <InputField
          onPress={() => {}}
          label="Featured"
          renderInputComponent={() => {
            return (
              <ReactiveComponent componentId="featuredFilter">
                <ReactiveInputComponent
                  renderInputComponent={({selectedValue, setQuery}) => (
                    <Switch
                      value={selectedValue}
                      onValueChange={() => {
                        const query = !selectedValue
                          ? {
                              query: {
                                query: {
                                  match: {
                                    featuredCoach: JSON.stringify(
                                      !selectedValue,
                                    ),
                                  },
                                },
                              },
                              value: !selectedValue,
                            }
                          : null;
                        setQuery(query);
                      }}
                    />
                  )}
                />
              </ReactiveComponent>
            );
          }}
        />
      </ScrollView>
    </View>
  );
};
