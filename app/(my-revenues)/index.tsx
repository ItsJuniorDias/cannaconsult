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
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// --- Dados Mockados ---
const mockReceitas = [
  {
    id: "1",
    titulo: "20g de Cannabis Sativa",
    profissional: "Dr. Carlos Silva",
    data: "24 Mar 2026",
    status: "Válida",
  },
  {
    id: "2",
    titulo: "10g de Cannabis Indica",
    profissional: "Dra. Ana Paula",
    data: "10 Fev 2026",
    status: "Expirada",
  },
  {
    id: "3",
    titulo: "5g de Cannabis Ruderalis",
    profissional: "Dr. Roberto Costa",
    data: "05 Jan 2026",
    status: "Expirada",
  },
];

const mockLaudos = [
  {
    id: "1",
    titulo: "Laudo Médico - Dor Crônica",
    profissional: "Lab. São Luiz",
    data: "20 Mar 2026",
    status: "Disponível",
  },
];

export default function MyRevenues() {
  const [activeTab, setActiveTab] = useState("receitas");
  const [searchText, setSearchText] = useState("");

  // Define qual array usar com base na aba ativa
  const currentData = activeTab === "receitas" ? mockReceitas : mockLaudos;

  // Lógica de busca para filtrar os itens pelo título ou profissional
  const filteredData = currentData.filter(
    (item) =>
      item.titulo.toLowerCase().includes(searchText.toLowerCase()) ||
      item.profissional.toLowerCase().includes(searchText.toLowerCase()),
  );

  // Renderizador de cada item da lista
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainerSmall}>
          <Ionicons
            name={activeTab === "receitas" ? "medical" : "document-text"}
            size={20}
            color={activeTab === "receitas" ? "#34C759" : "#007AFF"}
          />
        </View>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>{item.titulo}</Text>
          <Text style={styles.cardSubtitle}>{item.profissional}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.cardDate}>{item.data}</Text>
        <View
          style={[
            styles.statusBadge,
            item.status === "Expirada" && styles.statusBadgeExpired,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.status === "Expirada" && styles.statusTextExpired,
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
            Aqui você encontra suas receitas e laudos.
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
              onPress={() => {
                setActiveTab("receitas");
                setSearchText(""); // Limpa a busca ao trocar de aba
              }}
            >
              <Text
                style={[
                  styles.segmentText,
                  activeTab === "receitas" && styles.segmentTextActive,
                ]}
              >
                Minhas Receitas ({mockReceitas.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentButton,
                activeTab === "laudos" && styles.segmentActive,
              ]}
              onPress={() => {
                setActiveTab("laudos");
                setSearchText(""); // Limpa a busca ao trocar de aba
              }}
            >
              <Text
                style={[
                  styles.segmentText,
                  activeTab === "laudos" && styles.segmentTextActive,
                ]}
              >
                Meus Laudos ({mockLaudos.length})
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
              placeholder={`Buscar por ${activeTab === "receitas" ? "receita" : "laudo"}`}
              placeholderTextColor="#8E8E93"
              value={searchText}
              onChangeText={setSearchText}
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        {/* List or Empty State */}
        {filteredData.length > 0 ? (
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyStateContainer}>
            <View style={styles.iconContainerLarge}>
              <Ionicons
                name={
                  activeTab === "receitas" ? "document-text" : "folder-open"
                }
                size={48}
                color={activeTab === "receitas" ? "#34C759" : "#007AFF"}
              />
            </View>
            <Text style={styles.emptyStateTitle}>
              {searchText
                ? "Nenhum resultado encontrado"
                : `Nenhum${activeTab === "receitas" ? "a receita cadastrada" : " laudo cadastrado"}`}
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              {searchText
                ? "Tente buscar com palavras diferentes."
                : `Quando seu médico emitir um${activeTab === "receitas" ? "a receita" : " laudo"}, aparecerá aqui.`}
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
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
    color: "#8E8E93",
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
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3E3E8",
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
  // --- Estilos da Lista e Cards ---
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainerSmall: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 15,
    color: "#8E8E93",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E5EA",
    paddingTop: 12,
  },
  cardDate: {
    fontSize: 13,
    color: "#8E8E93",
    fontWeight: "500",
  },
  statusBadge: {
    backgroundColor: "rgba(52, 199, 89, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeExpired: {
    backgroundColor: "rgba(255, 59, 48, 0.1)", // Vermelho suave do iOS
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#34C759",
  },
  statusTextExpired: {
    color: "#FF3B30", // Vermelho do iOS
  },
  // --- Estilos do Empty State ---
  emptyStateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  iconContainerLarge: {
    width: 80,
    height: 80,
    backgroundColor: "#E3E3E8",
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
