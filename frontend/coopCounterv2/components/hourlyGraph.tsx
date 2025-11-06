import { View, Text, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { LineChart } from 'react-native-gifted-charts'
import Loading from '@/components/loading'

interface hourlyData{
    value: number
    label?: string
    date: string
    certainty: number
}


export default function analytics() {
    const [hourlyData, setHourlyData] = useState<hourlyData[]>()
    const windowWidth = Dimensions.get('window').width
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [dataError, setDataError] = useState<boolean>(false)
    const [userData, setUserData] = useState<{totalChickens: number}>()
    const today = `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`
    const [min, setMin] = useState<number>(0)
    const [max, setMax] = useState<number>(0)
    const hours = [
        '12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM',
        '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
        '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
        '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'
    ]

    const useRealData = false

    useEffect(() => {
        const userId = 6
        fetch(`http://coopcounter.comdevelopment.com/user/info?userId=${userId}`)
        .then(res => res.json())
        .then(data => data.error ? setDataError(true) : setUserData(data))

        if(useRealData) {
        fetch(`http://coopcounter.comdevelopment.com/user/images/averages/hourly?userId=${userId}&date=${today}`)
        .then(res => res.json())
        .then(data => {if(data.error) {
            setDataError(true) 
        } else {
            const tempData: hourlyData[] = []
            for (let i = 0; i < data.length; i++) {
                const workingData: hourlyData = {
                    value: data[i].chickenCount, 
                    date: new Date('1970-01-01T' + data[i].time + 'Z').toLocaleTimeString([], {hour:'numeric', minute:'numeric', timeZone:'utc'}), 
                    certainty: data[i].certainty,
                }
                i % 6 === 0 ? workingData['label'] = `${hours[i].split(':')[0]} ${hours[i].split(' ')[1]}` : ''
                tempData.push(workingData)
            }
            setHourlyData(tempData)
        }})
    } else {
        const tempData: hourlyData[] = []
        for (let i = 0; i < hours.length; i++) {
            const data: hourlyData = {
                value: Math.floor(Math.random() * 8),  
                date: hours[i], 
                certainty: Math.floor(Math.random() * 101),
            }
            i % 6 === 0 ? data['label'] = `${hours[i].split(':')[0]} ${hours[i].split(' ')[1]}` : ''
            tempData.push(data)
        }
        setHourlyData(tempData)
    }
    }, [])
    useEffect(() => {
        if (hourlyData) {
            let highest = 0
            let lowest = 99999
            for (const day of hourlyData) {
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
    }, [hourlyData])
  return hourlyData ? (
    <View className='px-4 pt-4 bg-white'>
        <Text className='text-2xl self-center font-bold tracking-wide mb-6'>Weekly Reports</Text>
        <Text className='text-xl font-semibold mb-2'>{hourlyData[selectedIndex]?.date || 'Today'}</Text>
        <View className='flex flex-row gap-4'>
            <View>
                <Text className='text-sm font-light'>Avg Count</Text>
                <Text className='text-xl font-medium'>{hourlyData[selectedIndex]?.value || '0'}</Text>
            </View>
            <View>
                <Text className='text-sm font-light'>Certainty</Text>
                <Text className='text-xl font-medium'>{hourlyData[selectedIndex]?.certainty || '0'}%</Text>
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
        data={hourlyData}
        startFillColor='#22c55e'
        startOpacity={0.6}
        endFillColor='#22c55e'
        endOpacity={0.3}
        height={160}
        width={windowWidth*0.9}
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
        // rotateLabel
        yAxisSide={1}
        yAxisThickness={0}
        xAxisThickness={0}
        xAxisLabelTextStyle={{ fontSize: 12, width: 40 }}
        />
    </View>
  ) : (<></>)
}
