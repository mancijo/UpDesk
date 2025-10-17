import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useChamado } from '../../../context/ChamadoContext';

export default function AbrirChamadoScreen() {
  const router = useRouter();
  const { chamado, setChamado } = useChamado();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const segmentedOptions = [
    { label: 'Somente eu', value: 'eu' },
    { label: 'Meu Setor', value: 'setor' },
    { label: 'A Empresa Toda', value: 'empresa' },
  ];

  // Atualiza o estado do chamado conforme o usuário digita
  const handleInputChange = (name: string, value: any) => {
    setChamado(prevState => ({ ...prevState, [name]: value }));
    // Clear error for the field when it's being edited
    if (errors[name]) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  //REMOVER AO SUBIR EM PROD, CONTEUDO PARA TESTES E DEV
  useEffect(() => {
    handleInputChange('tituloChamado', 'fogo na impressora');
    handleInputChange('descricaoChamado', 'impressora está fazendo faisca e queimando os papeis');
    handleInputChange('afetadosChamado', 'eu');
  }, [])
  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  //validação simples dos campos obrigatórios
  const validateForm = () => {
    let newErrors: { [key: string]: string } = {};
    if (!chamado.tituloChamado) {
      newErrors.tituloChamado = 'O título do chamado é obrigatório.';
    }
    if (!chamado.descricaoChamado) {
      newErrors.descricaoChamado = 'A descrição do chamado é obrigatória.';
    }
    if (!chamado.afetadosChamado) {
      newErrors.afetadosChamado = 'Selecione quem o chamado afeta.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }; 

  // Navega para a próxima tela se o formulário for válido
  // Inserir envio para API aqui futuramente
  const handleSubmit = () => {
    if (validateForm()) {
      router.push('/chamado/solucaoIA');
    } else {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha todos os campos obrigatórios.');
    }
  };

  const handleReturn = () => {
    Alert.alert(
        "Voce retornará ao menu principal",
        "As informações serão perdidas. Deseja continuar?",
        [
          {
            text: "Voltar",
            style: "cancel",
          },
          {
            text: "Prosseguir",
            onPress: () => router.replace('/menu'),
          },
        ]
      )
  };



  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container}>
        {/* Fomulário de chamado */}
        <Text style={styles.label}>Título do Chamado</Text>
        <TextInput
          style={[styles.input, errors.tituloChamado && styles.inputError]}
          value={chamado.tituloChamado}
          onChangeText={(text) => handleInputChange('tituloChamado', text)} /* Reducer para inserir conteudo ao text */
          placeholder="Ex: Problema com a impressora"
        />
        {errors.tituloChamado && <Text style={styles.errorText}>{errors.tituloChamado}</Text>}

        <Text style={styles.label}>Descrição do Chamado</Text>
        <TextInput
          style={[styles.input, styles.textArea, errors.descricaoChamado && styles.inputError]}
          value={chamado.descricaoChamado}
          onChangeText={(text) => handleInputChange('descricaoChamado', text)}
          placeholder="Descreva o problema em detalhes..."
          multiline
        />
        {errors.descricaoChamado && <Text style={styles.errorText}>{errors.descricaoChamado}</Text>}

        <Text style={styles.label}>Quem esse chamado afeta?</Text>
        <View style={styles.segmentedControlContainer}>
          {segmentedOptions.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[styles.segmentedControl, chamado.afetadosChamado === option.value && styles.segmentedControlSelected]}
              onPress={() => handleInputChange('afetadosChamado', option.value)}
            >
              <Text style={[styles.segmentedControlText, chamado.afetadosChamado === option.value && styles.segmentedControlTextSelected]}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.afetadosChamado && <Text style={styles.errorText}>{errors.afetadosChamado}</Text>}

        <Text style={styles.label}>Anexo</Text>
        <TouchableOpacity style={styles.anexoButton}>
          <Text style={styles.anexoButtonText}>Adicionar um documento</Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.backButton]} onPress={handleReturn}>
            <Text style={styles.actionButtonText}>Voltar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.submitButton]} onPress={handleSubmit}>
            <Text style={styles.actionButtonText} >Buscar Solução com IA</Text>
          </TouchableOpacity>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  container: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2B4C7E',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    color: '#000000',
    borderColor: '#gray',
    borderWidth: 1,
  },
  inputError: {
    borderColor: '#FF0000',
    borderWidth: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  segmentedControlContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  segmentedControl: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    textAlign: 'center',
    backgroundColor: '#FFF',
    borderColor: '#CCCCCC',
    borderWidth: 1,
  },
  segmentedControlSelected: {
    backgroundColor: '#2B4C7E',
  },
  segmentedControlText: {
    color: '#2B4C7E',
  },
  segmentedControlTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  anexoButton: {
    backgroundColor: '#DCE0E6',
    borderRadius: 5,
    padding: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  anexoButtonText: {
    color: '#2B4C7E',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    borderRadius: 5,
    padding: 8,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    backgroundColor: '#606D80',
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: '#567EBB',
    marginLeft: 10,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF0000',
    marginBottom: 10,
    fontSize: 12,
  },
});