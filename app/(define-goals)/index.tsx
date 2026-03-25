import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const CARD_MARGIN = 12;
const CARD_WIDTH = (width - 48 - CARD_MARGIN) / 2; // 48 = padding horizontal total (24+24)

// Dados extraídos da imagem, adaptados com ícones para melhor UX no mobile
const GOALS = [
  {
    id: "1",
    title: "Melhora do Sono",
    desc: "Ajuda para dormir melhor",
    icon: "moon",
  },
  {
    id: "2",
    title: "Mais Calma",
    desc: "Controle da agitação diária",
    icon: "wind",
  },
  {
    id: "3",
    title: "Aumento do Foco",
    desc: "Melhorar a concentração",
    icon: "target",
  },
  {
    id: "4",
    title: "Menos Estresse",
    desc: "Reduzir o estresse diário",
    icon: "smile",
  },
  {
    id: "5",
    title: "Ansiedade",
    desc: "Alívio dos sintomas",
    icon: "activity",
  },
  {
    id: "6",
    title: "Dor Crônica",
    desc: "Reduzir dores persistentes",
    icon: "thermometer",
  },
  { id: "7", title: "TDAH", desc: "Atenção e foco para TDAH", icon: "zap" },
  { id: "8", title: "Outro", desc: "Especificar outro motivo", icon: "plus" },
];

export default function DefineGoalsScreen() {
  // Estado para armazenar o ID selecionado (Permite apenas 1 seleção por vez)
  const [selectedGoal, setSelectedGoal] = useState(null);

  const router = useRouter();

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
        <Text style={styles.progressText}>Passo 1 de 5</Text>
        <View style={{ width: 40 }} />{" "}
        {/* Espaçador para centralizar o texto */}
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

        <Text style={styles.sectionHeader}>Objetivo Principal</Text>

        {/* GRADE DE OPÇÕES (GRID) */}
        <View style={styles.grid}>
          {GOALS.map((goal) => {
            const isSelected = selectedGoal === goal.id;

            return (
              <TouchableOpacity
                key={goal.id}
                activeOpacity={0.7}
                onPress={() => setSelectedGoal(goal.id)}
                style={[styles.card, isSelected && styles.cardSelected]}
              >
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.iconWrapper,
                      isSelected && styles.iconWrapperSelected,
                    ]}
                  >
                    <Feather
                      name={goal.icon}
                      size={20}
                      color={isSelected ? "#34C759" : "#8E8E93"}
                    />
                  </View>
                  {isSelected && (
                    <Feather name="check-circle" size={20} color="#34C759" />
                  )}
                </View>

                <View>
                  <Text
                    style={[
                      styles.cardTitle,
                      isSelected && styles.textSelected,
                    ]}
                  >
                    {goal.title}
                  </Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {goal.desc}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* FOOTER FIXO: Botão Avançar */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            !selectedGoal && styles.primaryButtonDisabled,
          ]}
          activeOpacity={0.8}
          disabled={!selectedGoal}
          onPress={() => router.push("/(define-goals-2)")}
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
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: CARD_MARGIN, // Espaço vertical entre os cards
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#F2F2F7", // Cinza padrão iOS para fundos secundários
    borderRadius: 16,
    padding: 16,
    minHeight: 140,
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "transparent",
  },
  cardSelected: {
    backgroundColor: "#F2FFF5", // Fundo verde beeem clarinho
    borderColor: "#34C759", // Borda verde destacada
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E5EA",
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapperSelected: {
    backgroundColor: "rgba(52, 199, 89, 0.15)", // Fundo do ícone esverdeado quando selecionado
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  textSelected: {
    color: "#1E7132", // Título fica um verde mais escuro para leitura
  },
  cardDesc: {
    fontSize: 13,
    color: "#8E8E93",
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: "#FFFFFF",
    // Sombra sutil no topo do footer para destacar do conteúdo rolável
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButton: {
    backgroundColor: "#34C759",
    borderRadius: 14,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    backgroundColor: "#E5E5EA", // Botão cinza claro quando nada foi selecionado
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 17,
  },
});
