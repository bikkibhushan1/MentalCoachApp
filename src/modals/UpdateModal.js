import React from 'react';
import {Modal, View, Text, Linking} from 'react-native';
import Button from '../components/Button';
import Icon from '../components/Icon';
import TextStyles from '../styles/TextStyles';
import ThemeStyle from '../styles/ThemeStyle';
import {getLookupValuesQuery} from '../queries/getLookupValues';
import VersionCheck from 'react-native-version-check';
import {compareVersions} from '../utils';
import {appsyncClient} from '../../App';

export default class UpdateModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  componentDidMount() {
    appsyncClient
      .watchQuery({
        query: getLookupValuesQuery,
        variables: {
          keyname: 'MinAppVersion',
        },
        fetchPolicy: 'no-cache',
      })
      .subscribe({
        next: async data => {
          if (data.loading && !data.data) {
            return;
          }
          console.log('MIN VERSION', data);
          const currentVersion = await VersionCheck.getCurrentVersion();
          console.log('CURRENT VERSION', currentVersion);
          if (data.data.getLookupValues && data.data.getLookupValues.value) {
            let minVersion = '1.0.0';
            data.data.getLookupValues.value.forEach(item => {
              if (item.name === 'ACT Coach') {
                minVersion = item.description || '1.0.0';
              }
            });
            if (
              compareVersions(minVersion, currentVersion, {
                zeroExtend: true,
              }) > 0
            ) {
              // this.setState({ visible: true });
            }
          }
        },
        error: error => {
          console.log('ERROR', error);
        },
      });
  }

  show = options => {
    this.setState({
      visible: true,
      ...options,
    });
  };

  hide = () => {
    this.setState({
      visible: false,
      message: undefined,
    });
  };

  render() {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.visible}
        onRequestClose={() => {}}>
        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.42)'}}>
          <View
            style={{
              flex: 1,
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
            }}>
            <View
              style={{
                backgroundColor: '#fff',
                shadowColor: 'grey',
                shadowOffset: {width: 15, height: 5},
                shadowOpacity: 0.5,
                shadowRadius: 10,
                paddingHorizontal: 24,
                paddingVertical: 24,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                <Icon
                  size={32}
                  color={ThemeStyle.mainColor}
                  name="ios-information-circle-outline"
                  family="Ionicons"
                />
                <Text
                  style={[
                    TextStyles.HeaderBold,
                    {
                      marginLeft: 16,
                    },
                  ]}>
                  {'App Update Required'}
                </Text>
              </View>
              <Text
                style={[
                  TextStyles.SubHeaderBold,
                  {
                    fontSize: 16,
                  },
                ]}>
                {this.state.message
                  ? this.state.message
                  : 'A new version is available for DBT-Coach. Please update your app from App Store to continue.'}
              </Text>
              <Button
                style={{flex: 1, marginTop: 32}}
                name="Update"
                onPress={() => {
                  const url = `itms-apps://itunes.apple.com/app/dbt-coach/id1452264969`;
                  Linking.canOpenURL(url)
                    .then(supported => {
                      if (!supported) {
                        console.log(`Can't handle url: ${url}`);
                      } else {
                        return Linking.openURL(url);
                      }
                    })
                    .catch(err => {
                      console.error(`An error occurred`, err);
                    });
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

let updateModal = undefined;

export function setUpdateModal(ref) {
  updateModal = ref;
}

export function getUpdateModal() {
  return updateModal;
}
