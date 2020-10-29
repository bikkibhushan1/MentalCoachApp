import React from 'react';
import {View, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: 'rgba(78,103,193,0.2)',
    shadowOffset: {height: 2},
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardContent: {overflow: 'hidden', borderRadius: 10},
});

export default props => {
  return (
    <View
      style={[
        styles.card,
        props.style,
        {borderRadius: props.cardRadius || 12},
      ]}>
      <View
        style={[
          {
            overflow: 'hidden',
            borderRadius: props.cardRadius || 12,
          },
          props.contentStyle,
        ]}>
        {props.children}
      </View>
    </View>
  );
};
