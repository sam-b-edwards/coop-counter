import { View, Text, StyleSheet, Pressable } from 'react-native'
import { React, useState} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from '@expo/vector-icons/Fontisto'

const shop = () => {

    const [cookies, setCookies] = useState(20)
    const [clickerUpgradeCost, setUpgradeCost] = useState(10)
    const [cookiesPerClick, setCookiesPerClick] = useState(1) 

    const itemPurchase = () => {
        if (cookies > clickerUpgradeCost) {
        setCookies(currentCookies => currentCookies-clickerUpgradeCost)
        setUpgradeCost(currentCost => currentCost+10)
        setCookiesPerClick(currentCPC => currentCPC+0.2)
        } else {

        }
    }

  return (
    <SafeAreaView style={styles.container}>
        <Text style={styles.shopTitle}>Upgrades</Text>
        <Text style={styles.cookiesText}>Cookies: {cookies}</Text>
        <View style={styles.upgradesContainer}>
            <Pressable style={styles.itemContainer} onPress={itemPurchase}>
                <Icon size={56} name='dollar' />
                <View style={styles.itemTextContainer}>
                    <Text style={styles.itemTextTitle}>+0.2 Cookies per Click</Text>
                    <Text style={styles.itemText}>Current Cookies per Click: {cookiesPerClick}</Text>
                    <Text style={[styles.itemText, {fontWeight: 'bold'}]}>Upgrade Price: {clickerUpgradeCost}</Text>
                </View>
            </Pressable>
        </View>
        
    </SafeAreaView>
    
  )
}

export default shop

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    shopTitle: {
        fontSize: 46,
        fontWeight: 'bold',
        alignSelf: 'center',
        marginBottom: 5,
    },
    cookiesText: {
        fontSize: 34,
        alignSelf: 'center',
        marginBottom: 20
    },
    upgradesContainer: {
        flex: 1,
        marginHorizontal: 16,
        marginTop: 10,
    },
    itemContainer: {
        backgroundColor: '#DDDDDD',
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
        alignItems: 'center'
    },
    itemTextContainer: {
        flex: 1,
        marginLeft: 40,
    },
    itemTextTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    itemText: {
        fontSize: 16,
        fontStyle: 'italic'
    }
})