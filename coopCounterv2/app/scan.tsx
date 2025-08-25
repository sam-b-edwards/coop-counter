import { View, Text, Image, Pressable } from 'react-native'
import { SlidersIcon, ScanIcon, CameraIcon, WifiHighIcon, BatteryHighIcon } from 'phosphor-react-native'
import React, { useEffect, useState } from 'react'
import Loading from '@/components/loading'

interface coopData{
    original_url: string
}

export default function scan() {
    const [coopData, setCoopData] = useState<coopData>()
    const [dataError, setDataError] = useState<boolean>(false)
    useEffect(() => {
        const userId = 6
        fetch(`http://coopcounter.comdevelopment.com/user/images/latest?userId=${userId}`)
        .then(res => res.json())
        .then(data => data.error ? setDataError(true) : setCoopData(data))
    }, [])
  return coopData ? (
    <View className='flex-1 bg-white'>
      <View className='bg-[#22c55eb6] relative items-center w-fill pt-8'>
        <Pressable className='absolute top-4 right-4'>
            <SlidersIcon size={24} weight='fill' color='white' />
        </Pressable>
        <ScanIcon size={140} color='white' weight='fill'/>
        <Text className='text-white text-xl mt-2'>Choose an option for a</Text>
        <Text className='text-white text-4xl font-bold'>Manual Scan</Text>
        <View className='flex flex-row mt-2 mb-14'>
            <Text className='text-white text-lg font-light italic'>or wait for an automatic scan at </Text>
            <Text className='text-white text-lg font-semibold'>9:35</Text>
        </View>

      </View>
        <Pressable onPress={() => console.log('camera')} className='rounded-full gap-2 bg-blue-500 w-1/2 h-16 flex flex-row items-center justify-center self-center mt-[-2rem]'>
            <CameraIcon color='white' size={32} />
            <Text className='text-white text-xl tracking-wide'>Use Camera</Text>
        </Pressable>
        <View className='border-b-[1px] w-2/5 self-center items-center border-gray-400 mt-6'>
            <Text className='mb-[-12px] bg-white px-4 text-lg font-light text-gray-400'>or</Text>
        </View>
        <Text className='self-center mt-6 text-xl font-medium tracking-wider'>Capture from Coop</Text>

        <View className='mx-4 h-56 rounded-xl overflow-hidden relative mt-6 bg-black'>
        <Image source={{ uri: coopData.original_url }} className="w-full h-full" />
        <View className="absolute bottom-2 left-4">
          <Text className='text-white text-xl font-medium'>Coop</Text>
          <View className='flex flex-row gap-2'>
            <WifiHighIcon color="white" size={18} />
            <BatteryHighIcon color="white" size={18} />
          </View>
        </View>
      </View>
    </View>
  ) : (<Loading/>)
}

