import React from 'react';
import { Tabs } from "expo-router"
import Icon from '@expo/vector-icons/Ionicons'
import { SafeAreaProvider } from "react-native-safe-area-context";


export default function TabLayout() {
    return (
        <SafeAreaProvider>
            <Tabs>
              <Tabs.Screen 
              name='index' 
              options={{
                title: 'Clicker',
                tabBarIcon: ({ color }) => <Icon size={22} name='cash' color={color} />
                }}
            />
              <Tabs.Screen 
              name='shop' 
              options={{
                title: 'Shop',
                tabBarIcon: ({ color }) => <Icon size={22} name='storefront' color={color} />
                }}
            />
            </Tabs>
        </SafeAreaProvider>
    )
}