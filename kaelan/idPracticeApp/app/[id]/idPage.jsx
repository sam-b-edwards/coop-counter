import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { useLocalSearchParams, Link, Redirect } from 'expo-router'
import {userInfo} from '@/constants/userPageContents'
import { SafeAreaView } from 'react-native-safe-area-context'

const idPage = () => {
  const { id } = useLocalSearchParams()

    if (userInfo[id] == null) {
      return <Redirect replace href='../..' />
    } else {
      const dynamicStyles = StyleSheet.create({
        pageContainer: {
          flex: 1,
          backgroundColor: userInfo[id].favoriteColor,
          alignItems: 'center',
          padding: 20,
        },
      })
    return (
      <SafeAreaView style={dynamicStyles.pageContainer}>
        <View style={styles.userInfoContainer}>
          <Text style={[styles.userTitle, styles.text]}>Welcome {userInfo[id].name}!</Text>
          <Text style={[styles.text, styles.userText]}>- You're favorite color is <Text style={styles.bold}>{userInfo[id].favoriteColor}</Text></Text>
          <Text style={[styles.text, styles.userText]}>- You're favorite animal is a <Text style={styles.bold}>{userInfo[id].favoriteAnimal}</Text></Text>
          <Text style={[styles.text, styles.userText]}>- And you are <Text style={styles.bold}>{userInfo[id].age}</Text> years old</Text>
          <Text style={[styles.text, styles.userText]}>You're new password should be <Text style={styles.bold}>{userInfo[id].favoriteColor}{userInfo[id].favoriteAnimal}{userInfo[id].age}</Text></Text>
        </View>
        <Link replace style={[styles.link, styles.userInfoContainer]} href='../..'>Go Back</Link>
      </SafeAreaView>
      )
    }
}

export default idPage

const styles = StyleSheet.create({
  link: {
    marginTop: 20,
    fontSize: 25,
    color: 'white',
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold'
  },
  text: {
    color: '#f1f1f1'
  },
  userTitle: {
    fontSize: 24,
    marginBottom: 20
  },
  userText: {
    marginBottom: 10
  },
  userInfoContainer: {
    backgroundColor: '#1f1f1f99',
    paddingVertical: 25,
    paddingHorizontal: 35,
    borderRadius: 10    
  }
})