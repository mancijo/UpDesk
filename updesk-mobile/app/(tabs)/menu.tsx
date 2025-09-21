import { StyleSheet, Text, View } from "react-native";

export default function MenuScreen() {
  return (
    <View style={styles.container}>
      <Text>Conteúdo da sua tela de Menu</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
