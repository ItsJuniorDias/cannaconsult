import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig"; // Ajuste o caminho conforme o seu projeto

export default function AreaDoctorScreen() {
  const [nextConsultation, setNextConsultation] = useState(null);
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const consultationsRef = collection(db, "consultations");

        // Buscamos os 6 últimos para separar: 1 para o próximo atendimento, 5 para o histórico
        const q = query(
          consultationsRef,
          orderBy("createdAt", "desc"),
          limit(6),
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const docs = snapshot.docs;

          // O mais recente vira o "Próximo Atendimento"
          const firstDoc = docs[0];
          setNextConsultation({
            id: firstDoc.id,
            // Proteção adicionada (?.) para evitar crash se o chatHistory for menor que 3
            patientName:
              firstDoc.data().chatHistory?.[3]?.text?.split(",")[0] ||
              "Paciente Não Identificado",
            scheduledAt:
              firstDoc.data().createdAt?.toDate().getTime() +
              24 * 60 * 60 * 1000,
            ...firstDoc.data(),
          });

          // Os restantes (do índice 0 em diante) viram os "Últimos Pacientes"
          const recents = docs.slice(0).map((doc) => ({
            id: doc.id,
            patientName:
              doc.data().chatHistory?.[3]?.text?.split(",")[0] || "Paciente",
            createdAt: doc.data().createdAt,
            status: doc.data().status,
          }));

          console.log(recents, "Pacientes recentes encontrados:");

          setRecentPatients(recents);
        } else {
          setNextConsultation(null);
          setRecentPatients([]);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDateTime = (timestamp) => {
    if (!timestamp) return { date: "", time: "" };
    const dateObj = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const dateStr = dateObj.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
    });
    const timeStr = dateObj.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return {
      date: `Hoje, ${dateStr}`,
      time: timeStr,
      shortDate: dateObj.toLocaleDateString("pt-BR"),
    };
  };

  const getInitials = (name) => {
    if (!name || name === "Paciente Não Identificado") return "P";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, Dr. Carlos</Text>
          <Text style={styles.subtitle}>
            Bom plantão! Aqui está o seu resumo de hoje.
          </Text>
        </View>

        {/* Card de Alerta */}
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

        {/* Card Próximo Paciente */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Próximo Atendimento</Text>
            <TouchableOpacity onPress={() => router.push("/(schedule)")}>
              <Text style={styles.linkAction}>Ver Agenda</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <ActivityIndicator size="small" color="#34C759" />
              <Text style={{ marginTop: 8, color: "#8E8E93" }}>
                Carregando paciente...
              </Text>
            </View>
          ) : nextConsultation ? (
            <>
              <View style={styles.patientRow}>
                <View style={styles.patientAvatar}>
                  <Text style={styles.patientAvatarText}>
                    {getInitials(nextConsultation.patientName)}
                  </Text>
                </View>
                <View style={styles.patientDetails}>
                  <Text style={styles.patientName}>
                    {nextConsultation.patientName}
                  </Text>
                  <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.patientStatus}>
                      Aguardando video chamada
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.appointmentTimeContainer}>
                <Text style={styles.appointmentDate}>
                  {formatDateTime(nextConsultation.scheduledAt).date}
                </Text>
                <Text style={styles.appointmentTime}>
                  {formatDateTime(nextConsultation.scheduledAt).time}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  router.push(`/(video-call)?id=${nextConsultation.id}`)
                }
                style={styles.primaryButton}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonIcon}>📹</Text>
                <Text style={styles.primaryButtonText}>
                  Iniciar Videoconferência
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                Nenhum paciente aguardando no momento.
              </Text>
            </View>
          )}
        </View>

        {/* Card Histórico de Pacientes Atualizado */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Últimos Pacientes</Text>
          </View>

          {loading ? (
            <ActivityIndicator
              size="small"
              color="#34C759"
              style={{ marginVertical: 20 }}
            />
          ) : recentPatients.length > 0 ? (
            recentPatients.map((patient, index) => (
              <TouchableOpacity
                key={patient.id}
                style={[
                  styles.recentPatientRow,
                  index === recentPatients.length - 1 && {
                    borderBottomWidth: 0,
                  }, // Tira a linha do último item
                ]}
                onPress={() =>
                  router.push({
                    pathname: "/(download-pdf)",
                    params: { consultationId: patient.id },
                  })
                }
              >
                <View
                  style={[
                    styles.patientAvatar,
                    { width: 40, height: 40, marginRight: 12 },
                  ]}
                >
                  <Text style={[styles.patientAvatarText, { fontSize: 14 }]}>
                    {getInitials(patient.patientName)}
                  </Text>
                </View>
                <View style={styles.patientDetails}>
                  <Text style={styles.patientName}>{patient.patientName}</Text>
                  <Text style={styles.patientStatus}>
                    Consulta em {formatDateTime(patient.createdAt).shortDate}
                  </Text>
                </View>
                <Text style={styles.linkAction}>Ver</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                Nenhum paciente atendido recentemente.
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
    backgroundColor: "#F2F2F7",
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
    color: "#8E8E93",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
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
    backgroundColor: "rgba(52, 199, 89, 0.1)",
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
    color: "#34C759",
  },
  patientRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  recentPatientRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5EA",
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
    backgroundColor: "#34C759",
    marginRight: 6,
  },
  patientStatus: {
    fontSize: 13,
    color: "#8E8E93",
    fontWeight: "500",
  },
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
  primaryButton: {
    backgroundColor: "#34C759",
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
