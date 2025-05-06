import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import colors from '@/constants/colors'
import * as PhosphorIcons from 'phosphor-react-native';

const profile = () => {
  return (
    <View style={{ backgroundColor: colors.backgroundPrimary, flex: 1 }}>
      <Image source={require('@/assets/images/banner.jpg')} style={styles.userBanner} />
      <View>
        <Image source={require('@/assets/images/pfp.png')} style={styles.userProfile} />
        <View style={styles.profileEdit}>
          <PhosphorIcons.PencilSimpleLine color={colors.backgroundPrimary} size={20} weight={'regular'}/>
        </View>
      </View>
      <Text style={{alignSelf: 'center', fontSize: 24, fontWeight: '700', marginTop: 20}}>Kaelan Graham</Text>
      <View style={styles.emailContainer}>
        <Text style={{color: colors.textSecondary}}>kaelangraham@gmail.com</Text>
      </View>
      <View style={styles.optionsContainer}>
        <View style={styles.options}>
          <PhosphorIcons.PencilSimpleLine color={colors.textPrimary} size={26} weight={'regular'}/>
          <Text style={{fontSize: 20, marginLeft: 10}}>Edit Profile</Text>
          <PhosphorIcons.CaretRight color={colors.textPrimary} size={26} weight={'regular'} style={{position: 'absolute', right: 20}}/>
        </View>
      </View>
    </View>
  )
}

export default profile

const styles = StyleSheet.create({
  userBanner: {
    height: 150,
    width: '100%',
  },
  userProfile: {
    height: 160, 
    width: 160,
    borderWidth: 2.5,
    borderRadius: 100,
    borderColor: colors.backgroundPrimary,
    alignSelf: 'center',
    marginTop: -80,
  },
  profileEdit: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    padding: 10,
    backgroundColor: colors.ctaDark,
    borderRadius: 100,
    borderWidth: 2.5,
    borderColor: colors.backgroundPrimary,
  },
  emailContainer: {
    alignSelf: 'center',
    marginTop: 4,
    backgroundColor: colors.infoBackground,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 2,
  },
  options: {
    flexDirection: 'row',
    height: 70,
    alignItems: 'center',
    paddingLeft: 20
  },
  optionsContainer: {
    borderTopWidth: 1,
    marginTop: 30,
    borderTopColor: colors.backgroundSecondary
  }
})