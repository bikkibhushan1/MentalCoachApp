import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  FlatList,
  Linking,
} from 'react-native';
import BaseComponent from '../../components/BaseComponent';
import ThemeStyle from '../../styles/ThemeStyle';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Dimensions, {windowDimensions} from '../../styles/Dimensions';
import {uploadTypes, s3ProtectionLevel} from '../../constants';
import TextStyles from '../../styles/TextStyles';
import {appsyncClient} from '../../../App';
import {getLibraryItems, removeLibraryItems} from '../../queries/library';
import {withStore} from '../../utils/StoreUtils';
import CustomButton from '../../components/Button';
import {NoData} from '../../components/NoData';
import {
  getFileDetailsFromUrl,
  getLibraryItemsPath,
  errorMessage,
} from '../../utils';
import {performNetworkTask} from '../../utils/NetworkUtils';
import Icon from '../../components/Icon';
import {showMessage} from 'react-native-flash-message';
import S3Image from '../../components/S3Image';
import {Storage} from 'aws-amplify';
import ImageLibraryItem from '../../components/ImageLibraryItem';
import PDForLinkLibraryItem from '../../components/PDForLinkLibraryItem';

class MyLibraryScreen extends BaseComponent {
  constructor(props) {
    super(props);
    const {navigation} = props;
    this.state.isSelect = navigation.getParam('isSelect', true);
    this.state.onSelect = navigation.getParam('onSelect', () => {});
    this.state.selectedItems = navigation.getParam('selectedItems', {
      images: [],
      links: [],
      pdfs: [],
    });
    this.state.selectedType = uploadTypes.IMAGE;
    this.state.libraryItems = {};
  }

  componentDidMount() {
    this.fetchLibraryItems();
  }

  fetchLibraryItems = () => {
    this.props.setLoading(true);
    this.libraryItemsQuery = appsyncClient
      .watchQuery({
        query: getLibraryItems,
        fetchPolicy: 'network-only',
      })
      .subscribe({
        next: data => {
          console.log('USER LIBRARY', data);
          if (data.loading && !data.data) {
            return;
          }
          this.props.setLoading(false);
          if (data.data.getLibraryItems) {
            this.setState({
              libraryItems: data.data.getLibraryItems,
            });
            this.libraryItemsQuery.unsubscribe();
          }
        },
        error: error => {
          console.log('ERROR FETCHING USER LIBRARY', error);
          this.props.setLoading(false);
        },
      });
  };

  onRemoveLibraryItem = async (item, type) => {
    const libraryItems = {
      links: [],
      pdfs: [],
      images: [],
    };
    this.props.setLoading(true);
    libraryItems[type].push(item);
    try {
      const response = await appsyncClient.mutate({
        mutation: removeLibraryItems,
        variables: {
          libraryItems: getLibraryItemsPath(libraryItems),
        },
      });
      console.log('SUCCESSFULLY REMOVED ITEM', response);
      this.props.setLoading(false);
      this.fetchLibraryItems();
    } catch (err) {
      this.props.setLoading(false);
      showMessage(errorMessage());
      console.log('FAILED TO REMOVE LIBRARY ITEM', err);
    }
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

  renderContent = () => {
    const {libraryItems, selectedType, selectedItems, isSelect} = this.state;
    const {navigation} = this.props;
    const isImageType = selectedType === uploadTypes.IMAGE;
    if (
      !libraryItems ||
      !libraryItems[selectedType] ||
      !libraryItems[selectedType].length
    ) {
      return <NoData />;
    }
    return (
      <FlatList
        key={selectedType}
        contentContainerStyle={{
          paddingHorizontal: Dimensions.screenMarginRegular,
          paddingBottom: Dimensions.r128,
        }}
        numColumns={isImageType ? 3 : 1}
        data={libraryItems[selectedType]}
        renderItem={data => {
          const isSelected =
            selectedItems &&
            selectedItems[selectedType] &&
            selectedItems[selectedType]
              .map(item => getFileDetailsFromUrl(item).filePath)
              .includes(getFileDetailsFromUrl(data.item).filePath);
          const onPress = async () => {
            if (isSelect) {
              if (isSelected) {
                selectedItems[selectedType].splice(
                  selectedItems[selectedType].indexOf(data.item),
                  1,
                );
              } else {
                selectedItems[selectedType].push(data.item);
              }
              this.setState({
                selectedItems,
              });
            } else {
              if (isImageType) {
                navigation.navigate('ViewImage', {
                  uri: data.item,
                  onDelete: () =>
                    this.onRemoveLibraryItem(data.item, uploadTypes.IMAGE),
                });
              } else if (selectedType === uploadTypes.PDF) {
                Linking.openURL(
                  await Storage.get(data.item, {
                    level: s3ProtectionLevel.PROTECTED,
                  }),
                );
              } else {
                Linking.openURL(data.item);
              }
            }
          };
          return isImageType
            ? this.renderImageItem(data.item, isSelected, onPress)
            : this.renderPDForLink(
                data.item,
                isSelected,
                onPress,
                selectedType,
              );
        }}
      />
    );
  };

  renderImageItem = (item, isSelected, onPress) => {
    return (
      <ImageLibraryItem item={item} onPress={onPress} isSelected={isSelected} />
    );
  };

  renderPDForLink = (item, isSelected, onPress, type) => {
    const {isSelect} = this.state;
    return (
      <PDForLinkLibraryItem
        item={item}
        isSelected={isSelected}
        onPress={onPress}
        type={type}
        onDelete={
          isSelect
            ? null
            : () => {
                performNetworkTask(
                  () => {
                    this.onRemoveLibraryItem(item, type);
                  },
                  'Deleting library items is only allowed when online. Please connect to the internet and try again.',
                  true,
                );
              }
        }
      />
    );
  };

  render() {
    const {navigation} = this.props;
    const {isSelect, onSelect} = this.state;
    return this.renderWithSafeArea(
      <View style={ThemeStyle.pageContainer}>
        <Header
          title={isSelect ? 'Choose an upload' : 'My Library'}
          goBack={() => navigation.pop()}
          rightIcon={
            !isSelect
              ? () => (
                  <Image source={require('../../assets/images/Add-icon.png')} />
                )
              : null
          }
          onRightIconClick={() => {
            navigation.navigate('UploadDocument', {
              hideLibrary: true,
              onSelect: this.fetchLibraryItems,
            });
          }}
        />
        <Card
          cardRadius={Dimensions.r24}
          style={{margin: Dimensions.screenMarginRegular}}
          contentStyle={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          {this.renderTabItem({type: uploadTypes.IMAGE, name: 'Images'})}
          {this.renderTabItem({type: uploadTypes.PDF, name: 'Documents'})}
          {this.renderTabItem({type: uploadTypes.LINK, name: 'Links'})}
        </Card>
        {this.renderContent()}
        {isSelect && (
          <CustomButton
            onPress={() => {
              onSelect(this.state.selectedItems);
              navigation.pop();
            }}
            name="Choose"
            style={{
              position: 'absolute',
              bottom: Dimensions.screenMarginRegular,
              left: Dimensions.screenMarginRegular,
              right: Dimensions.screenMarginRegular,
            }}
          />
        )}
      </View>,
    );
  }
}

export default withStore(MyLibraryScreen);
