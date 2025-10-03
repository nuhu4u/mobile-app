import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { autoNetworkDetector } from '@/lib/network/auto-network-detector';
import { dynamicApiManager } from '@/lib/api/dynamic-api-manager';
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

  // Initialize auto network detection on app start
  useEffect(() => {
    const initializeNetworkDetection = async () => {
      try {
        console.log('🚀 Initializing auto network detection...');
        
        // Initialize auto network detector
        const networkSuccess = await autoNetworkDetector.initialize();
        
        if (networkSuccess) {
          console.log('✅ Auto network detection initialized successfully');
          
          // Set up event listeners for network changes
          autoNetworkDetector.addEventListener('ip_discovered', async (event) => {
            if (event.discoveredIP) {
              console.log(`🔄 Backend discovered at: ${event.discoveredIP}`);
              // Update all API services with new URL
              await dynamicApiManager.updateAllServices(`http://${event.discoveredIP}:3001/api`);
            }
          });

          autoNetworkDetector.addEventListener('wifi_change', async (event) => {
            console.log(`🔄 WiFi changed from ${event.previousSSID} to ${event.currentSSID}`);
            // The auto detector will automatically scan for backend
          });

          autoNetworkDetector.addEventListener('connection_restored', async (event) => {
            console.log(`🔄 Connection restored on ${event.currentSSID}`);
            // The auto detector will automatically scan for backend
          });
        } else {
          console.log('⚠️ Auto network detection failed to initialize');
        }
      } catch (error) {
        console.error('❌ Error initializing network detection:', error);
      }
    };

    initializeNetworkDetection();
  }, []);

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
