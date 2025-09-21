import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const BottomBar = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleHome = () => {
    router.push('/menu');
  };

  const handleOpenTicket = () => {
    router.push('/abrirChamado');
  };

  const handleViewTickets = () => {
    router.push('/verChamados');
  };

  const handleProfile = () => {
    router.push('/perfil');
  };

  return (
    <View style={[styles.outerContainer, { paddingBottom: insets.bottom }]}>
      <View style={styles.innerContainer}>
        <TouchableOpacity style={styles.button} onPress={handleHome}>
          <Feather name="home" size={24} color="white" />
          <Text style={styles.buttonText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleOpenTicket}>
          <Feather name="plus-circle" size={24} color="white" />
          <Text style={styles.buttonText}>Abrir Chamado</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleViewTickets}>
          <Feather name="list" size={24} color="white" />
          <Text style={styles.buttonText}>Ver Chamados</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleProfile}>
          <Feather name="user" size={24} color="white" />
          <Text style={styles.buttonText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#2B4C7E',
    borderTopWidth: 1,
    borderTopColor: '#567EBB',
  },
  innerContainer: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
});

export default BottomBar;