import { router } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AreaDoctorScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Card de Boas-vindas */}
        <View style={styles.card}>
          <Text style={styles.greeting}>Olá, Dr. Carlos Mendes</Text>
          <Text style={styles.subtitle}>
            Bom plantão! Aqui está o seu resumo de hoje.
          </Text>
        </View>

        {/* Card de Alerta / Tarefas Pendentes */}
        <TouchableOpacity
          style={[styles.card, styles.alertCard]}
          activeOpacity={0.8}
        >
          <View style={styles.alertContent}>
            <View style={styles.alertIconContainer}>
              <Text style={styles.alertIcon}>✍️</Text>
            </View>
            <View style={styles.alertTextContainer}>
              <Text style={styles.alertTitle}>Assinaturas Pendentes</Text>
              <Text style={styles.alertBody}>
                Você possui 3 receitas aguardando assinatura digital para
                liberação aos pacientes.
              </Text>
              <Text style={styles.alertAction}>Revisar e assinar agora ➔</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Card Próximo Paciente / Atendimento */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Próximo Atendimento</Text>
            <TouchableOpacity>
              <Text style={styles.cardAction}>Ver Agenda Completa</Text>
            </TouchableOpacity>
          </View>

          {/* Estado do Paciente Agendado */}
          <View style={styles.appointmentContainer}>
            <View style={styles.appointmentInfo}>
              <View style={styles.patientAvatar}>
                <Text style={styles.patientAvatarText}>AD</Text>
              </View>
              <View style={styles.patientDetails}>
                <Text style={styles.patientName}>Alexandre de P. Dias Jr.</Text>
                <Text style={styles.patientStatus}>🟢 Aguardando na sala</Text>
              </View>
            </View>

            <View style={styles.appointmentTimeContainer}>
              <Text style={styles.appointmentDate}>Hoje, 24 de Março</Text>
              <Text style={styles.appointmentTime}>14:30</Text>
            </View>

            {/* CTA para iniciar Ato Médico (Vídeo Chamada) */}
            <TouchableOpacity
              onPress={() => router.push("/(video-call)")}
              style={styles.videoButton}
              activeOpacity={0.8}
            >
              <Text style={styles.videoButtonIcon}>📹</Text>
              <Text style={styles.videoButtonText}>
                Iniciar Videoconferência
              </Text>
            </TouchableOpacity>
          </View>

          {/* Ações de Agendamento do Médico */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.scheduleButton} activeOpacity={0.8}>
              <Text style={styles.scheduleButtonText}>+ Agendar Retorno</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.manageButton} activeOpacity={0.8}>
              <Text style={styles.manageButtonText}>Gerenciar Horários</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card Histórico de Pacientes */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Últimos Pacientes</Text>
            <TouchableOpacity>
              <Text style={styles.cardAction}>Buscar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIcon}>
              <Text style={styles.emptyStateIconText}>i</Text>
            </View>
            <Text style={styles.emptyStateText}>
              Nenhum paciente atendido hoje ainda.
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
    backgroundColor: "#F4F6F8",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A202C",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#718096",
  },
  alertCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#ED8936", // Laranja para indicar uma tarefa pendente do médico
  },
  alertContent: {
    flexDirection: "row",
  },
  alertIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFAF0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  alertIcon: {
    fontSize: 20,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#DD6B20",
    marginBottom: 6,
  },
  alertBody: {
    fontSize: 14,
    color: "#4A5568",
    lineHeight: 20,
    marginBottom: 12,
  },
  alertAction: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DD6B20",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D3748",
  },
  cardAction: {
    fontSize: 14,
    color: "#3182CE",
    fontWeight: "600",
  },

  // --- Estilos de Consultas (Visão do Médico) ---
  appointmentContainer: {
    backgroundColor: "#F7FAFC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  appointmentInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  patientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#BEE3F8", // Azul claro para pacientes
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  patientAvatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2B6CB0",
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 2,
  },
  patientStatus: {
    fontSize: 13,
    color: "#38A169", // Verde indicando que o paciente já está online/na sala
    fontWeight: "500",
  },
  appointmentTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#EDF2F7",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  appointmentDate: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4A5568",
  },
  appointmentTime: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2B6CB0",
  },
  videoButton: {
    backgroundColor: "#3182CE", // Azul para a ação principal do médico
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 10,
  },
  videoButtonIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  videoButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },

  // --- Botões de Ação Secundários ---
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  scheduleButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  scheduleButtonText: {
    color: "#4A5568",
    fontSize: 14,
    fontWeight: "600",
  },
  manageButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#EDF2F7",
  },
  manageButtonText: {
    color: "#4A5568",
    fontSize: 14,
    fontWeight: "600",
  },

  // --- Estilos de Empty State ---
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  emptyStateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EDF2F7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyStateIconText: {
    color: "#A0AEC0",
    fontSize: 18,
    fontWeight: "bold",
    fontStyle: "italic",
  },
  emptyStateText: {
    fontSize: 14,
    color: "#718096",
  },
});
