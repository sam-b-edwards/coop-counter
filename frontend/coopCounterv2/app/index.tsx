import { Text, View, Image, Pressable, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { ScanIcon, WifiHighIcon, BatteryHighIcon } from "phosphor-react-native";
import { useRouter } from "expo-router";
import Loading from '@/components/loading'
import * as SecureStore from 'expo-secure-store'
import { fetchWithDemo } from '@/utils/demoData'


interface coopData {
  ai_predicted_at: Date
  certainty: number
  chickenCount: number
  original_url: string
  uploaded_at: Date
}
interface userData {
  totalChickens: number
}

export default function dashboard() {
  const [coopData, setCoopData] = useState<coopData>()
  const [userData, setUserData] = useState<userData>()
  const [dataError, setDataError] = useState<boolean>(false)
  const [lastScan, setLastScan] = useState<string>('')
  const [isDoorOpen, setIsDoorOpen] = useState<boolean>(false)
  const [userId, setUserId] = useState<string>()
  let router = useRouter()

  async function getValueFor(key: string) {
    let result = await SecureStore.getItemAsync(key)
    if (result) {
      setUserId(result)
    } else {
      setUserId(undefined)
    }
  }
  getValueFor('user')

  useEffect(() => {
    if(userId) {
    fetchWithDemo(`http://coopcounter.comdevelopment.com/user/images/latest?userId=${userId}`, userId)
      .then(res => res.json())
      .then(data => data.error ? setDataError(true) : setCoopData(data))
    fetchWithDemo(`http://coopcounter.comdevelopment.com/user/info?userId=${userId}`, userId)
      .then(res => res.json())
      .then(data => data.error ? setDataError(true) : setUserData(data))
    }
  }, [userId])

  useEffect(() => {
    if (coopData?.ai_predicted_at) {
      const lastScan = new Date(coopData.ai_predicted_at)
      const time = lastScan.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'utc' })
      const today = new Date()

      let preTime = ''
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      if(lastScan.getFullYear()  === today.getFullYear() && lastScan.getMonth() === today.getMonth() && lastScan.getDate() === today.getDate()-1) {
        preTime = 'Today'
      } else {
        preTime = `${months[lastScan.getMonth()]} ${lastScan.getDate()}`
      }
      const displayLastScan = `${preTime}, ${time}`
      setLastScan(displayLastScan)
    } 
  }, [coopData])

  return userData && coopData ? (
    <ScrollView className='flex-1 bg-white px-4' showsVerticalScrollIndicator={false}>
      <View className='items-center mb-10'>
        <Text className='text-3xl tracking-wider mt-4'>Chickens Counted</Text>
        <View className='flex flex-row items-baseline'>
          <Text className='text-[90px] font-bold text-green-500'>{coopData.chickenCount}</Text>
          <Text className='text-3xl font-bold text-green-500'>/{userData.totalChickens}</Text>
        </View>
        <Text className='text-green-500 text-2xl font-semibold mt-[-16px]'>{coopData.certainty}% Certainty</Text>
        <Text className='text-lg mt-8'>Last Scan: {lastScan}</Text>
        <Pressable onPress={() =>router.push('/scan')} className='flex flex-row items-center gap-1'>
          <Text className='text-lg text-blue-500 mb-2'>Scan Now</Text>
          <ScanIcon size={22} color="#3b82f6"/>
        </Pressable>

        <Pressable onPress={() => router.push('/camera-stream')} className='w-full h-56 rounded-xl overflow-hidden relative my-1 bg-black'>
          <Image source={{ uri: coopData.original_url }} className="w-full h-full" />
          <View className="absolute bottom-2 left-4">
            <Text className='text-white text-xl font-medium'>Coop</Text>
            <View className='flex flex-row gap-2'>
              <WifiHighIcon color="white" size={18} />
              <BatteryHighIcon color="white" size={18} />
            </View>
          </View>
        </Pressable>
        
        <View className='w-full h-56 rounded-xl overflow-hidden relative my-1 bg-slate-500'>

          <Pressable onPress={() => setIsDoorOpen(!isDoorOpen)} className={['relative self-center gap-0 flex flex-row items-center w-[80%] h-28 rounded-full p-4 mt-[10%] border-[1px] border-white shadow', isDoorOpen ? 'bg-gray-600' : 'bg-blue-500'].join(' ')}>
            <Text className={['absolute text-white text-[42px] font-bold tracking-widest', isDoorOpen ? 'right-6' : 'left-14'].join(' ')}>{isDoorOpen? 'CLOSED' : 'OPEN'}</Text>
            <View className={['absolute h-20 w-20 bg-white rounded-full', isDoorOpen ? 'left-4' : 'right-4'].join(' ')} />
          </Pressable>

          <View className="absolute bottom-2 left-4">
            <Text className='text-white text-xl font-medium'>Door Control</Text>
            <View className='flex flex-row gap-2'>
              <WifiHighIcon color="white" size={18} />
              <BatteryHighIcon color="white" size={18} />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  ) : (<Loading />)
}
