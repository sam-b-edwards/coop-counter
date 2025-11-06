import { View, Text, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { LineChart } from 'react-native-gifted-charts'
import Loading from '@/components/loading'

interface weeklyData{
    value: number
    label?: string
    date: string
    certainty: number
}


export default function analytics() {
    const [weeklyData, setWeeklyData] = useState<weeklyData[]>()
    const windowWidth = Dimensions.get('window').width
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [dataError, setDataError] = useState<boolean>(false)
    const [userData, setUserData] = useState<{totalChickens: number}>()
    const today = `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`
    const [min, setMin] = useState<number>(0)
    const [max, setMax] = useState<number>(0)

    const useRealData = false

    useEffect(() => {
        const userId = 6
        fetch(`http://coopcounter.comdevelopment.com/user/info?userId=${userId}`)
        .then(res => res.json())
        .then(data => data.error ? setDataError(true) : setUserData(data))

        if(useRealData) {
        fetch(`http://coopcounter.comdevelopment.com/user/images/averages/weekly?userId=${userId}&date=${today}`)
        .then(res => res.json())
        .then(data => {if(data.error) {
            setDataError(true) 
        } else {
            const tempData: weeklyData[] = []
            for (const item of data) {
                tempData.push({
                    value: item.chickenCount, 
                    date: item.dayOfWeek, 
                    // label: item.dayOfWeek.substring(0,3),
                    certainty: item.avg_certainty
                })
            }
            setWeeklyData(tempData)
        }})
    } else {
        const tempData: weeklyData[] = []
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        for (let i=0; i < 7; i++) {
            tempData.push({
                value: Math.floor(Math.random() * 8),  
                date: days[i], 
                certainty: Math.floor(Math.random() * 101)
            })
            setWeeklyData(tempData)
        }
    }
    }, [])
    useEffect(() => {
        if (weeklyData) {
            let highest = 0
            let lowest = 99999
            for (const day of weeklyData) {
                if (day.value > highest) {
                    highest = day.value
                }
                if (day.value < lowest) {
                    lowest = day.value
                }
            }
            setMax(highest)
            setMin(lowest)
        }
    }, [weeklyData])
  return weeklyData ? (
    <View className='px-4 pt-4 bg-white'>
        <Text className='text-2xl self-center font-bold tracking-wide mb-6'>Weekly Reports</Text>
        <Text className='text-xl font-semibold mb-2'>{weeklyData[selectedIndex]?.date || 'This Week'}</Text>
        <View className='flex flex-row gap-4'>
            <View>
                <Text className='text-sm font-light'>Avg Count</Text>
                <Text className='text-xl font-medium'>{weeklyData[selectedIndex]?.value || '0'}</Text>
            </View>
            <View>
                <Text className='text-sm font-light'>Certainty</Text>
                <Text className='text-xl font-medium'>{weeklyData[selectedIndex]?.certainty || '0'}%</Text>
            </View>
            <View>
                <Text className='text-sm font-light'>Min</Text>
                <Text className='text-xl font-medium'>{min || '0'}</Text>
            </View>
            <View>
                <Text className='text-sm font-light'>Max</Text>
                <Text className='text-xl font-medium'>{max || '0'}</Text>
            </View>
        </View>
        <LineChart 
        // curved
        adjustToWidth
        areaChart
        data={weeklyData}
        startFillColor='#22c55e'
        startOpacity={0.6}
        endFillColor='#22c55e'
        endOpacity={0.3}
        height={160}
        width={windowWidth*0.9}
        // spacing={windowWidth/weeklyData.length}
        initialSpacing={0}
        endSpacing={0}
        color='#22c55e'
        hideDataPoints
        pointerConfig={{
            radius: 4,
            pointerColor: '#22C55E',
            pointerStripColor: 'gray',
            persistPointer: true,
        }}
        noOfSections={2}
        getPointerProps={(pointerProps: { pointerIndex: number }) => setSelectedIndex(pointerProps.pointerIndex)}
        maxValue={userData?.totalChickens}
        rotateLabel
        yAxisSide={1}
        yAxisThickness={0}
        xAxisThickness={0}
        />
    </View>
  ) : (<></>)
}
