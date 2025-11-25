import { StyleSheet, Text, View } from "react-native";
import Card from "../../components/Card";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
import { router } from "expo-router";

export default function PerfilScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.text}>Nome: {user!.nome}</Text>
        <Text style={styles.text}>Email: {user!.email}</Text>
        <Text style={styles.text}>Telefone: {user!.telefone}</Text>
        <Text style={styles.text}>Setor: {user!.setor}</Text>
        <Text style={styles.text}>Cargo: {user!.cargo}</Text>
        <Button
          title="Sair"
          onPress={() => router.replace('/login')}
          variant="secondary"
          buttonStyle={ styles.button }
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    width: 60,
    margin: 'auto',
    marginTop: 20,
  }
});
