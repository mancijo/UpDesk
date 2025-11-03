import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Card from '../components/Card';
import { useAuth, User } from '../context/AuthContext';
import { router, useRouter } from 'expo-router';


const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = (emailToCheck: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((emailToCheck || '').trim());
  };

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Por favor, digite um e-mail válido');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const userData: User = {
        id: '123',
        nome: 'Nome do Usuário',
        telefone: '11987654321',
        email: email,
        setor: 'TI',
        cargo: 'Desenvolvedor',
      };

      await login(userData);
      router.replace('/menu');
    } catch (err) {
      setError('Erro ao fazer login. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  const handleForgotPassword = async () => {
    setForgotPasswordLoading(true);
    try {
      // If there is a valid e-mail typed, pass it so the reset screen can prefill the field.
      if (email && isValidEmail(email)) {
        const url = `/forgetPassword?email=${encodeURIComponent(email.trim())}`;
        router.push(url);
      } else if (email && !isValidEmail(email)) {
        // If the user typed something but it's not a valid e-mail, show an error and don't navigate.
        setError('Por favor, digite um e-mail válido para recuperação');
        return;
      } else {
        // No email typed — allow navigation so user can input it on the reset screen.
        router.push('/forgetPassword');
      }
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.centeredView}>
        <Card>
          <Text style={styles.title}>Login</Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#606D80"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
          />

          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#606D80"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError('');
            }}
            secureTextEntry
            editable={!isLoading}
          />
          <TouchableOpacity
            onPress={handleForgotPassword}
            disabled={isLoading || forgotPasswordLoading}
            style={[forgotPasswordLoading && styles.buttonDisabled]}
          >
            {forgotPasswordLoading ? (
              <ActivityIndicator color="#2B4C7E" size="small" />
            ) : (
              <Text style={styles.forgetPasswordText}>Esqueci a minha senha</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading || forgotPasswordLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF', 
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000000', 
  },
  input: {
    height: 40,
    borderColor: '#DCE0E6', 
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF', 
    color: '#000000', 
  },
  forgetPasswordText: {
    color: '#2B4C7E', 
    marginBottom: 25,
    textDecorationColor: '#2B4C7E',
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#567EBB',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },  
  buttonDisabled: {
    backgroundColor: '#606D80',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF0000', 
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default LoginScreen;