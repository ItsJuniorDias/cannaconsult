import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Requer Expo

export default function MyRevenues() {
  const [activeTab, setActiveTab] = useState("receitas");
  const [searchText, setSearchText] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Header - Apple Large Title Style */}
        <View style={styles.header}>
          <Text style={styles.largeTitle}>Minhas Receitas</Text>
          <Text style={styles.subtitle}>
            Aqui você encontra suas receitas disponíveis.
          </Text>
        </View>

        {/* Custom Segmented Control */}
        <View style={styles.segmentedControlContainer}>
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                activeTab === "receitas" && styles.segmentActive,
              ]}
              onPress={() => setActiveTab("receitas")}
            >
              <Text
                style={[
                  styles.segmentText,
                  activeTab === "receitas" && styles.segmentTextActive,
                ]}
              >
                Minhas Receitas (0)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentButton,
                activeTab === "laudos" && styles.segmentActive,
              ]}
              onPress={() => setActiveTab("laudos")}
            >
              <Text
                style={[
                  styles.segmentText,
                  activeTab === "laudos" && styles.segmentTextActive,
                ]}
              >
                Meus Laudos (0)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color="#8E8E93"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por receita"
              placeholderTextColor="#8E8E93"
              value={searchText}
              onChangeText={setSearchText}
              clearButtonMode="while-editing" // Nativo do iOS
            />
          </View>
        </View>

        {/* Empty State */}
        <View style={styles.emptyStateContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="document-text" size={48} color="#34C759" />
          </View>
          <Text style={styles.emptyStateTitle}>Nenhuma receita cadastrada</Text>
          <Text style={styles.emptyStateSubtitle}>
            Quando seu médico emitir uma receita, ela aparecerá aqui.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7", // Cinza claro padrão do iOS para fundos de app
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: "700",
    color: "#000000",
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15,
    color: "#8E8E93", // Cinza secundário do iOS
    marginTop: 6,
  },
  segmentedControlContainer: {
    paddingHorizontal: 20,
    marginVertical: 12,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#E3E3E8",
    borderRadius: 9,
    padding: 2,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
  },
  segmentActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#000000",
  },
  segmentTextActive: {
    fontWeight: "600",
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3E3E8", // Fundo da barra de busca nativa
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 36,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: "#000000",
    height: "100%",
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 80, // Compensa o header para centralizar visualmente melhor
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: "rgba(52, 199, 89, 0.15)", // Fundo verde translúcido
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: 15,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
  },
});
