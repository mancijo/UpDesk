import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChamado } from '../../../context/ChamadoContext';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';

export default function SolucaoIAScreen() {
  const { chamado } = useChamado();
  const { user } = useAuth();
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.summaryContainer}>
          <Text style={styles.title}>Resumo do seu Problema</Text>
          <Text style={styles.baseText}><Text >Título:</Text> {chamado.tituloChamado}</Text>
          <Text style={styles.baseText}><Text >Descrição:</Text> {chamado.descricaoChamado}</Text>
          <Text style={styles.baseText}><Text >Afeta:</Text> {chamado.afetadosChamado}</Text>
        </View>

        <View style={styles.solutionContainer}>
          <Text style={styles.title}>Solução Sugerida pela IA</Text>
          <Text style={styles.solutionText}>
            Aqui será apresentada a solução gerada pela IA com base nos dados do seu chamado.
            Por exemplo: "Verifique a impressora está conectada na tomada e se o cabo USB está bem encaixado no computador. Tente reiniciar o computador e a impressora."
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          <View style={styles.buttonRow}>
            <View style={styles.buttonWrapper}>
              <Text style={styles.helpText}>Problema resolvido?</Text>
              <TouchableOpacity style={[styles.button, styles.finishButton]} onPress={handleFinish}>
                <Text style={styles.buttonText}>Finalizar</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.buttonWrapper}>
              <Text style={styles.helpText}>Preciso de ajuda</Text>
              <TouchableOpacity style={[styles.button, styles.openTicketButton]} onPress={handleOpenTicket}>
                <Text style={styles.buttonText}>Abrir Chamado</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const baseTextStyle = {
  fontSize: 16,
  color: '#000000',
  marginBottom: 5,
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    padding: 20,
    flexGrow: 1, 
    justifyContent: 'space-between',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2B4C7E',
    marginBottom: 10,
  },
  solutionContainer: {
    backgroundColor: '#E6F2FF',
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#567EBB',
  },
  baseText: baseTextStyle,
  solutionText: {
    ...baseTextStyle,
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
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  finishButton: {
    backgroundColor: '#606D80',
  },
  openTicketButton: {
    backgroundColor: '#567EBB',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});