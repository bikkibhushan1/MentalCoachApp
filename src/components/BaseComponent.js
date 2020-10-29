import React from 'react';
import {SafeAreaView} from 'react-navigation';
import ThemeStyle from '../styles/ThemeStyle';
import {StatusBar, TouchableWithoutFeedback, Keyboard} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

export default class BaseComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      topSafeArea: ThemeStyle.backgroundColor,
      bottomSafeArea: ThemeStyle.backgroundColor,
    };
  }

  renderWithSafeArea(children) {
    return (
      <React.Fragment>
        <StatusBar backgroundColor={this.state.topSafeArea} />
        <SafeAreaView
          style={{flex: 0, backgroundColor: this.state.topSafeArea}}
        />
        <SafeAreaView
          forceInset={{top: 'never', bottom: 'always'}}
          style={{flex: 1, backgroundColor: this.state.bottomSafeArea}}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAwareScrollView
              contentContainerStyle={{flex: 1}}
              alwaysBounceVertical={false}
              overScrollMode="never">
              {children}
            </KeyboardAwareScrollView>
          </TouchableWithoutFeedback>
        </SafeAreaView>
      </React.Fragment>
    );
  }
}
