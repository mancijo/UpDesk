import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChamado } from '../../../context/ChamadoContext';
import { useRouter } from 'expo-router';

export default function SolucaoIAScreen() {
  const { chamado, usuario } = useChamado();
  const router = useRouter();

  const handleOpenTicket = () => {
    // Navega para a próxima tela no fluxo
    router.replace('/chamado/chamadoEnviado');
  };

  const handleFinish = () => {
    // Lógica para finalizar o chamado (pode ser implementado depois)
    // Por agora, pode voltar para a tela de menu, por exemplo.
    router.replace('/menu');
  };

  return (
    <View style={{backgroundColor: '#FFFFFF', flex: 1}}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Resumo do seu Problema</Text>
          <Text style={styles.summaryText}><Text style={styles.bold}>Título:</Text> {chamado.titulo}</Text>
          <Text style={styles.summaryText}><Text style={styles.bold}>Descrição:</Text> {chamado.descricao}</Text>
          <Text style={styles.summaryText}><Text style={styles.bold}>Afeta:</Text> {chamado.afetados}</Text>
        </View>

        <View style={styles.solutionContainer}>
          <Text style={styles.solutionTitle}>Solução Sugerida pela IA</Text>
          <Text style={styles.solutionText}>
            Aqui será apresentada a solução gerada pela IA com base nos dados do seu chamado.
            Por exemplo: "Verifique se a impressora está conectada na tomada e se o cabo USB está bem encaixado no computador. Tente reiniciar o computador e a impressora."
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          <View style={styles.buttonRow}>
            <View style={styles.buttonWrapper}>
              <Text style={styles.helpText}>Problema resolvido?</Text>
              <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
                <Text style={styles.buttonText}>Finalizar</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.buttonWrapper}>
              <Text style={styles.helpText}>Preciso de ajuda</Text>
              <TouchableOpacity style={styles.openTicketButton} onPress={handleOpenTicket}>
                <Text style={styles.buttonText}>Abrir Chamado</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    flexGrow: 1, 
    justifyContent: 'space-between',
  },
  summaryContainer: {
    backgroundColor: '#DCE0E6',
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2B4C7E',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  solutionContainer: {
    backgroundColor: '#E6F2FF',
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#567EBB',
  },
  solutionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2B4C7E',
    marginBottom: 10,
  },
  solutionText: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 22,
  },
  actionsContainer: {
    marginTop: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  buttonWrapper: {
    alignItems: 'center',
  },
  helpText: {
    fontSize: 16,
    color: '#606D80',
    marginBottom: 8,
  },
  finishButton: {
    backgroundColor: '#606D80',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  openTicketButton: {
    backgroundColor: '#567EBB',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});