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
    Alert,
} from 'react-native';
import Card from '../components/Card';
import { router, useLocalSearchParams } from 'expo-router';

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
    errorText: {
        color: '#FF0000',
        marginBottom: 15,
        textAlign: 'center',
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
        width: '100%',
    },
    button: {
        backgroundColor: '#567EBB',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        width: '100%',
        marginBottom: 15,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    backText: {
        color: '#2B4C7E',
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
});

export default function ForgetPasswordScreen() {
    const params = useLocalSearchParams();
    const [email, setEmail] = useState((params?.email as string) ?? '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const isValidEmail = (emailToCheck: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((emailToCheck || '').trim());
    };

    const handleResetPassword = async () => {
        if (!email) {
            setError('Por favor, digite seu e-mail');
            return;
        }

        if (!isValidEmail(email)) {
            setError('Por favor, digite um e-mail válido');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Add your password reset logic here
            // For example: await api.resetPassword(email);
            Alert.alert(
                'Sucesso',
                'Se o e-mail existir em nossa base, você receberá as instruções para redefinir sua senha.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (err) {
            setError('Ocorreu um erro ao processar sua solicitação. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.centeredView}>
                <Card>
                    <Text style={styles.title}>Recuperar Senha</Text>
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <TextInput
                        style={styles.input}
                        placeholder="Digite seu e-mail"
                        placeholderTextColor="#606D80"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleResetPassword}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.buttonText}>Enviar</Text>
                        )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.backText}>Voltar ao login</Text>
                    </TouchableOpacity>
                </Card>
            </View>
        </KeyboardAvoidingView>
    );
}
