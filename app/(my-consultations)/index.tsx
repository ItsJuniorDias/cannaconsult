import React from "react";
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Requer Expo

export default function MyConsultations() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header - Apple Large Title Style */}
        <View style={styles.header}>
          <Text style={styles.largeTitle}>Minhas Consultas</Text>
          <Text style={styles.subtitle}>
            Aqui você encontra suas consultas disponíveis.
          </Text>
        </View>

        {/* Call to Action Button */}
        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
          <Ionicons
            name="add"
            size={20}
            color="#FFFFFF"
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Faça uma nova consulta</Text>
        </TouchableOpacity>

        {/* Content Card (List / Empty State) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Minhas Consultas</Text>
          </View>

          <View style={styles.emptyStateContainer}>
            <Ionicons name="calendar-outline" size={48} color="#C7C7CC" />
            <Text style={styles.emptyStateText}>
              Nenhuma consulta encontrada.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7", // Cinza claro padrão do iOS
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: "700",
    color: "#000000",
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15,
    color: "#8E8E93",
    marginTop: 6,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: "#34C759", // Verde iOS
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#34C759",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4, // Sombra para Android
  },
  buttonIcon: {
    marginRight: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: "hidden", // Garante que o conteúdo respeite o arredondamento
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, // Linha fininha padrão Apple
    borderBottomColor: "#C7C7CC",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
  },
  emptyStateContainer: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 15,
    color: "#8E8E93",
    textAlign: "center",
  },
});
