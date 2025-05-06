import { StyleSheet, Text, View, Pressable, Image } from 'react-native'
import React from 'react'
import * as PhosphorIcons from 'phosphor-react-native'
import colors from '@/constants/colors'

const scan = () => {
  return (
    <View style={{ backgroundColor: colors.backgroundPrimary, flex: 1 }}>
      <View style={styles.scanInfo}>
        <PhosphorIcons.Sliders color={colors.backgroundPrimary} size={30} weight={'fill'} style={styles.scanSettings}/>
        <PhosphorIcons.Scan color={colors.backgroundPrimary} size={180} weight={'fill'} style={styles.scanIcon}/>
        <Text style={[styles.scanText, {fontSize: 20}]}>Choose an option for a</Text>
        <Text style={[styles.scanText, {fontSize: 36, marginTop: -8, marginBottom: 8, fontWeight: 'bold'}]}>Manual Scan</Text>
        <Text style={[styles.scanText, {fontStyle: 'italic', fontSize: 16, fontWeight: '200'}]}>or wait for an automatic scan at <Text style={{fontWeight: 'bold'}}>9:35</Text></Text>
        <Pressable style={styles.useCameraContainer}>
          <PhosphorIcons.Camera color={colors.backgroundPrimary} size={40} weight={'regular'}/>
          <Text style={{color: colors.backgroundPrimary, fontSize: 20, marginLeft: 5}}>Use Camera</Text>
        </Pressable>
      </View>

      <View style={styles.lineThrough}>
        <Text style={styles.lineThroughText}>or</Text>
      </View>
      <Text style={{fontSize: 20, color: colors.textSecondary, alignSelf: 'center', marginTop: 25, marginBottom: 15, fontWeight: '500'}}>Capture from Coop</Text>

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
    </View>
  )
}

export default scan

const styles = StyleSheet.create({
  scanInfo: {
    backgroundColor: colors.primaryTransparent,
    height: 390,
  },
  scanSettings: {
    position: 'absolute',
    top: 20,
    right: 20,
    transform: [{ rotate: '90deg' }],
  },
  scanIcon: {
    alignSelf: 'center',
    marginTop: 60
  },
  scanText: {
    color: colors.backgroundPrimary,
    textAlign: 'center'
  },
  useCameraContainer: {
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: colors.cta,
    borderRadius: 100,
    height: 60,
    width: 240,
    position: 'absolute',
    bottom: -30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  lineThrough: {
    alignSelf: 'center',
    marginTop: 55,
    borderBottomColor: colors.textLight,
    borderBottomWidth: 1,
    width: 185,
  },
  lineThroughText: {
    fontSize: 16,
    fontWeight: '200',
    color: colors.textLight,
    alignSelf: 'center',
    marginBottom: -8,
    backgroundColor: colors.backgroundPrimary,
    paddingHorizontal: 10,
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
})