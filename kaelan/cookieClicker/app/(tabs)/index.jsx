import { Text, View, StyleSheet, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { React, useState } from "react"

export default function Index() {

  const [cookies, setCookies] = useState(0)

  const cookieClicked = () => {
    setCookies(cookies => cookies + 1);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>Cookies: {cookies}</Text>
      </View>

      <Pressable onPress={cookieClicked}>
        <Image source={require('@/assets/images/cookie.png')} style={styles.cookie} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  scoreContainer: {
    height: 50,
    alignItems: 'center',
    marginBottom: 100,
  },
  scoreText: {
    fontSize: 50,
    fontWeight: '500',
  },
  cookie: {
    height: 250,
    width: 250,
    alignSelf: 'center',

  }
})