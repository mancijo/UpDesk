import React from 'react';
import { Image, StyleSheet } from 'react-native';

const HeaderLogo = () => {
  return <Image source={require('../assets/logoUpd.png')} style={styles.logo} />;
};

const styles = StyleSheet.create({
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
});

export default HeaderLogo;
