import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

// Lista de perguntas estruturada para facilitar a renderização
const HEALTH_QUESTIONS = [
  { id: "tratamento", label: "Atualmente faz algum tratamento?" },
  { id: "doencaCronica", label: "Possui alguma doença crônica?" },
  { id: "psiquiatrico", label: "Faz uso de remédios psiquiátricos?" },
  { id: "arritmia", label: "Possui arritmia cardíaca?" },
  { id: "psicose", label: "Histórico de psicose, esquizofrenia?" },
  { id: "dorCabeca", label: "Tem dores de cabeça intensas?" },
  { id: "jaUsou", label: "Já usou cannabis (maconha)?" },
  { id: "digestivo", label: "Tem problemas digestivos?" },
];

export default function DefineGoalsScreenTwo() {
  // Estado que guarda as respostas. Todas começam como 'false' (Não)
  const [answers, setAnswers] = useState({
    tratamento: false,
    doencaCronica: false,
    psiquiatrico: false,
    arritmia: false,
    psicose: false,
    dorCabeca: false,
    jaUsou: false,
    digestivo: false,
  });

  const router = useRouter();

  // Função para alternar o valor de uma pergunta específica
  const toggleSwitch = (id) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* HEADER: Voltar e Progresso */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.progressText}>Passo 2 de 5</Text>
        <View style={{ width: 40 }} /> {/* Espaçador para centralizar */}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* TÍTULOS */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Defina seu objetivo</Text>
          <Text style={styles.subtitle}>
            Nossa inteligência artificial irá te auxiliar com algumas perguntas
            para personalizar sua experiência médica.
          </Text>
        </View>

        <Text style={styles.sectionHeader}>Histórico de Saúde</Text>

        {/* LISTA DE PERGUNTAS ESTILO iOS SETTINGS */}
        <View style={styles.listContainer}>
          {HEALTH_QUESTIONS.map((item, index) => {
            const isLast = index === HEALTH_QUESTIONS.length - 1;
            const isTrue = answers[item.id];

            return (
              <View
                key={item.id}
                style={[styles.row, !isLast && styles.rowSeparator]}
              >
                <Text style={styles.questionText}>{item.label}</Text>

                <View style={styles.switchWrapper}>
                  {/* Texto auxiliar "Sim/Não" sutil, comum em apps de saúde */}
                  <Text
                    style={[
                      styles.statusText,
                      isTrue && styles.statusTextActive,
                    ]}
                  >
                    {isTrue ? "Sim" : "Não"}
                  </Text>

                  <Switch
                    trackColor={{ false: "#E5E5EA", true: "#34C759" }}
                    thumbColor="#FFFFFF"
                    ios_backgroundColor="#E5E5EA"
                    onValueChange={() => toggleSwitch(item.id)}
                    value={isTrue}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* FOOTER FIXO: Voltar e Avançar */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.6}>
          <Text style={styles.secondaryButtonText}>Voltar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(define-goals-3)")}
          style={styles.primaryButton}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Avançar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  progressText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#8E8E93",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  titleContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#3C3C43",
    lineHeight: 22,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 16,
    marginTop: 8,
  },
  listContainer: {
    backgroundColor: "#F2F2F7", // Fundo do "Card" agrupador
    borderRadius: 16,
    overflow: "hidden", // Garante que o fundo cinza não vaze nos cantos
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF", // Fundo da linha branco
  },
  rowSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7", // Linha divisória fina e sutil
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
    paddingRight: 16,
    fontWeight: "400",
  },
  switchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusText: {
    fontSize: 15,
    color: "#8E8E93",
    fontWeight: "500",
  },
  statusTextActive: {
    color: "#34C759",
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: "#FFFFFF",
    gap: 12, // Espaço entre os dois botões
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#34C759",
    borderRadius: 14,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 17,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#F2F2F7", // Botão secundário nativo da Apple
    borderRadius: 14,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#000000",
    fontWeight: "600",
    fontSize: 17,
  },
});
