// Basic imports
import { StyleSheet, Text, View, Image, Pressable } from 'react-native'
import React, {useState, useEffect} from 'react'
import { fetchData } from "../api/apiQuery";
// Import color pallet and icons
import colors from '@/constants/colors'
import * as PhosphorIcons from 'phosphor-react-native';

const profile = () => {

  const [data, setData] = useState(null)
  const id = 6
  const endpoint = `user/info?userId=${id}`

  useEffect(() => {
      handleSearch()
  }, [])

  useEffect(() => {
      if (data !== null){
          console.log('userInfo: ', data)
          setName(data.name)
          setEmail(data.email)
      }
  }, [data])

  const handleSearch = async () => {
      try {
        const result = await fetchData(endpoint);
        setData(result)
      }
      catch (error) {
        throw error
      }
    }


  const [name, setName] = useState('?')
  const [email, setEmail] = useState('?')
  var bannerImage = require('@/assets/images/banner.jpg')
  var profileImage = require('@/assets/images/pfp.png')
  return (
    // main container for profile page (flex 1 to take up all space)
    <View style={{ backgroundColor: colors.backgroundPrimary, flex: 1 }}>
      {/* user banner + pfp */}
      <Image source={bannerImage} style={styles.userBanner} />
      <View>
        <Image source={profileImage} style={styles.userProfile} />
        <View style={styles.profileEdit}>
          <PhosphorIcons.PencilSimpleLine color={colors.backgroundPrimary} size={20} weight={'regular'}/>
        </View>
      </View>
      {/* name and info */}
      <Text style={{alignSelf: 'center', fontSize: 24, fontWeight: '700', marginTop: 20}}>{name}</Text>
      <View style={styles.emailContainer}>
        <Text style={{color: colors.textSecondary}}>{email}</Text>
      </View>

      {/* options */}
      <View style={styles.optionsContainer}>
        {/* edit profile */}
        <Pressable style={styles.options}
          onPress={() => {
            console.log('edit profile')
          }}>
          <PhosphorIcons.PencilSimpleLine color={colors.textPrimary} size={26} weight={'regular'}/>
          <Text style={{fontSize: 20, marginLeft: 10}}>Edit Profile</Text>
          <PhosphorIcons.CaretRight color={colors.textPrimary} size={26} weight={'regular'} style={{position: 'absolute', right: 20}}/>
        </Pressable>
        {/* account statistics */}
        <Pressable style={styles.options}
          onPress={() => {
            console.log('account statistics')
          }}>
          <PhosphorIcons.ChartBar color={colors.textPrimary} size={26} weight={'regular'}/>
          <Text style={{fontSize: 20, marginLeft: 10}}>Account Statistics</Text>
          <PhosphorIcons.CaretRight color={colors.textPrimary} size={26} weight={'regular'} style={{position: 'absolute', right: 20}}/>
        </Pressable>
        {/* settings */}
        <Pressable style={styles.options}
          onPress={() => {
            console.log('settings')
          }}>
          <PhosphorIcons.Gear color={colors.textPrimary} size={26} weight={'regular'}/>
          <Text style={{fontSize: 20, marginLeft: 10}}>Settings</Text>
          <PhosphorIcons.CaretRight color={colors.textPrimary} size={26} weight={'regular'} style={{position: 'absolute', right: 20}}/>
        </Pressable>
        {/* scanning preferences */}
        <Pressable style={styles.options}
          onPress={() => {
            console.log('scanning preferences')
          }}>
          <PhosphorIcons.Scan color={colors.textPrimary} size={26} weight={'regular'}/>
          <Text style={{fontSize: 20, marginLeft: 10}}>Scanning Preferences</Text>
          <PhosphorIcons.CaretRight color={colors.textPrimary} size={26} weight={'regular'} style={{position: 'absolute', right: 20}}/>
        </Pressable>
        {/* help and faq */}
        <Pressable style={styles.options}
          onPress={() => {
            console.log('help and faq')
          }}>
          <PhosphorIcons.Headset color={colors.textPrimary} size={26} weight={'regular'}/>
          <Text style={{fontSize: 20, marginLeft: 10}}>Help and FAQ</Text>
          <PhosphorIcons.CaretRight color={colors.textPrimary} size={26} weight={'regular'} style={{position: 'absolute', right: 20}}/>
        </Pressable>
        {/* log out */}
        <Pressable style={styles.options}
          onPress={() => {
            console.log('log out')
          }}>
          <PhosphorIcons.SignOut color={colors.alert} size={26} weight={'regular'} style={{ transform: [{ scaleX: -1}]}}/>
          <Text style={{fontSize: 20, marginLeft: 10, color: colors.alert}}>Log Out</Text>
          <PhosphorIcons.CaretRight color={colors.alert} size={26} weight={'regular'} style={{position: 'absolute', right: 20}} />
        </Pressable>
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