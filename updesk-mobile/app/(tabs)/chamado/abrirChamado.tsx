import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useChamado } from '../../../context/ChamadoContext';
import CustomInput from '../../../components/CustomInput';
import Button from '../../../components/Button';

export default function AbrirChamadoScreen() {
  const router = useRouter();
  const { newChamado, setChamado } = useChamado();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Pré definindo as opções a quem este chamado afeta
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
    if (!newChamado.tituloChamado) {
      newErrors.tituloChamado = 'O título do chamado é obrigatório.';
    }
    if (!newChamado.descricaoChamado) {
      newErrors.descricaoChamado = 'A descrição do chamado é obrigatória.';
    }
    if (!newChamado.afetadosChamado) {
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
        <CustomInput
          label="Título do Chamado"
          value={newChamado.tituloChamado}
          onChangeText={(text) => handleInputChange('tituloChamado', text)}
          placeholder="Ex: Problema com a impressora"
          error={errors.tituloChamado}
        />

        <CustomInput
          label="Descrição do Chamado"
          value={newChamado.descricaoChamado}
          onChangeText={(text) => handleInputChange('descricaoChamado', text)}
          placeholder="Descreva o problema em detalhes..."
          multiline
          style={styles.textArea}
          error={errors.descricaoChamado}
        />

        <Text style={styles.label}>Quem esse chamado afeta?</Text>
        <View style={styles.segmentedControlContainer}>
          {/* Loop que apresenta as opções pré-definidas */}
          {segmentedOptions.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[styles.segmentedControl, newChamado.afetadosChamado === option.value && styles.segmentedControlSelected]}
              onPress={() => handleInputChange('afetadosChamado', option.value)}
            >
              <Text style={[styles.segmentedControlText, newChamado.afetadosChamado === option.value && styles.segmentedControlTextSelected]}>{option.label}</Text>
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
        <Button
          title="Voltar"
          onPress={handleReturn}
          variant="secondary"
          buttonStyle={{ marginRight: 10 }}
        />
        <Button 
          title="Buscar Solução com IA" 
          onPress={handleSubmit} 
          buttonStyle={{ marginLeft: 10 }} 
        />
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
    color: '#000',
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
  errorText: {
    color: '#FF0000',
    marginBottom: 10,
    fontSize: 12,
  },
});