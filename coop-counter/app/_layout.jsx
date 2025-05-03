import React from 'react';
import { Tabs } from "expo-router"
import { SafeAreaProvider } from "react-native-safe-area-context";
import colors from '@/constants/colors'
import * as PhosphorIcons from 'phosphor-react-native';
import Header from '@/components/header'

export default function RootLayout() {
  const iconSize = 30;

  return (
    <SafeAreaProvider>
      <Header/>
      <Tabs
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
        <Tabs.Screen
          name='index'
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, focused }) => (
              <PhosphorIcons.House color={color} size={iconSize} weight={focused ? "fill" : "regular"} />
            ),
          }}
        />
        <Tabs.Screen
          name='scan'
          options={{
            title: 'Scan',
            tabBarIcon: ({ color, focused }) => (
              <PhosphorIcons.Scan color={color} size={iconSize} weight={focused ? "fill" : "regular"} />
            ),
          }}
        />
        <Tabs.Screen
          name='analytics'
          options={{
            title: 'Analytics',
            tabBarIcon: ({ color, focused }) => (
              <PhosphorIcons.ChartLine color={color} size={iconSize} weight={focused ? "fill" : "regular"} />
            ),
          }}
        />
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
