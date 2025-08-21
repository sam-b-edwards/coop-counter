import '../global.css'
import { Tabs } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { HouseIcon, ScanIcon, ChartLineIcon, UserCircleIcon } from 'phosphor-react-native'
import Header from '@/components/header'


export default function RootLayout() {
  return (
    <SafeAreaProvider>
      
        <Header/>

        <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#22c55e',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
          tabBarStyle: {
            boxShadow: '0px -2px 4px #00000025',
            paddingTop: 5,
            marginBottom: -5,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginTop: -2
          }
        }}
        >
          {/* dashboard */}
          <Tabs.Screen
            name='index'
            options={{
              title: 'Dashboard',
              tabBarIcon: ({color, focused}) => (
              <HouseIcon color={color} size={26} weight={focused ? 'fill': 'regular'} />
            )
            }}
          />
          {/* scan */}
          <Tabs.Screen
            name='scan'
            options={{
              title: 'Scan',
              tabBarIcon: ({color, focused}) => (
              <ScanIcon color={color} size={26} weight={focused ? 'fill': 'regular'} />
            )
            }}
          />
          {/* analytics */}
          <Tabs.Screen
            name='analytics'
            options={{
              title: 'Analytics',
              tabBarIcon: ({color, focused}) => (
              <ChartLineIcon color={color} size={26} weight={focused ? 'fill': 'regular'} />
            )
            }}
          />
          {/* profile */}
          <Tabs.Screen
            name='profile'
            options={{
              title: 'Profile',
              tabBarIcon: ({color, focused}) => (
              <UserCircleIcon color={color} size={26} weight={focused ? 'fill': 'regular'} />
            )
            }}
          />

        </Tabs>
      
    </SafeAreaProvider>
  )
}
