import React from 'react';
import {View} from 'react-native';
import BaseComponent from '../../components/BaseComponent';
import ThemeStyle from '../../styles/ThemeStyle';
import Header from '../../components/Header';
import UploadComponent from './UploadComponent';
import Dimensions from '../../styles/Dimensions';
import {withStore} from '../../utils/StoreUtils';

class UploadDocumentsScreen extends BaseComponent {
  constructor(props) {
    super(props);
    const {navigation} = props;
    this.state.onSelect = navigation.getParam('onSelect', () => {});
    this.state.hideLibrary = navigation.getParam('hideLibrary', false);
  }

  render() {
    const {navigation} = this.props;
    const {hideLibrary, onSelect} = this.state;
    return this.renderWithSafeArea(
      <View style={ThemeStyle.pageContainer}>
        <Header title="Upload Content" goBack={() => navigation.pop()} />
        <UploadComponent
          containerStyle={{padding: Dimensions.screenMarginRegular}}
          navigation={navigation}
          hideLibrary={hideLibrary}
          isSelect={true}
          onSelect={onSelect}
        />
      </View>,
    );
  }
}

export default withStore(UploadDocumentsScreen);
