import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
} from 'react-native';

// Define as propriedades que o nosso botão customizado irá aceitar
interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary'; // Para alternar entre os estilos de botão
  buttonStyle?: StyleProp<ViewStyle>; // Para estilos extras
}

/**
 * Um componente de botão reutilizável.
 * @param {string} title - O texto a ser exibido no botão.
 * @param {TouchableOpacityProps} onPress - A função a ser chamada quando o botão for pressionado.
 * @param {'primary' | 'secondary'} [variant='primary'] - A variante de estilo ('primary' para azul, 'secondary' para cinza).
 * @param {StyleProp<ViewStyle>} [buttonStyle] - Estilos customizados para o container do botão.
 */
const Button: React.FC<ButtonProps> = ({ title, variant = 'primary', buttonStyle, ...props }) => {
  return (
    <TouchableOpacity style={[styles.actionButton, styles[variant], buttonStyle]} {...props}>
      <Text style={styles.actionButtonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    borderRadius: 5,
    padding: 8,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  primary: { backgroundColor: '#567EBB' /* Azul */ },
  secondary: { backgroundColor: '#606D80' /* Cinza */ },
});

export default Button;