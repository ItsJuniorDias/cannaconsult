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

// --- Dados Mockados ---
const mockConsultas = [
  {
    id: "1",
    medico: "Dr. Roberto Costa",
    especialidade: "Clínico Geral",
    data: "26 Mar 2026",
    horario: "14:30",
    status: "Confirmada", // Status possíveis: Confirmada, Agendada, Concluída, Cancelada
  },
  {
    id: "2",
    medico: "Dra. Juliana Silva",
    especialidade: "Dermatologista",
    data: "05 Abr 2026",
    horario: "09:00",
    status: "Agendada",
  },
  {
    id: "3",
    medico: "Dr. Marcos Antônio",
    especialidade: "Cardiologista",
    data: "12 Fev 2026",
    horario: "10:15",
    status: "Concluída",
  },
];

export default function MyConsultations() {
  // Função auxiliar para definir a cor do status
  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmada":
        return { bg: "rgba(52, 199, 89, 0.1)", text: "#34C759" }; // Verde
      case "Agendada":
        return { bg: "rgba(0, 122, 255, 0.1)", text: "#007AFF" }; // Azul
      case "Cancelada":
        return { bg: "rgba(255, 59, 48, 0.1)", text: "#FF3B30" }; // Vermelho
      case "Concluída":
      default:
        return { bg: "rgba(142, 142, 147, 0.1)", text: "#8E8E93" }; // Cinza
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header - Apple Large Title Style */}
        <View style={styles.header}>
          <Text style={styles.largeTitle}>Minhas Consultas</Text>
          <Text style={styles.subtitle}>
            Aqui você encontra suas consultas agendadas e histórico.
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
          <Text style={styles.buttonText}>Nova consulta</Text>
        </TouchableOpacity>

        {/* Content Card (List / Empty State) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Histórico e Agendamentos</Text>
          </View>

          {mockConsultas.length > 0 ? (
            <View style={styles.listContainer}>
              {mockConsultas.map((item, index) => {
                const statusColors = getStatusColor(item.status);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.listItem,
                      index === mockConsultas.length - 1 && styles.lastListItem,
                    ]}
                    activeOpacity={0.7}
                  >
                    <View style={styles.itemIconContainer}>
                      <Ionicons name="person" size={20} color="#007AFF" />
                    </View>

                    <View style={styles.itemTextContainer}>
                      <Text style={styles.doctorName}>{item.medico}</Text>
                      <Text style={styles.specialtyText}>
                        {item.especialidade}
                      </Text>
                      <View style={styles.dateTimeContainer}>
                        <Ionicons
                          name="calendar-outline"
                          size={14}
                          color="#8E8E93"
                        />
                        <Text style={styles.dateTimeText}>
                          {item.data} • {item.horario}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.rightActions}>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: statusColors.bg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: statusColors.text },
                          ]}
                        >
                          {item.status}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#C7C7CC"
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="calendar-outline" size={48} color="#C7C7CC" />
              <Text style={styles.emptyStateText}>
                Nenhuma consulta encontrada.
              </Text>
            </View>
          )}
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
    backgroundColor: "#FAFAFA", // Fundo levemente diferente para o header do card
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
  },
  // --- Estilos da Lista de Consultas ---
  listContainer: {
    flex: 1,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5EA",
  },
  lastListItem: {
    borderBottomWidth: 0, // Remove a linha do último item
  },
  itemIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(0, 122, 255, 0.1)", // Azul suave
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  itemTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 2,
  },
  specialtyText: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 6,
  },
  dateTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateTimeText: {
    fontSize: 13,
    color: "#8E8E93",
    marginLeft: 4,
    fontWeight: "500",
  },
  rightActions: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 46,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  // -----------------------------------
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
