import { Text, View, Image, Pressable, ScrollView, TextInput } from "react-native";
import React, { useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import { DEMO_ACCOUNT, API_URL } from '../config'

export default function LogIn({checkLoggedIn} : { checkLoggedIn: () => void}) {
    const [inputEmail, onChangeEmail] = useState<string>('')
    const [inputPassword, onChangePassword] = useState<string>('')
    const [invalidLogin, setInvalidLogin] = useState<boolean>(false)

    async function save(key: string, value: number) {
        await SecureStore.setItemAsync(key, String(value))
        checkLoggedIn()
        onChangePassword('')
    }

    function logIn(loginInfo: { email: string, password: string }) {
    console.log('Login attempt with email:', loginInfo.email)

    // Check for demo account credentials
    if (loginInfo.email === DEMO_ACCOUNT.email && loginInfo.password === DEMO_ACCOUNT.password) {
        console.log('Demo account login - bypassing backend')
        save('user', DEMO_ACCOUNT.userId)
        return
    }

    // Regular backend login
    fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginInfo)
    })
    .then(res => {
        console.log('Response status:', res.status)
        if (res.ok) {
            return res.json()
        } else if (res.status === 401) {
            setInvalidLogin(true)
            console.log('Invalid login credentials')
            return null
        } else {
            console.error('Error code:', res.status)
            return null
        }
    })
    .then(data => {
        console.log('Data received:', data)
        if (data && data.user && data.user.id) {
            save('user', data.user.id)
        }
    })
    .catch(err => console.error('Fetch error:', err))
    }


    const handleLoginSubmit = () => {
        console.log('Login button pressed')
        const loginInfo = {
            email: inputEmail.trim(),  // Removed toLowerCase() so you can type capital S
            password: inputPassword
        }
        logIn(loginInfo)
    }
    return (
            <View className='bg-white w-3/4 self-center mt-[30vh] h-[40vh] p-5'>
                <Text className='text-4xl font-medium self-center'>Log in</Text>
                <View className='mt-6 flex gap-2'>
                    <Text className='text-xl'>Email</Text>
                    <TextInput
                        className={['border-[1px] rounded py-2 px-4 text-[20px] h-12', invalidLogin ? 'border-red-500' : 'border-gray-400'].join(' ')}
                        onChangeText={onChangeEmail}
                        value={inputEmail}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                    />
                </View>
                <View className='mt-6 flex gap-2'>
                    <Text className='text-xl'>Password</Text>
                    <TextInput
                        className={['border-[1px] rounded py-2 px-4 text-[20px] h-12', invalidLogin ? 'border-red-500' : 'border-gray-400'].join(' ')}
                        onChangeText={onChangePassword}
                        value={inputPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        secureTextEntry={true}
                    />
                </View>
                <Pressable onPress={handleLoginSubmit} className='bg-green-500 py-3 rounded-full items-center w-[100%] self-center mt-auto'>
                    <Text className='text-white text-xl'>Log in</Text>
                </Pressable>
                <Text className='text-gray-500 text-xs text-center mt-2'>
                    Demo: demo@coopcounter.app / demo123
                </Text>
            </View>
    )
}