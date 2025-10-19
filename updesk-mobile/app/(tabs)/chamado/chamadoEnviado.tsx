import { router } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../../components/Card';
import { useChamado } from '../../../context/ChamadoContext';

export default function PlaceholderScreen() {
  const { chamado, setChamado } = useChamado();

  return (
    <SafeAreaView style={styles.container}>
      <Card>
        <Text style={styles.text}>Chamado enviado com sucesso!</Text>
        <Text style={styles.summaryText}><Text style={styles.bold}>Descrição:</Text> {chamado.descricaoChamado}</Text>
      </Card>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('../menu')}>
          <Text style={styles.backButtonText}>Ir para o menu</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={() => router.push('../menu')}>
          <Text style={styles.submitButtonText} >Ver meus chamados</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  text: {
    fontSize: 18,
    color: '#000',
    marginBottom: 5,
  },
  summaryText: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    backgroundColor: '#606D80',
    borderRadius: 5,
    padding: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#567EBB',
    borderRadius: 5,
    padding: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});
