import { Text, View, StyleSheet, Button, TouchableOpacity} from "react-native";
import { router } from 'expo-router';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={styles.heading}>Hello World</Text>
      <Text style={styles.text}>Edit app/index.tsx to edit this screen.</Text>
      <View style={styles.button}>
        <Button 
          title="Click me two" 
          onPress={() => router.push("/second")}
          accessibilityLabel="Click me"
          color="white"
        />
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Click me</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
  main: {
    color: "red",
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  button: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
