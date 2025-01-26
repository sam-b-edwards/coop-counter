import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react'


const contact = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Contact Us</Text>

      <View style={styles.group}>
        <Text style={styles.subHeading}>Email us at</Text>
        <Text style={styles.text}>hello@coffeeshop.com</Text>
      </View>

      <View style={styles.group}>
        <Text style={styles.subHeading}>Call us at</Text>
        <Text style={styles.text}>+1 234 567 890</Text>
      </View>

    </SafeAreaView>
  )
}

export default contact

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#726666',
  },
  title: {
    color: 'orange',
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subHeading: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  text: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  group: {
    marginTop: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
  },
})
