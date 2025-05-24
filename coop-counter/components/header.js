// Basic imports
import { StyleSheet, Text, View, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { fetchData } from "../api/apiQuery";
// import color pallet and icons
import * as PhosphorIcons from 'phosphor-react-native';
import colors from '@/constants/colors'

const header = () => {

    const [data, setData] = useState(null)
    const id = 1
    const endpoint = `user/info?userId=${id}`

    useEffect(() => {
        handleSearch()
    }, [])

    useEffect(() => {
        if (data !== null){
            console.log('userInfo: ', data)
            try {
                setName(data.name.split(' ')[0])
            }
            catch (error) {
                console.log(error)
            }
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

    // variables
    var notifications = 2;
    var profileImage = require('@/assets/images/pfp.png')
    const [name, setName] = useState('?')
  return (
    <View style={styles.background}>
        {/* profile and name */}
        <Image
            source={profileImage}
            style={styles.pfp}
        />
        <View style={styles.nameContainer}>
            <Text style={styles.text}>{name}'s Coop</Text>
            <PhosphorIcons.CaretDown color={colors.textSecondary} size={20} weight={"bold"} style={styles.icon} />
        </View>
        {/* notifications */}
        <View style={styles.notificationContainer}>
            <PhosphorIcons.Bell color={colors.textPrimary} size={30} weight={notifications > 0 ? "fill" : "regular"} />
            {notifications > 0 && (
                <View style={styles.notificationBox}>
                    <Text style={styles.notificationText}>{notifications < 100 ? notifications : '99+'}</Text>
                </View>
            )}
        </View>
    </View>
  )
}

export default header

const styles = StyleSheet.create({
    background: {
        height: 90,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    // profile and name
    pfp: {
        height: 50,
        width: 50,
    },
    nameContainer: {
        flexDirection: 'row',
        marginLeft: 15,
    },
    text: {
        fontSize: 20,
        fontWeight: '500',
        color: colors.textSecondary,
    },
    icon: {
        marginTop: 5,
        marginLeft: 5,
    },
    // notifications
    notificationContainer: {
        position: 'absolute',
        right: 30,
        top: 30,
    },
    notificationBox: {
        backgroundColor: colors.alert,
        alignItems: 'center',
        justifyContent: 'center',
        height: 20,
        minWidth: 20,
        paddingHorizontal: 5,
        position: 'absolute',
        borderRadius: 100,
        borderColor: colors.backgroundPrimary,
        borderWidth: 1,
        top: -4,
        left: 14,
    },
    notificationText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 12,
        marginTop: -2,
    },
});