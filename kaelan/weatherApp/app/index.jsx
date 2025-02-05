import { Text, View, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchWeatherData } from "../api/weather";
import { useState, useEffect } from "react";


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
  console.log(loaded ? weatherData.location.country: 'api not loaded')

  var pageData = []
  for(let i = 1; i <= 10; i++) {
    pageData.push(
      <Text style={styles.loopText}>Loop number: {i}</Text>
    )
  }

  return (
    <>
      {weatherData === null ? ( // if the api is not fetched shows loading screen
        <SafeAreaView style={styles.loadingBackground}>
          <Text style={styles.loadingText}>Loading...</Text>
        </SafeAreaView>
      ) : ( // if an api is fetched displays information
        <SafeAreaView style={styles.container}>
          <View>
            <Text style={styles.title}>Weather</Text>
            <Text style={styles.locationTitle}>in {weatherData.location.name}</Text>
            {pageData}
          </View>
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
  locationTitle: {
    fontSize: 24,
    textAlign: 'center',
    alignSelf: 'center',
    color: '#515151'
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
  }
})