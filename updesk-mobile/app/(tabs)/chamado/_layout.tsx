import { Stack } from 'expo-router';
import { ChamadoProvider } from '../../../context/ChamadoContext';

export default function ChamadoStackLayout() {
  return (
    <ChamadoProvider>
      <Stack 
        initialRouteName="abrirChamado" 
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="abrirChamado" options={{ title: 'Abrir chamado' }} />
        <Stack.Screen name="solucaoIA" options={{ title: 'Solução IA', headerShown: false }} />
        <Stack.Screen name="chamadoEnviado" options={{ title: 'Chamado Enviado' }} />
      </Stack>
    </ChamadoProvider>
  );
}
