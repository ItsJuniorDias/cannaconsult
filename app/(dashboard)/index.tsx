import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// --- Dados Mockados item derivados da maconha ---
const mockReceitas = [
  {
    id: "1",
    medicamento: "20g de Cannabis Sativa",
    data: "24 Mar 2026",
    medico: "Dr. Carlos Silva",
  },
  {
    id: "2",
    medicamento: "10g de Cannabis Indica",
    data: "10 Fev 2026",
    medico: "Dra. Ana Paula",
  },
];

const mockConsultas = [
  {
    id: "1",
    especialidade: "Clínico Geral",
    data: "26 Mar 2026",
    horario: "14:30",
    medico: "Dr. Roberto Costa",
    status: "Confirmada",
  },
];

export default function Dashboard() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, Alexandre</Text>
          <Text style={styles.subGreeting}>Seja bem-vindo de volta.</Text>
        </View>

        {/* Alert Card (Status) */}
        <TouchableOpacity style={styles.alertCard} activeOpacity={0.7}>
          <View style={styles.alertIconContainer}>
            <Feather name="folder" size={24} color="#34C75E" />
          </View>
          <View style={styles.alertTextContainer}>
            <Text style={styles.alertTitle}>Estamos quase lá!</Text>
            <Text style={styles.alertDescription}>
              Envie seu documento de identificação para agilizar suas receitas.
            </Text>

            <TouchableOpacity onPress={() => router.push("/(send-document)")}>
              <Text style={styles.alertLink}>Enviar agora →</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Grid-like Layout */}
        <View style={styles.gridContainer}>
          {/* Receitas Card */}
          <View style={styles.mainCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Minhas Receitas</Text>
              <TouchableOpacity onPress={() => router.push("/(my-revenues)")}>
                <Text style={styles.seeMore}>Ver todas</Text>
              </TouchableOpacity>
            </View>

            {mockReceitas.length > 0 ? (
              <View style={styles.listContainer}>
                {mockReceitas.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.listItem,
                      index === mockReceitas.length - 1 && styles.lastListItem,
                    ]}
                    activeOpacity={0.6}
                  >
                    <View
                      style={[
                        styles.itemIcon,
                        { backgroundColor: "rgba(52, 199, 94, 0.1)" },
                      ]}
                    >
                      <Feather name="file-text" size={20} color="#34C75E" />
                    </View>
                    <View style={styles.itemContent}>
                      <Text style={styles.itemTitle}>{item.medicamento}</Text>
                      <Text style={styles.itemSubtitle}>
                        {item.medico} • {item.data}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#C7C7CC" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.infoCircle}>
                  <Feather name="info" size={20} color="#8E8E93" />
                </View>
                <Text style={styles.emptyText}>
                  Nenhuma receita encontrada.
                </Text>
              </View>
            )}
          </View>

          {/* Consultas Card */}
          <View style={styles.mainCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Minhas Consultas</Text>
              <TouchableOpacity
                onPress={() => router.push("/(my-consultations)")}
              >
                <Text style={styles.seeMore}>Ver todas</Text>
              </TouchableOpacity>
            </View>

            {mockConsultas.length > 0 ? (
              <View style={styles.listContainer}>
                {mockConsultas.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.listItem,
                      index === mockConsultas.length - 1 && styles.lastListItem,
                    ]}
                    activeOpacity={0.6}
                  >
                    <View
                      style={[
                        styles.itemIcon,
                        { backgroundColor: "rgba(0, 122, 255, 0.1)" },
                      ]}
                    >
                      <Feather name="calendar" size={20} color="#007AFF" />
                    </View>
                    <View style={styles.itemContent}>
                      <Text style={styles.itemTitle}>{item.especialidade}</Text>
                      <Text style={styles.itemSubtitle}>
                        {item.data} às {item.horario}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#C7C7CC" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.infoCircle}>
                  <Feather name="calendar" size={20} color="#8E8E93" />
                </View>
                <Text style={styles.emptyText}>
                  Nenhuma consulta encontrada.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7", // Cinza padrão iOS
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
    marginTop: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 16,
    color: "#8E8E93",
    marginTop: 4,
  },
  alertCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: "#34C75E",
  },
  alertIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "rgba(52, 199, 94, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#34C75E",
  },
  alertDescription: {
    fontSize: 14,
    color: "#3A3A3C",
    marginTop: 2,
  },
  alertLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#34C75E",
    marginTop: 8,
  },
  gridContainer: {
    gap: 20,
  },
  mainCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 20,
    minHeight: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  seeMore: {
    fontSize: 14,
    color: "#34C75E",
    fontWeight: "600",
  },
  // --- Novos Estilos para as Listas ---
  listContainer: {
    flex: 1,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5EA",
  },
  lastListItem: {
    borderBottomWidth: 0,
  },
  itemIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
  },
  // -----------------------------------
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 10,
  },
  infoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#8E8E93",
  },
});
