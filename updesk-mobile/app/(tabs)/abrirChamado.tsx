import { StyleSheet, Text, View } from "react-native";

export default function AbrirChamadoScreen() {
  return (
    <View style={styles.container}>
      <Text>Tela de Abrir Chamado</Text>
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
