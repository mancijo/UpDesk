import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import Card from '../components/Card';

// NOTE: Replace with your actual backend URL. 
// For Android emulators, 10.0.2.2 points to the host machine's localhost.
const API_URL = 'exp://192.168.10.2:8081';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

   const handleLogin = async () => {
    
   }

  // const handleLogin = async () => {
  //   if (!email || !password) {
  //     setError('Email e senha são obrigatórios.');
  //     return;
  //   }

  //   setIsLoading(true);
  //   setError('');

  //   try {
  //     const response = await fetch(`${API_URL}/login`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         email: email,
  //         senha: password,
  //       }),
  //     });

  //     const data = await response.json();

  //     if (response.ok) {
  //       Alert.alert('Login Bem-Sucedido', data.mensagem);
  //       // TODO: Navigate to the home screen and store user data/token
  //       console.log('Login successful:', data.usuario);
  //     } else {
  //       setError(data.mensagem || 'Ocorreu um erro no login.');
  //     }
  //   } catch (e) {
  //     console.error(e);
  //     setError('Não foi possível conectar ao servidor. Verifique o endereço da API e sua conexão.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#606D80" 
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleLogin} disabled={isLoading}>
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
    backgroundColor: '#DCE0E6', // light gray
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
    color: '#000000', // black
  },
  input: {
    height: 40,
    borderColor: '#DCE0E6', // light gray
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF', // white
    color: '#000000', // black
  },
  button: {
    backgroundColor: '#567EBB',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#606D80', // dark gray
  },
  buttonText: {
    color: '#FFFFFF', // white
    fontWeight: 'bold',
  },
  errorText: {
    color: '#2B4C7E', // dark blue for feedback
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default LoginScreen;
