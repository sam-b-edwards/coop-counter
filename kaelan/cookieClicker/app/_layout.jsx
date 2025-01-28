import React from 'react';
import { Stack, Tabs } from "expo-router"
import { Icon } from "@expo/vector-icons/MaterialIcons"
import { SafeAreaProvider } from "react-native-safe-area-context";


export default function TabLayout() {
    return (
        <SafeAreaProvider>
            <Stack>
              <Stack.Screen name='index' options={{title: 'Clicker'}}/>
              <Stack.Screen name='shop' options={{title: 'Shop'}}/>
            </Stack>
        </SafeAreaProvider>
    )
}