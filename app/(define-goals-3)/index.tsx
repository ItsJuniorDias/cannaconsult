import React, { use, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

// Opções da etapa de Saúde Mental
const MENTAL_HEALTH_OPTIONS = [
  { id: "tristeza", label: "Sente muita tristeza" },
  { id: "foco", label: "Perde o foco facilmente" },
  { id: "memoria", label: "Tem problemas de memória" },
  { id: "irritado", label: "Fica facilmente irritado ou triste" },
  { id: "estresse", label: "Possui problema com estresse" },
  { id: "panico", label: "Já teve episódios de pânico?" },
];

export default function DefineGoalsScreenThree() {
  // Estado que guarda um array com os IDs das opções selecionadas (Permite múltipla escolha)
  const [selectedOptions, setSelectedOptions] = useState([]);

  const router = useRouter();

  // Função para adicionar ou remover uma opção do array
  const toggleOption = (id) => {
    setSelectedOptions((prev) => {
      if (prev.includes(id)) {
        // Se já tem, remove
        return prev.filter((item) => item !== id);
      } else {
        // Se não tem, adiciona
        return [...prev, id];
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* HEADER: Voltar e Progresso */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.progressText}>Passo 3 de 5</Text>
        <View style={{ width: 40 }} /> {/* Espaçador */}
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

        <Text style={styles.sectionHeader}>Saúde Mental</Text>
        <Text style={styles.sectionSubtitle}>
          Selecione todas as opções que se aplicam a você.
        </Text>

        {/* LISTA DE OPÇÕES (ESTILO TAGS / CHIPS) */}
        <View style={styles.tagsContainer}>
          {MENTAL_HEALTH_OPTIONS.map((option) => {
            const isSelected = selectedOptions.includes(option.id);

            return (
              <TouchableOpacity
                key={option.id}
                activeOpacity={0.7}
                onPress={() => toggleOption(option.id)}
                style={[styles.tag, isSelected && styles.tagSelected]}
              >
                <Text
                  style={[styles.tagText, isSelected && styles.tagTextSelected]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* FOOTER FIXO */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.6}>
          <Text style={styles.secondaryButtonText}>Voltar</Text>
        </TouchableOpacity>

        {/* Botão Avançar. Pode ou não estar desativado dependendo da sua regra de negócios.
            Aqui deixei sempre ativo, pois o usuário pode não ter nenhum desses sintomas */}
        <TouchableOpacity
          onPress={() => router.push("/(define-goals-4)")}
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
    marginBottom: 4,
    marginTop: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12, // Espaçamento entre os chips (nativo em React Native mais recente)
  },
  tag: {
    backgroundColor: "#F2F2F7", // Fundo cinza padrão iOS
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24, // Bordas bem arredondadas, estilo pílula
    borderWidth: 2,
    borderColor: "transparent",
  },
  tagSelected: {
    backgroundColor: "#F2FFF5", // Verde bem claro
    borderColor: "#34C759", // Borda verde forte
  },
  tagText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000000",
    textAlign: "center",
  },
  tagTextSelected: {
    color: "#1E7132", // Verde mais escuro para o texto para garantir leitura
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: "#FFFFFF",
    gap: 12,
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
    backgroundColor: "#F2F2F7",
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
