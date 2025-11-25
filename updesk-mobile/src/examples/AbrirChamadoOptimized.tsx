import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useChamado } from '../../../context/ChamadoContext';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { chamadoService } from '../../../services/chamadoService';
import { handleError, showSuccess } from '../../../utils/alerts';
import theme from '../../../theme';
import CustomInput from '../../../components/CustomInput';
import Button from '../../../components/Button';

export default function AbrirChamadoScreen() {
  const router = useRouter();
  const { newChamado, setChamado } = useChamado();
  const { errors, validateField, clearErrors, hasErrors } = useFormValidation();

  const handleInputChange = (name: string, value: any) => {
    setChamado(prevState => ({ ...prevState, [name]: value }));
    validateField(name, value, {
      required: true,
      minLength: name === 'descricaoChamado' ? 10 : undefined,
    });
  };

  const handleSubmit = async () => {
    try {
      // Validar todos os campos obrigatórios
      const isTituloValid = validateField('tituloChamado', newChamado.tituloChamado, { required: true });
      const isDescricaoValid = validateField('descricaoChamado', newChamado.descricaoChamado, { required: true, minLength: 10 });
      const isAfetadosValid = validateField('afetadosChamado', newChamado.afetadosChamado, { required: true });

      if (!isTituloValid || !isDescricaoValid || !isAfetadosValid) {
        return;
      }

      // Enviar o chamado para a API
      await chamadoService.criarChamado(newChamado);
      showSuccess('Chamado criado com sucesso!');
      router.push('/chamado/solucaoIA');
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <View style={styles.container}>
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
        placeholder="Descreva detalhadamente o problema..."
        multiline
        numberOfLines={4}
        error={errors.descricaoChamado}
      />

      <Button
        title="Criar Chamado"
        onPress={handleSubmit}
        disabled={hasErrors()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.light,
  },
});