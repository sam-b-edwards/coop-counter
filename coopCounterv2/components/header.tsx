import { View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import pfp from '@/assets/images/pfp.png'
import { CaretDownIcon, BellIcon } from "phosphor-react-native";
import { useEffect, useState } from "react";

// type decleration
interface userInfo {
    name: string
}

export default function header() {
    const [userData, setUserData] = useState<userInfo>()
    useEffect(() => {
        const userId = 6
        fetch(`http://coopcounter.comdevelopment.com/user/info?userId=${userId}`)
          .then(res => res.json())
          .then(data => setUserData(data))
      }, [])
    return(
        <SafeAreaView className='flex flex-row px-6 pb-4 mb-[-34px] items-center'>
            <Image source={pfp} className='h-14 w-14 rounded-full'/>

            <View className="flex flex-row ml-4 gap-1">
                <Text className='text-xl font-medium tracking-wider'>{userData ? userData.name.split(' ')[0]: ''}'s Coop</Text>
                <View className='mt-1'>
                    <CaretDownIcon size={20} />  
                </View>
            </View>
            
            <View className='ml-auto'>
                <BellIcon size={24} />
            </View>
        </SafeAreaView>
    )
}