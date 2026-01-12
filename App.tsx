import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import {
  Tag,
  ChefHat,
  Banknote,
  LayoutGrid
} from 'lucide-react-native';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Import screens
import { ConverterScreen } from './src/screens/ConverterScreen';
import { SizesScreen } from './src/screens/SizesScreen';
import { KitchenScreen } from './src/screens/KitchenScreen';
import { CurrencyScreen } from './src/screens/CurrencyScreen';
import { ToolsScreen } from './src/screens/ToolsScreen';

// Import components
import { AnimatedSplash } from './src/components/AnimatedSplash';
import { ErrorBoundary, AppLogo } from './src/components';

import { colors } from './src/theme/colors';

const Tab = createBottomTabNavigator();

function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 16),
          height: 70 + Math.max(insets.bottom, 16),
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 10,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.secondary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIcon: ({ color }) => {
          const iconProps = { color, size: 24, strokeWidth: 2 };

          switch (route.name) {
            case 'Convert':
              return <AppLogo size={28} color={color} />;
            case 'Sizes':
              return <Tag {...iconProps} />;
            case 'Kitchen':
              return <ChefHat {...iconProps} />;
            case 'Currency':
              return <Banknote {...iconProps} />;
            case 'Tools':
              return <LayoutGrid {...iconProps} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen name="Convert" component={ConverterScreen} />
      <Tab.Screen name="Sizes" component={SizesScreen} />
      <Tab.Screen name="Kitchen" component={KitchenScreen} />
      <Tab.Screen name="Currency" component={CurrencyScreen} />
      <Tab.Screen name="Tools" component={ToolsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default function App() {
  const [splashAnimationComplete, setSplashAnimationComplete] = useState(false);

  useEffect(() => {
    // Hide native splash screen immediately, show our animated one
    SplashScreen.hideAsync();
  }, []);

  const handleSplashComplete = useCallback(() => {
    setSplashAnimationComplete(true);
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <NavigationContainer
            theme={{
              dark: true,
              colors: {
                primary: colors.accent,
                background: colors.main,
                card: colors.card, // #0f0f0f for tab bar
                text: colors.primary,
                border: colors.subtle,
                notification: colors.accent,
              },
              fonts: {
                regular: { fontFamily: 'monospace', fontWeight: '400' },
                medium: { fontFamily: 'monospace', fontWeight: '500' },
                bold: { fontFamily: 'monospace', fontWeight: '700' },
                heavy: { fontFamily: 'monospace', fontWeight: '900' },
              },
            }}
          >
            <TabNavigator />
          </NavigationContainer>
          <StatusBar style="light" />
          {!splashAnimationComplete && (
            <AnimatedSplash onComplete={handleSplashComplete} />
          )}
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
