import { Alert } from 'react-native';

export const handleError = (error: any): void => {
  const message = error.response?.data?.message || error.message || 'Ocorreu um erro inesperado';
  Alert.alert('Erro', message);
};

export const showConfirmation = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
): void => {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancelar',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: 'Confirmar',
        onPress: onConfirm,
      },
    ],
    { cancelable: false }
  );
};

export const showSuccess = (message: string): void => {
  Alert.alert('Sucesso', message);
};