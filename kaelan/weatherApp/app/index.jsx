import { Text, View, StyleSheet, Pressable, FlatList, ImageBackground, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchWeatherData } from "../api/weather";
import { useState, useEffect } from "react";
import Icon from '@expo/vector-icons/Ionicons'



export default function Index() {

  const city = 'Christchurch'
  const [weatherData, setWeatherData] = useState(null)

  useEffect(() => {
    handleSearch();
  }, []); // Empty dependency array means this runs once on mount

  const handleSearch = async () => {
    try {
      const data = await fetchWeatherData(city);
      setWeatherData(data);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const loaded = weatherData === null ? false : true
  // console.log(loaded ? weatherData.location.country: 'api not loaded')

  const renderItem = ({item}) => (
    <View style={styles.hourlyItemContainer}>
      <Text style={styles.hourlyItemText}>{item.time.split(' ').pop()}</Text>
      {
        item.condition.text.toLowerCase().includes('rain') ? 
        <Icon name='rainy' color={'lightblue'} size={34} /> : 

        item.condition.text.toLowerCase().includes('cloudy') || item.condition.text.toLowerCase().includes('overcast') ? 
        <Icon name='cloud' color={'white'} size={34} /> : 

        Number(weatherData.forecast.forecastday[0].astro.sunset.split(':')[0]) + 12 <= Number(item.time.split(' ')[1].split(':')[0]) || Number(weatherData.forecast.forecastday[0].astro.sunrise.split(':')[0]) >= Number(item.time.split(' ')[1].split(':')[0]) ? 
        <Icon name='moon' color={'lightgrey'} size={34} /> : 

        <Icon name='sunny' color={'gold'} size={34} />
      }
      <Text style={styles.hourlyItemText}>{item.temp_c}°</Text>
    </View>
  )

  // Backgrounds
  const sunny = require('../assets/images/sunny.jpg');
  const cloudy = require('../assets/images/cloudy.jpg');
  const rainy = require('../assets/images/rainy.jpg');
  const clear = require('../assets/images/clear.jpg');
  
  const curConditon = loaded ? weatherData.current.condition.text : ''

  
  

  return (
    <>
      {weatherData === null ? ( // if the api is not fetched shows loading screen
        <SafeAreaView style={styles.loadingBackground}>
          <Text style={styles.loadingText}>Loading...</Text>
        </SafeAreaView>
      ) : ( // if an api is fetched displays information
        <SafeAreaView style={styles.container}>
          <ImageBackground 
          source={
            curConditon.toLowerCase().includes('clear') ? clear : 
            curConditon.toLowerCase().includes('rain') ? rainy : 
            curConditon.toLowerCase().includes('cloudy') || curConditon.toLowerCase().includes('overcast') ? cloudy :
            sunny
          }
            blurRadius={5} resizeMode="cover" style={styles.backgroundImage}>
            <Text style={[styles.locationTitle, styles.topText]}>{weatherData.location.name}</Text>
            <Text style={[styles.curTempText, styles.topText]}>{weatherData.current.temp_c}°</Text>
            <Text style={[styles.curConditonText, styles.topText]}>{curConditon}</Text>

            <View style={styles.hourlyContainer}>
              <View style={styles.topBar}>
                <Icon name='calendar-outline' size={18} color={'#fafafa'} style={styles.topBarIcon} />
                <Text style={styles.topBarText}>Todays Forecast</Text>
              </View>
              <FlatList
                data={weatherData.forecast.forecastday[0].hour}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                horizontal={true}
                style={styles.hourlyFlatList}
              />
            </View>
          </ImageBackground>
        </SafeAreaView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 56,
    fontWeight: 'bold',
    marginTop: 24,
    textAlign: 'center',
    alignSelf: 'center',
    marginBottom: -8
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  locationTitle: {
    marginTop: 24,
    fontSize: 36,
  },
  curConditonText: {
    marginTop: -6,
    fontSize: 24,
    marginBottom: 20,
  },
  curTempText: {
    marginTop: -10,
    fontSize: 54,
  },
  dateTitle: {
    fontSize: 20,
    marginBottom: 20,
  },
  topText: {
    textAlign: 'center',
    alignSelf: 'center',
    color: '#fefefe',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    textShadowColor: '#1f1f1f',

  },
  loadingBackground: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: 'black',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 48,
    color: 'white',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  loopText: {
    fontSize: 24,
    color: 'red'
  },
  hourlyItemContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  hourlyFlatList: {
    flexGrow: 0,
  },
  hourlyItemText: {
    fontSize: 20,
    color: '#fafafa'
  },
  hourlyContainer: {
    marginHorizontal: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#0492C266',
  },
  topBar: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'centre',
    paddingTop: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#51515199',
  },
  topBarText: {
    color: '#fafafa',
    fontSize: 18
  },
  topBarIcon: {
    marginRight: 6,
    alignSelf: 'center'
  }
})