import { StyleSheet, View } from "react-native";
import TabelaChamados from '../../components/TabelaChamados';

export default function VerChamadosScreen() {
  return (
    <View style={styles.container}>
      <TabelaChamados />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
