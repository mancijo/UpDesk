
import React from 'react';
import { View, StyleSheet } from 'react-native';

const Card = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={styles.card}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 5, // sm rounding
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default Card;
