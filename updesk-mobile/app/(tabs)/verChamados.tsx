import { StyleSheet, Text, View } from "react-native";

export default function VerChamadosScreen() {
  return (
    <View style={styles.container}>
      <Text>Tela de Ver Chamados</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
