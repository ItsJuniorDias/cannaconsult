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
        {/* Header - Estilo iOS Large Title */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, Dr. Carlos</Text>
          <Text style={styles.subtitle}>
            Bom plantão! Aqui está o seu resumo de hoje.
          </Text>
        </View>

        {/* Card de Alerta / Tarefas Pendentes */}
        <TouchableOpacity style={styles.card} activeOpacity={0.7}>
          <View style={styles.alertContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconEmoji}>✍️</Text>
            </View>
            <View style={styles.alertTextContainer}>
              <Text style={styles.cardTitle}>Assinaturas Pendentes</Text>
              <Text style={styles.alertBody}>
                3 receitas aguardam sua assinatura digital.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(signatures-pending)")}
              >
                <Text style={styles.linkAction}>Revisar e assinar ➔</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>

        {/* Card Próximo Paciente / Atendimento */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Próximo Atendimento</Text>
            <TouchableOpacity>
              <Text style={styles.linkAction}>Ver Agenda</Text>
            </TouchableOpacity>
          </View>

          {/* Estado do Paciente Agendado */}
          <View style={styles.patientRow}>
            <View style={styles.patientAvatar}>
              <Text style={styles.patientAvatarText}>AD</Text>
            </View>
            <View style={styles.patientDetails}>
              <Text style={styles.patientName}>Alexandre de P. Dias Jr.</Text>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.patientStatus}>Aguardando na sala</Text>
              </View>
            </View>
          </View>

          <View style={styles.appointmentTimeContainer}>
            <Text style={styles.appointmentDate}>Hoje, 24 de Março</Text>
            <Text style={styles.appointmentTime}>14:30</Text>
          </View>

          {/* CTA Principal */}
          <TouchableOpacity
            onPress={() => router.push("/(video-call)")}
            style={styles.primaryButton}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonIcon}>📹</Text>
            <Text style={styles.primaryButtonText}>
              Iniciar Videoconferência
            </Text>
          </TouchableOpacity>

          {/* Ações Secundárias */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Agendar Retorno</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Gerenciar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card Histórico de Pacientes */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Últimos Pacientes</Text>
            <TouchableOpacity>
              <Text style={styles.linkAction}>Buscar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.emptyStateContainer}>
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
    backgroundColor: "#F2F2F7", // Fundo padrão do iOS (System Gray 6)
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "800",
    color: "#000000",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15,
    color: "#8E8E93", // System Gray do iOS
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16, // Bordas mais arredondadas (Squircle)
    padding: 16,
    marginBottom: 16,
  },
  alertContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(52, 199, 89, 0.1)", // Verde translúcido
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  iconEmoji: {
    fontSize: 22,
  },
  alertTextContainer: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
  },
  alertBody: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 4,
    marginBottom: 8,
  },
  linkAction: {
    fontSize: 15,
    fontWeight: "600",
    color: "#34C759", // Verde Apple
  },

  // --- Paciente ---
  patientRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  patientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  patientAvatarText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#8E8E93",
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#34C759", // Verde indicando "online"
    marginRight: 6,
  },
  patientStatus: {
    fontSize: 13,
    color: "#8E8E93",
    fontWeight: "500",
  },

  // --- Data e Hora ---
  appointmentTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  appointmentDate: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000000",
  },
  appointmentTime: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000000",
  },

  // --- Botão Principal ---
  primaryButton: {
    backgroundColor: "#34C759", // Verde Apple
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  primaryButtonIcon: {
    marginRight: 8,
    fontSize: 18,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // --- Botões Secundários ---
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F2F2F7",
  },
  secondaryButtonText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "500",
  },

  // --- Empty State ---
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  emptyStateText: {
    fontSize: 15,
    color: "#8E8E93",
  },
});
