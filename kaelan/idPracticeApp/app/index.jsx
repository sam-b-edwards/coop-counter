import { Link, Redirect } from "expo-router";
import { Text, View, SafeAreaView, StyleSheet, Pressable, TextInput } from "react-native";
import { useState } from "react";
import { userLoginInfo } from '@/constants/userLoginInfo'

export default function Index() {

  const [enteredUsername, changeUsername] = useState('')
  const [enteredPassword, changePassword] = useState('')
  const [redirect, changeRedirect] = useState(null)
  const [errorMessage, changeErrorMessage] = useState(null)

  const userSubmit = () => {
    if (enteredUsername.trim() && enteredPassword.trim()) {
      const selectedAccount = userLoginInfo.find(user => user.username === enteredUsername)
      if (selectedAccount && selectedAccount.password == enteredPassword) {
        changeRedirect(<Redirect href={{pathname: '[id]/idPage', params: { id: selectedAccount.id }}}/>)
      } else {
        console.error('Username or password incorrect')
        changeErrorMessage(<Text style={styles.errorText}>*Username or password is incorrect</Text>)
      }
    } else {
      console.error('Username or password not entered')
      changeErrorMessage(<Text style={styles.errorText}>*Please complete all fields</Text>)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.loginTitle}>Account login</Text>
      <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#777777"
          value={enteredUsername}
          onChangeText={changeUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#777777"
          value={enteredPassword}
          onChangeText={changePassword}
        />
        {errorMessage}
        <Pressable onPress={userSubmit} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Log in</Text>
        </Pressable>
        {redirect}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  pageLink: {
    fontSize: 25,
    backgroundColor: 'red',
    padding: 20,
    margin: 20,
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    borderRadius: 20
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    fontSize: 18,
    width: '60%',
    color: 'black',
    backgroundColor: 'white',
  },
  loginTitle: {
    fontSize: 32,
    marginTop: '50%'
  },
  submitButton: {
    backgroundColor: '#3074a4',
    marginTop: 45,
    padding: 15,
    width: '60%',
    borderRadius: 5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center'
  },
  errorText: {
    color: 'red',
    marginTop: 5,
    marginBottom: -25,
    height: 20,
  }
})