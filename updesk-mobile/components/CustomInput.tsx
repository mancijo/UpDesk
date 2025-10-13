import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';

// Extende as propriedades padrão do TextInput para que nosso componente seja flexível
interface CustomInputProps extends TextInputProps {
  label: string;
  error?: string | null;
}

/**
 * Um componente de input reutilizável que inclui label e tratamento de erro,
 * seguindo as Heurísticas de Nielsen para melhor usabilidade.
 */
const CustomInput: React.FC<CustomInputProps> = ({ label, error, style, ...props }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          error ? styles.inputError : null, // Heurística #1 e #9: Mostra visualmente o erro
          style, // Permite sobrescrever estilos
        ]}
        placeholderTextColor="#606D80" // Cor suave para não competir com o texto digitado
        {...props} // Passa todas as outras props (value, onChangeText, etc.) para o TextInput
      />
      {/* Heurística #9: Mensagem de erro clara e próxima ao contexto */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16, // Espaçamento padrão entre os campos
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
    color: '#000000',
  },
  inputError: {
    borderColor: '#D92D20', // Vermelho para erro, com bom contraste
    borderWidth: 1,
  },
  errorText: {
    color: '#D92D20',
    fontSize: 12,
    marginTop: 4,
  },
});

export default CustomInput;
