import { Link } from "expo-router";
import { Text, View, SafeAreaView, StyleSheet } from "react-native";

export default function Index() {
  return (
    <SafeAreaView>
      <Link style={styles.pageLink} href={{pathname: '[id]/idPage',params: { id: '1'}}}>User 1</Link>
      <Link style={styles.pageLink} href={{pathname: '[id]/idPage',params: { id: '2'}}}>User 2</Link>
      <Link style={styles.pageLink} href={{pathname: '[id]/idPage',params: { id: '3'}}}>User 3</Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pageLink: {
    fontSize: 25,
    backgroundColor: 'red',
    padding: 20,
    margin: 20,
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    borderRadius: 20
  }
})