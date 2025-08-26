import { View, Text, ScrollView, Dimensions, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { LineChart } from 'react-native-gifted-charts'
import Loading from '@/components/loading'

interface weeklyData{
    value: number
    label: string
    date: string
}


export default function analytics() {
    const [weeklyData, setWeeklyData] = useState<weeklyData[]>()
    const windowWidth = Dimensions.get('window').width
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [dataError, setDataError] = useState<boolean>(false)
    const [userData, setUserData] = useState<{totalChickens: number}>()
    const today = `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`

    useEffect(() => {
        const userId = 6
        fetch(`http://coopcounter.comdevelopment.com/user/info?userId=${userId}`)
        .then(res => res.json())
        .then(data => data.error ? setDataError(true) : setUserData(data))
        fetch(`http://coopcounter.comdevelopment.com/user/images/weekly?userId=${userId}&date=2025-06-27`)
        .then(res => res.json())
        .then(data => {if(data.error) {
            setDataError(true) 
        } else {
            const tempData: weeklyData[] = []
            for (const item of data) {
                tempData.push({
                    value: item.chickenCount, 
                    date: item.dayOfWeek, 
                    label: item.dayOfWeek.substring(0,3)
                })
            }
            setWeeklyData(tempData)
        }})
    }, [])
    useEffect(() => {
        if (weeklyData) {
            console.log(weeklyData[selectedIndex])
        }
    }, [selectedIndex])
  return weeklyData ? (
    <ScrollView className='flex-1 bg-white' showsVerticalScrollIndicator={false}>
        <LineChart 
        areaChart
        data={weeklyData}
        startFillColor='#22c55e'
        startOpacity={0.6}
        endFillColor='#22c55e'
        endOpacity={0.3}
        height={160}
        width={windowWidth*0.8}
        // spacing={windowWidth/weeklyData.length}
        initialSpacing={0}
        endSpacing={0}
        color='#22c55e'
        hideDataPoints
        pointerConfig={{
            radius: 4,
            pointerColor: '#22C55E',
            pointerStripColor: 'gray',
            persistPointer: true
        }}
        noOfSections={2}
        getPointerProps={(pointerProps: { pointerIndex: number }) => setSelectedIndex(pointerProps.pointerIndex)}
        maxValue={userData?.totalChickens}
        rotateLabel
        />
    </ScrollView>
  ) : (<Loading />)
}
