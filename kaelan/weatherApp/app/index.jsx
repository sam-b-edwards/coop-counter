import { Text, View, StyleSheet, Pressable, FlatList, ImageBackground, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchWeatherData } from "../api/weather";
import { useState, useEffect } from "react";
import Icon from '@expo/vector-icons/MaterialIcons'



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
    <View style={styles.hourlyContainer}>
      <Text style={styles.hourlyText}>{item.time.split(' ').pop()}</Text>
      <Text style={styles.hourlyText}>{item.temp_c}°C</Text>
      <Icon name='sunny' color={'gold'} size={28} style={styles.hourlyIcon} />
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
            curConditon.toLowerCase().includes('sunny') ? sunny : 
            curConditon.toLowerCase().includes('clear') ? clear : 
            curConditon.toLowerCase().includes('rain') ? rainy : 
            curConditon.toLowerCase().includes('cloudy') ? cloudy :
            sunny
          }
            blurRadius={5} resizeMode="cover" style={styles.backgroundImage}>
            <Text style={[styles.locationTitle, styles.topText]}>{weatherData.location.name}</Text>
            <Text style={[styles.curTempText, styles.topText]}>{weatherData.current.temp_c}°</Text>
            <Text style={[styles.curConditonText, styles.topText]}>{curConditon}</Text>
            <View>
              <Text style={[styles.dateTitle, styles.topText]}>{weatherData.forecast.forecastday[0].date}</Text>
            </View>
            <FlatList
              data={weatherData.forecast.forecastday[0].hour}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
            />
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
    textShadowRadius: 15,
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
  hourlyContainer: {
    backgroundColor: 'lightblue',
    marginHorizontal: 20,
    marginBottom: 20,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#515151',
    borderRadius: 10
  },
  hourlyText: {
    fontSize: 20,
    marginRight: 40
  },
  hourlyIcon: {
    marginLeft: 'auto'
  }
})