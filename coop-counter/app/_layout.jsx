// Basic imports
import React from 'react';
import { Tabs, Stack } from "expo-router"
import { SafeAreaProvider } from "react-native-safe-area-context";
// Colour pallete, Icons and header imports
import colors from '@/constants/colors'
import * as PhosphorIcons from 'phosphor-react-native';
import Header from '@/components/header'


export default function RootLayout() {
  // Tab bar icon size
  const iconSize = 30;

  return (
    // Safe area provider to keep everything within confines of the screen
    <SafeAreaProvider>
      {/* Header import as it is used on every page */}
      <Header/>
      
      <Tabs
      // Styling for the tab bar
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.gray,
          tabBarStyle: {
            boxShadow: '0px -2px 4px #00000025',
            height: 70,
            alignItems: 'center',
            flexDirection: 'row',
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginTop: -2,
          },
          headerShown: false,
        }}
      >
        {/* Dashboard tab */}
        <Tabs.Screen
          name='index'
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, focused }) => (
              // changes color and weight of icon if selected
              <PhosphorIcons.House color={color} size={iconSize} weight={focused ? "fill" : "regular"} />
            ),
          }}
        />
        {/* Scan tab */}
        <Tabs.Screen
          name='scan'
          options={{
            title: 'Scan',
            tabBarIcon: ({ color, focused }) => (
              <PhosphorIcons.Scan color={color} size={iconSize} weight={focused ? "fill" : "regular"} />
            ),
          }}
        />
        {/* Analytics tab */}
        <Tabs.Screen
          name='analytics'
          options={{
            title: 'Analytics',
            tabBarIcon: ({ color, focused }) => (
              <PhosphorIcons.ChartLine color={color} size={iconSize} weight={focused ? "fill" : "regular"} />
            ),
          }}
        />
        {/* Profile tab */}
        <Tabs.Screen
          name='profile'
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <PhosphorIcons.UserCircle color={color} size={iconSize} weight={focused ? "fill" : "regular"} />
            ),
          }}
        />

       
      </Tabs>
    </SafeAreaProvider>
  )
}
