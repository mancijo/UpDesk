import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import HeaderLogo from '../../components/HeaderLogo';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2B4C7E', // Cor do ícone ativo (azul escuro)
        headerTitle: () => <HeaderLogo/>,
        headerTitleAlign: 'center',
        headerShadowVisible: false,

      }}
    >
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, size }) => <Feather name="menu" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="abrirChamado"
        options={{
          title: 'Abrir Chamado',
          tabBarIcon: ({ color, size }) => <Feather name="plus-circle" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="verChamados"
        options={{
          title: 'Ver Chamados',
          tabBarIcon: ({ color, size }) => <Feather name="list" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
