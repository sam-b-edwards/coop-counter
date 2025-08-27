import { View, Text, ScrollView, Dimensions, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { LineChart } from 'react-native-gifted-charts'
import Loading from '@/components/loading'
import WeeklyGraph from '@/components/weeklyGraph'
import HourlyGraph from '@/components/hourlyGraph'


export default function analytics() {
    
  return (
    <ScrollView className='flex-1 bg-gray-100 my-[1px]' showsVerticalScrollIndicator={false}>
        <View className='flex gap-1'>
            <WeeklyGraph />
            <HourlyGraph />
        </View>
    </ScrollView>
  )
}
