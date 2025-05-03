import { StyleSheet, Text, View, Pressable, Image } from 'react-native'
import React, { useState } from 'react'
import * as PhosphorIcons from 'phosphor-react-native';
import colors from '@/constants/colors'
import { useRouter } from 'expo-router';

const index = () => {
  const router = useRouter()
  var count = 14
  var maxCount = 24
  var certainty = 98
  var lastScan = 'Today at 9:30 AM'
  const [isDoorOpen, setIsDoorOpen] = useState(true)

  return (
    <View style={{ backgroundColor: colors.backgroundPrimary, flex: 1 }}>
    <View>
      <View style={styles.countContainer}>
        <Text style={styles.countTitle}>Chickens Counted</Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: -10 }}>
          <Text style={[styles.countText, { fontSize: 86 , fontWeight: 'bold' }]}>{count}</Text>
          <Text style={[styles.countText, { fontSize: 36 , fontWeight: '600' }]}>/{maxCount}</Text>
        </View>
        <Text style={[styles.countText, { fontSize: 22, fontWeight: '600', marginTop: -15 }]}>{certainty}% Certainty</Text>

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

      <View style={styles.widgetContainer}>
        <View style={[styles.widget, { backgroundColor: '#000000' }]}>
          <Image source={require('@/assets/images/cameraPlaceholder.jpg')} style={styles.coopPreview}/>
          <View style={styles.widgetInfo}>
            <Text style={styles.widgetText}>Coop</Text>
            <View style={{ flexDirection: 'row' }}>
              <PhosphorIcons.WifiHigh color={colors.backgroundPrimary} size={20} weight={'regular'} style={{ marginRight: 5 }}/>
              <PhosphorIcons.BatteryHigh color={colors.backgroundPrimary} size={20} weight={'regular'} />
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.widgetContainer}>
        <View style={[styles.widget, { backgroundColor: colors.ctaSecondary }]}>
          <Pressable style={[styles.doorControl, isDoorOpen ? { backgroundColor: colors.cta } : { backgroundColor: colors.textSecondary }]}
            onPress={() => {
              setIsDoorOpen(!isDoorOpen)
            }}>
            <View style={[styles.doorControlCircle, isDoorOpen ? { right: 20 } : { left: 20 }]}/>
            <Text style={[styles.doorControlText, isDoorOpen ? { marginLeft: 60 } : { marginLeft: 110 }]}>{isDoorOpen ? 'OPEN' : 'CLOSED'}</Text>
          </Pressable>
          <View style={styles.widgetInfo}>
            <Text style={styles.widgetText}>Door Control</Text>
            <View style={{ flexDirection: 'row' }}>
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
    color: colors.primary,
  },
  lastScanText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 40,
  },
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