import React from 'react';
import {View, ScrollView, Image, Text, TouchableOpacity} from 'react-native';
import BaseComponent from '../../components/BaseComponent';
import ThemeStyle from '../../styles/ThemeStyle';
import Header from '../../components/Header';
import Dimensions from '../../styles/Dimensions';
import TextStyles from '../../styles/TextStyles';
import Card from '../../components/Card';
import CustomButton from '../../components/Button';
import ProgramItem from './ProgramItem';
import {withStore} from '../../utils/StoreUtils';
import {NoData} from '../../components/NoData';
import {FlatList} from 'react-native-gesture-handler';
import moment from 'moment';
import {getDisplayPrice, getSessionTypeDetails} from '../../utils';
import Icon from '../../components/Icon';

class ModuleDetailsScreen extends BaseComponent {
  constructor(props) {
    super(props);
    this.state.topSafeArea = ThemeStyle.foreground;
    const program = props.navigation.getParam('program', {});
    const module = props.navigation.getParam('module', {});
    this.state.program = program;
    this.state.module = module;
    this.state.isUserProgram = props.user.userId === program.coachId;
  }

  render() {
    const {navigation} = this.props;
    const {program, module, isUserProgram} = this.state;
    return this.renderWithSafeArea(
      <View style={ThemeStyle.pageContainer}>
        <Header
          title="Sessions"
          goBack={() => {
            navigation.pop();
          }}
          navBarStyle={{backgroundColor: ThemeStyle.foreground}}
          //   rightIcon={() => (
          //     <Image source={require('../../assets/images/Add-icon.png')} />
          //   )}
          //   onRightIconClick={() => {
          //     navigation.navigate('CreateProgram');
          //   }}
        />
        <ScrollView>
          <Card contentStyle={{padding: Dimensions.marginLarge}}>
            <ProgramItem program={program} index={0} fullDisplay />
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
              <CustomButton
                onPress={() => {
                  if (isUserProgram) {
                    navigation.navigate('InviteUser', {
                      program,
                    });
                  }
                }}
                name={isUserProgram ? 'Invite User' : 'Joined'}
                noGradient
                style={{flex: 0.5, backgroundColor: ThemeStyle.green}}
              />
              <CustomButton
                onPress={() => {
                  navigation.navigate('Chat', {
                    channel: {
                      channelId: program.channelId,
                      displayName: program.name,
                    },
                  });
                }}
                style={{
                  minWidth: Dimensions.r96,
                  marginLeft: Dimensions.marginRegular,
                }}
                renderIcon={() => (
                  <Image
                    source={require('../../assets/images/message-icon.png')}
                  />
                )}
              />
            </View>
          </Card>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: Dimensions.screenMarginRegular,
              marginTop: Dimensions.marginExtraLarge,
            }}>
            <Text style={TextStyles.SubHeader2}>Sessions</Text>
          </View>
          {module.sessions && module.sessions.length ? (
            <Card style={{margin: Dimensions.screenMarginRegular}}>
              <FlatList
                data={module.sessions}
                renderItem={({item, index}) => {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate('SessionDetails', {
                          session: item,
                          program,
                        });
                      }}
                      style={{
                        paddingVertical: Dimensions.marginExtraLarge,
                        marginLeft: Dimensions.marginExtraLarge,
                        borderTopColor: ThemeStyle.divider,
                        borderTopWidth: index === 0 ? 0 : Dimensions.r2,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: Dimensions.marginSmall,
                        }}>
                        <Text
                          style={
                            ([TextStyles.GeneralText],
                            {
                              color: ThemeStyle.white,
                              borderRadius: Dimensions.r16,
                              paddingVertical: Dimensions.marginSmall,
                              paddingHorizontal: Dimensions.marginLarge,
                              backgroundColor: ThemeStyle.mainColor,
                              overflow: 'hidden',
                            })
                          }>
                          {item.name}
                        </Text>
                        <Image
                          style={{
                            width: Dimensions.r24,
                            height: Dimensions.r24,
                            marginLeft: Dimensions.marginLarge,
                          }}
                          source={getSessionTypeDetails(item.type).image}
                        />
                      </View>
                      <Text style={TextStyles.Header2}>{`${moment(
                        item.startDate,
                      ).format('MMM DD, YYYY')}`}</Text>
                      <Image
                        source={require('../../assets/images/arrow-icon.png')}
                        style={{
                          position: 'absolute',
                          bottom: Dimensions.r40,
                          right: Dimensions.marginExtraLarge,
                          tintColor: ThemeStyle.disabledLight,
                          transform: [{rotate: '180deg'}],
                        }}
                      />
                    </TouchableOpacity>
                  );
                }}
              />
            </Card>
          ) : (
            <NoData
              style={{marginTop: Dimensions.r64}}
              message="No sessions added"
            />
          )}
        </ScrollView>
      </View>,
    );
  }
}

export default withStore(ModuleDetailsScreen);
