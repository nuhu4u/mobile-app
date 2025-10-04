import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
// Auto network detection removed - using stable hotspot connection
import { useAuthStore } from '@/store/auth-store';
import { AuthCleanup } from '@/lib/utils/auth-cleanup';

export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  const { logout } = useAuthStore();

  // Clear authentication data on app start
  useEffect(() => {
    const clearAuthData = async () => {
      try {
        console.log('🔐 Clearing stored authentication data...');
        
        // Use the comprehensive auth cleanup utility
        await AuthCleanup.clearAllAuthData();
        
        // Ensure auth store is reset
        logout();
        
        console.log('✅ Authentication data cleared - user must login');
      } catch (error) {
        console.error('❌ Error clearing auth data:', error);
      }
    };

    clearAuthData();
  }, [logout]);

  // Auto network detection removed - using stable PC hotspot connection

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="login" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="elections/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="results/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="vote/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard/page" options={{ headerShown: false }} />
        <Stack.Screen name="profile/page" options={{ headerShown: false }} />
        <Stack.Screen name="blockchain-transactions" options={{ headerShown: false }} />
        <Stack.Screen name="election-totals" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
