// Basic imports
import { StyleSheet, Text, View, Pressable, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'expo-router';
import { fetchData } from "../api/apiQuery";
// Import color pallet and icons
import * as PhosphorIcons from 'phosphor-react-native';
import colors from '@/constants/colors'

const index = () => {
  const userId = 6
  const endpointLatest = `user/images/latest?userId=${userId}`
  const endpointUser = `user/info?userId=${userId}`
  const [latestData, setLatestData] = useState(null)
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    handleSearch()
    
  }, [])

  useEffect(() => {
    if (userData !== null) {
      try {
        setMaxCount(userData.totalChickens)
      }
      catch (error) {
        console.log(error)
      }
    }
  }, [userData])

  useEffect(() => {
    if (latestData !== null) {
      try {
      setCount(latestData.chickenCount)
      setCertainty(latestData.certainty)

      const timestamp = latestData.ai_predicted_at.split('T')
      const date = timestamp[0].split('-')
      const time = timestamp[1].split(':')

      const event = new Date(date[0], date[1] - 1, date[2], time[0], time[1], time[2])
      const formattedTimestamp = event.toLocaleString("UTC", {timezone: 'UTC'}).split(', ')
      const displayedTime = [0,1].map(index => formattedTimestamp[1].split(':')[index]).join(':') + ' ' + formattedTimestamp[1].split(' ')[1]

      const currentDate = new Date().toLocaleString("UTC", {timezone: 'UTC'}).split(', ')[0]

      if (formattedTimestamp[0] == currentDate) {
        setLastScan(`Today ${displayedTime}`)
      } else {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        dateMonth = monthNames[formattedTimestamp[0].split('/')[0]-1]
        setLastScan(`${dateMonth} ${formattedTimestamp[0].split('/')[1]}, ${displayedTime}`)
      }

      setLastScanImage(latestData.original_url)
      }

      catch (error) {
        console.error(error)
      }
      
    }
  }, [latestData])

  const handleSearch = async () => {
    try {
      const resultLatest = await fetchData(endpointLatest);
      setLatestData(resultLatest)
      const resultUser = await fetchData(endpointUser);
      setUserData(resultUser)
    }
    catch (error) {
      throw error
    }
  }

  const router = useRouter()
  // Variables for dashboard display and interractions
  const [maxCount, setMaxCount] = useState('?')
  const [certainty, setCertainty] = useState('?')
  const [lastScan, setLastScan] = useState('?')
  const [lastScanImage, setLastScanImage] = useState(null)
  const [isDoorOpen, setIsDoorOpen] = useState(true)
  const [count, setCount] = useState('?')

  
  return (
    // Main container for dashboard (flex 1 to take up all space)
    <View style={{ backgroundColor: colors.backgroundPrimary, flex: 1}}>
    <View>
      {/* Chicken count display */}
      <View style={styles.countContainer}>
        <Text style={styles.countTitle}>Chickens Counted</Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: -10 }}>
          {/* Count */}
          <Text style={[styles.countText, { fontSize: 86 , fontWeight: 'bold' }]}>{count}</Text>
          <Text style={[styles.countText, { fontSize: 36 , fontWeight: '600' }]}>/{maxCount}</Text>
        </View>
        <Text style={[styles.countText, { fontSize: 22, fontWeight: '600', marginTop: -15 }]}>{certainty}% Certainty</Text>

        {/* Scan display + link to scan page */}
        <Text style={styles.lastScanText}>Last scan: {lastScan}</Text>
        <Pressable 
          style={styles.linkContainer}
          onPress={() => {
            router.push('/scan')
          }}>
          <Text style={styles.link}>Scan Now</Text>
          <PhosphorIcons.Scan color={colors.cta} size={20} weight={'fill'} />
        </Pressable>
      </View>

      {/* Coop view widget */}
      <View style={styles.widgetContainer}>
        {/* Black background for overlay shadow effect */}
        <View style={[styles.widget, { backgroundColor: '#000000' }]}>
          <Image source={lastScanImage} style={styles.coopPreview}/>
          <View style={styles.widgetInfo}>
            <Text style={styles.widgetText}>Coop</Text>
            <View style={{ flexDirection: 'row' }}>
              {/* widget status */}
              <PhosphorIcons.WifiHigh color={colors.backgroundPrimary} size={20} weight={'regular'} style={{ marginRight: 5 }}/>
              <PhosphorIcons.BatteryHigh color={colors.backgroundPrimary} size={20} weight={'regular'} />
            </View>
          </View>
        </View>
      </View>
      
      {/* door control widget */}
      <View style={styles.widgetContainer}>
        <View style={[styles.widget, { backgroundColor: colors.ctaSecondary }]}>
          {/* Door control switch */}
          <Pressable style={[styles.doorControl, isDoorOpen ? { backgroundColor: colors.cta } : { backgroundColor: colors.textSecondary }]}
            onPress={() => {
              // inverses door state
              setIsDoorOpen(!isDoorOpen)
            }}>
              {/* State text + switch side */}
            <View style={[styles.doorControlCircle, isDoorOpen ? { right: 20 } : { left: 20 }]}/>
            <Text style={[styles.doorControlText, isDoorOpen ? { marginLeft: 60 } : { marginLeft: 110 }]}>{isDoorOpen ? 'OPEN' : 'CLOSED'}</Text>
          </Pressable>
          <View style={styles.widgetInfo}>
            <Text style={styles.widgetText}>Door Control</Text>
            <View style={{ flexDirection: 'row' }}>
              {/* widget status */}
              <PhosphorIcons.WifiHigh color={colors.backgroundPrimary} size={20} weight={'regular'} style={{ marginRight: 5 }}/>
              <PhosphorIcons.BatteryHigh color={colors.backgroundPrimary} size={20} weight={'regular'} />
            </View>
          </View>
        </View>
      </View>


    </View>
    </View>
  
)}

export default index

const styles = StyleSheet.create({
  // scan now link styles
  link: {
    color: colors.cta,
    fontSize: 16,
    paddingRight: 5,
    marginTop: -2,
  },
  linkContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  lastScanText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 40,
  },

  // chicken count styles
  countContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  countTitle: {
    fontSize: 26,
    fontColor: colors.textPrimary,
  },
  countText: {
    color: colors.primary
  },

  // widget styles
  widgetContainer: {
    paddingHorizontal: 15,
    marginTop: 10,
  },
  widget: {
    width: 'auto',
    height: 220,
    borderRadius: 5,
    overflow: 'hidden',
  },
  widgetText: {
    color: colors.backgroundPrimary,
    fontSize: 20,
    marginBottom: 4,
  },
  widgetInfo: {
    position: 'absolute',
    bottom: 10,
    left: 10,
  },
  coopPreview: {
    height: '100%',
    width: '100%',
    opacity: 0.8,
  },

  // door control styles
  doorControl: {
    height: 120,
    width: 300,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.backgroundPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 30,
    boxShadow: '2px 4px 4px #00000050',
  },
  doorControlCircle: {
    height: 80,
    width: 80,
    borderRadius: 100,
    backgroundColor: colors.backgroundPrimary,
    position: 'absolute',
    top: 20,
  },
  doorControlText: {
    color: colors.backgroundPrimary,
    fontSize: 42,
    fontWeight: 'bold',
  }
})