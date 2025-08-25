import { View, Text, Image, Pressable, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { PencilSimpleLineIcon, CaretRightIcon, ChartBarIcon, GearIcon, ScanIcon, HeadsetIcon, SignOutIcon } from 'phosphor-react-native'
import banner from '@/assets/images/banner.jpg'
import pfp from '@/assets/images/pfp.png'
import Loading from '@/components/loading'

interface userData{
    email: string
    name: string
}

export default function profile() {
    const [userData, setUserData] = useState<userData>()
    const [dataError, setDataError] = useState<boolean>(false)

    useEffect(() => {
        const userId = 6
        fetch(`http://coopcounter.comdevelopment.com/user/info?userId=${userId}`)
        .then(res => res.json())
        .then(data => data.error ? setDataError(true) : setUserData(data))
    }, [])

  return userData ? (
    <ScrollView className='flex-1 bg-white' showsVerticalScrollIndicator={false}>
      <Image source={banner} className='w-full h-44' />
      <View className='h-40 w-40 overflow-hidden rounded-full self-center mt-[-80px] border-[3px] border-white relative'>
        <Image source={pfp} className='h-full w-full' />
        <Pressable onPress={() => console.log('edit pfp')} className='absolute bottom-[-1px] self-center p-2 bg-sky-950 rounded-full border-[3px] border-white'>
            <PencilSimpleLineIcon color='white' size={20} />
        </Pressable>
      </View>
      <Text className='self-center text-3xl font-bold mt-6'>{userData.name}</Text>
      <Text className='bg-gray-100 rounded p-2 self-center mt-2'>{userData.email}</Text>

      <View className='border-t-[1px] border-gray-300 mt-10'>
        <Pressable className='px-6 flex flex-row h-20 items-center gap-4'>
            <PencilSimpleLineIcon size={28} />
            <Text className='text-2xl'>Edit Profile</Text>
            <View className='ml-auto'>
                <CaretRightIcon size={28} />
            </View>
        </Pressable>

        <Pressable className='px-6 flex flex-row h-20 items-center gap-4'>
            <ChartBarIcon size={28} />
            <Text className='text-2xl'>Account Statistics</Text>
            <View className='ml-auto'>
                <CaretRightIcon size={28} />
            </View>
        </Pressable>

        <Pressable className='px-6 flex flex-row h-20 items-center gap-4'>
            <GearIcon size={28} />
            <Text className='text-2xl'>Settings</Text>
            <View className='ml-auto'>
                <CaretRightIcon size={28} />
            </View>
        </Pressable>

        <Pressable className='px-6 flex flex-row h-20 items-center gap-4'>
            <ScanIcon size={28} />
            <Text className='text-2xl'>Scanning Preferences</Text>
            <View className='ml-auto'>
                <CaretRightIcon size={28} />
            </View>
        </Pressable>

        <Pressable className='px-6 flex flex-row h-20 items-center gap-4'>
            <HeadsetIcon size={28} />
            <Text className='text-2xl'>Help and FAQ</Text>
            <View className='ml-auto'>
                <CaretRightIcon size={28} />
            </View>
        </Pressable>

        <Pressable className='px-6 flex flex-row h-20 items-center gap-4'>
            <SignOutIcon size={28} color='#ef4444' />
            <Text className='text-2xl text-red-500'>Log Out</Text>
            <View className='ml-auto'>
                <CaretRightIcon size={28} color='#ef4444' />
            </View>
        </Pressable>
      </View>
    </ScrollView>
  ) : (<Loading />)
}

