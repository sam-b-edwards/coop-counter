import { Text, View, Image, Pressable, ScrollView, TextInput } from "react-native";
import React, { useState } from 'react'
import * as SecureStore from 'expo-secure-store'



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
    fetch('http://coopcounter.comdevelopment.com/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginInfo)
    })
    .then(res => res.ok ? res.json() : res.status === 401 ? setInvalidLogin(true) : console.error('error code:', res.status))
    .then(data => save('user', data.user.id))
    }
    

    const handleLoginSubmit = () => {
        const loginInfo = {
            email: inputEmail,
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
                    />
                </View>
                <View className='mt-6 flex gap-2'>
                    <Text className='text-xl'>Password</Text>
                    <TextInput 
                        className={['border-[1px] rounded py-2 px-4 text-[20px] h-12', invalidLogin ? 'border-red-500' : 'border-gray-400'].join(' ')}
                        onChangeText={onChangePassword}
                        value={inputPassword}
                    /> 
                </View>
                <Pressable onPress={handleLoginSubmit} className='bg-green-500 py-3 rounded-full items-center w-[100%] self-center mt-auto'>
                    <Text className='text-white text-xl'>Log in</Text>
                </Pressable>
            </View>
    )
}