import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AvailablePhysiciansScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Médicos Disponíveis</Text>
      {/* Conteúdo da lista de médicos disponíveis */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
});
