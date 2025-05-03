import { Text, View, StyleSheet, Button} from "react-native";
import { router } from 'expo-router';

export default function Second() {
  return (
    <View>
      <Text>Second</Text>
      <Button title="Go back" onPress={() => router.back()} />
    </View>
  );
}