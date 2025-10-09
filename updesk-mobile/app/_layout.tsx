import { Stack } from "expo-router";
import HeaderLogo from "../components/HeaderLogo";
import { AuthProvider } from "../context/AuthContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerTitleAlign: "center",
            contentStyle: { backgroundColor: "#FFFFFF" },
            headerTitle: () => <HeaderLogo />,
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}