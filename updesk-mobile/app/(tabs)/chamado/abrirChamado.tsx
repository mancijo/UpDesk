import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useChamado } from '../../../context/ChamadoContext';

export default function AbrirChamadoScreen() {
  const router = useRouter();
  const { chamado, setChamado } = useChamado();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
    handleInputChange('titulo', 'fogo na impressora');
    handleInputChange('descricao', 'impressora está fazendo faisca e queimando os papeis');
    handleInputChange('afetados', 'eu');
  }, [])
  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  //validação simples dos campos obrigatórios
  const validateForm = () => {
    let newErrors: { [key: string]: string } = {};
    if (!chamado.tituloChamado) {
      newErrors.titulo = 'O título do chamado é obrigatório.';
    }
    if (!chamado.descricaoChamado) {
      newErrors.descricao = 'A descrição do chamado é obrigatória.';
    }
    if (!chamado.afetadosChamado) {
      newErrors.afetados = 'Selecione quem o chamado afeta.';
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

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container}>
        <Text style={styles.label}>Título do Chamado</Text>
        <TextInput
          style={[styles.input, errors.titulo && styles.inputError]}
          value={chamado.tituloChamado}
          onChangeText={(text) => handleInputChange('titulo', text)}
          placeholder="Ex: Problema com a impressora"
        />
        {errors.titulo && <Text style={styles.errorText}>{errors.titulo}</Text>}

        <Text style={styles.label}>Descrição do Chamado</Text>
        <TextInput
          style={[styles.input, styles.textArea, errors.descricao && styles.inputError]}
          value={chamado.descricaoChamado}
          onChangeText={(text) => handleInputChange('descricao', text)}
          placeholder="Descreva o problema em detalhes..."
          multiline
        />
        {errors.descricao && <Text style={styles.errorText}>{errors.descricao}</Text>}

        <Text style={styles.label}>Quem esse chamado afeta?</Text>
        <View style={styles.segmentedControlContainer}>
          <TouchableOpacity
            style={[styles.segmentedControl, chamado.afetadosChamado === 'eu' && styles.segmentedControlSelected]}
            onPress={() => handleInputChange('afetados', 'eu')}
          >
            <Text style={[styles.segmentedControlText, chamado.afetadosChamado === 'eu' && styles.segmentedControlTextSelected]}>Somente eu</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentedControl, chamado.afetadosChamado === 'setor' && styles.segmentedControlSelected]}
            onPress={() => handleInputChange('afetados', 'setor')}
          >
            <Text style={[styles.segmentedControlText, chamado.afetadosChamado === 'setor' && styles.segmentedControlTextSelected]}>Meu Setor</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentedControl, chamado.afetadosChamado === 'empresa' && styles.segmentedControlSelected]}
            onPress={() => handleInputChange('afetados', 'empresa')}
          >
            <Text style={[styles.segmentedControlText, chamado.afetadosChamado === 'empresa' && styles.segmentedControlTextSelected]}>A Empresa Toda</Text>
          </TouchableOpacity>
        </View>
        {errors.afetados && <Text style={styles.errorText}>{errors.afetados}</Text>}

        <Text style={styles.label}>Anexo</Text>
        <TouchableOpacity style={styles.anexoButton}>
          <Text style={styles.anexoButtonText}>Adicionar um documento</Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText} >Buscar Solução com IA</Text>
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
    backgroundColor: '#DCE0E6',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    color: '#000000',
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
    alignItems: 'center',
    backgroundColor: '#DCE0E6',
    borderColor: '#2B4C7E',
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
  errorText: {
    color: '#FF0000',
    marginBottom: 10,
    fontSize: 12,
  },
});