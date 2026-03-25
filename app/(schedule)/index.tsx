import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from "react-native";

// Dados simulados
const MOCK_APPOINTMENTS = [
  {
    id: "1",
    patientName: "Maria Eduarda Silva",
    time: "09:00",
    type: "Primeira Consulta",
    status: "completed",
    age: "28 anos",
    notes: "Paciente relatou enxaquecas frequentes na triagem.",
  },
  {
    id: "2",
    patientName: "Alexandre de P. Dias Jr.",
    time: "10:30",
    type: "Retorno",
    status: "in-progress",
    age: "45 anos",
    notes: "Retorno para avaliação de exames de sangue.",
  },
  {
    id: "3",
    patientName: "Carla Ferreira",
    time: "14:00",
    type: "Exame de Rotina",
    status: "scheduled",
    age: "32 anos",
    notes: "Check-up anual.",
  },
  {
    id: "4",
    patientName: "Roberto Gomes",
    time: "15:30",
    type: "Acompanhamento",
    status: "scheduled",
    age: "50 anos",
    notes: "Acompanhamento de pressão arterial.",
  },
];

export default function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState("Hoje");

  // Estados para o Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const getStatusStyle = (status) => {
    switch (status) {
      case "in-progress":
        return { color: "#34C759", text: "Em andamento", dotColor: "#34C759" };
      case "completed":
        return { color: "#8E8E93", text: "Concluído", dotColor: "#8E8E93" };
      default:
        return { color: "#007AFF", text: "Agendado", dotColor: "#007AFF" };
    }
  };

  const getInitials = (name) => {
    if (!name) return "P";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Função para abrir o modal com os dados do paciente
  const openPatientDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Agenda</Text>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Seletor de Dias */}
        <View style={styles.dateSelector}>
          {["Ontem", "Hoje", "Amanhã"].map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dateButton,
                selectedDay === day && styles.dateButtonActive,
              ]}
              onPress={() => setSelectedDay(day)}
            >
              <Text
                style={[
                  styles.dateButtonText,
                  selectedDay === day && styles.dateButtonTextActive,
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Consultas de {selectedDay}</Text>

        {/* Lista de Consultas */}
        <View style={styles.timelineContainer}>
          {MOCK_APPOINTMENTS.map((appointment) => {
            const statusInfo = getStatusStyle(appointment.status);

            return (
              <View key={appointment.id} style={styles.appointmentRow}>
                <View style={styles.timeColumn}>
                  <Text style={styles.timeText}>{appointment.time}</Text>
                </View>

                {/* Card Clicável */}
                <TouchableOpacity
                  style={styles.card}
                  activeOpacity={0.7}
                  onPress={() => openPatientDetails(appointment)}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.patientName}>
                      {appointment.patientName}
                    </Text>
                    <View style={styles.statusContainer}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: statusInfo.dotColor },
                        ]}
                      />
                      <Text
                        style={[styles.statusText, { color: statusInfo.color }]}
                      >
                        {statusInfo.text}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.appointmentType}>{appointment.type}</Text>

                  <View style={styles.cardActions}>
                    <Text style={styles.actionText}>Ver Detalhes</Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Modal de Detalhes do Paciente */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        presentationStyle="pageSheet" // Estilo nativo iOS (ignorado no Android, onde abre em tela cheia)
        onRequestClose={() => setModalVisible(false)}
      >
        {selectedAppointment && (
          <View style={styles.modalContainer}>
            {/* Header do Modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>
                Detalhes do Agendamento
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>OK</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              {/* Perfil do Paciente */}
              <View style={styles.profileSection}>
                <View style={styles.largeAvatar}>
                  <Text style={styles.largeAvatarText}>
                    {getInitials(selectedAppointment.patientName)}
                  </Text>
                </View>
                <Text style={styles.modalPatientName}>
                  {selectedAppointment.patientName}
                </Text>
                <Text style={styles.modalPatientAge}>
                  {selectedAppointment.age}
                </Text>
              </View>

              {/* Informações da Consulta (Estilo Tabela iOS) */}
              <View style={styles.infoGroup}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Horário</Text>
                  <Text style={styles.infoValue}>
                    {selectedAppointment.time}
                  </Text>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tipo</Text>
                  <Text style={styles.infoValue}>
                    {selectedAppointment.type}
                  </Text>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Status</Text>
                  <Text
                    style={[
                      styles.infoValue,
                      {
                        color: getStatusStyle(selectedAppointment.status).color,
                      },
                    ]}
                  >
                    {getStatusStyle(selectedAppointment.status).text}
                  </Text>
                </View>
              </View>

              {/* Notas de Triagem */}
              <Text style={styles.sectionSubtitle}>Notas da Triagem</Text>
              <View style={styles.notesContainer}>
                <Text style={styles.notesText}>
                  {selectedAppointment.notes}
                </Text>
              </View>

              {/* Botão de Ação Primária */}
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Abrir Prontuário</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... (Mantenha todos os estilos anteriores iguais até aqui)
  safeArea: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: 0.3,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#34C759",
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 28,
  },
  dateSelector: {
    flexDirection: "row",
    backgroundColor: "#E5E5EA",
    borderRadius: 9,
    padding: 2,
    marginBottom: 24,
  },
  dateButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 7,
  },
  dateButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
  },
  dateButtonTextActive: {
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#000000",
  },
  timelineContainer: {
    gap: 16,
  },
  appointmentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  timeColumn: {
    width: 60,
    paddingTop: 14,
  },
  timeText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#8E8E93",
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 4,
  },
  patientName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 6,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "500",
  },
  appointmentType: {
    fontSize: 15,
    color: "#8E8E93",
    marginTop: 8,
    marginBottom: 16,
  },
  cardActions: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E5EA",
    paddingTop: 12,
  },
  actionText: {
    color: "#34C759",
    fontSize: 15,
    fontWeight: "600",
  },

  // --- Estilos do Modal ---
  modalContainer: {
    flex: 1,
    backgroundColor: "#F2F2F7", // Fundo do modal mantém o padrão iOS
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20, // Ajuste para descer um pouco do topo
    paddingBottom: 16,
    backgroundColor: "#F2F2F7",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#C6C6C8",
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
    flex: 1,
    textAlign: "center",
    marginLeft: 30, // Compensa o botão OK para centralizar o título
  },
  closeButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#34C759", // Verde Apple
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 10,
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E5E5EA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  largeAvatarText: {
    fontSize: 32,
    fontWeight: "600",
    color: "#8E8E93",
  },
  modalPatientName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 4,
  },
  modalPatientAge: {
    fontSize: 16,
    color: "#8E8E93",
  },
  infoGroup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    overflow: "hidden", // Importante para manter a borda arredondada com as linhas internas
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  infoDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E5EA",
    marginLeft: 16, // A linha não vai até o final da borda esquerda no iOS
  },
  infoLabel: {
    fontSize: 17,
    color: "#000000",
  },
  infoValue: {
    fontSize: 17,
    color: "#8E8E93",
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: "400",
    color: "#8E8E93",
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 16,
  },
  notesContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    marginBottom: 32,
  },
  notesText: {
    fontSize: 17,
    color: "#000000",
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: "#34C759",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
});
