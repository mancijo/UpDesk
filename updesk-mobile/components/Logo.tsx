import { Dimensions, Image, StyleSheet } from "react-native";

const Logo = () => {
    return (
        <Image
          source={require('../assets/logoUpd.png')}
          style={styles.logo}
        />
    )
}

const styles = StyleSheet.create({
 logo: {
    width:  Dimensions.get('window').width * 0.6, // Take the window width and fix at 60%
    height: Dimensions.get('window').width * 0.6,
    resizeMode: 'contain',
  },
})

export default Logo;