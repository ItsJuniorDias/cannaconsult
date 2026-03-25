import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

import { auth } from "@/firebaseConfig";

export default function OnboardingScreen() {
  const router = useRouter();

  const isLogged = auth.currentUser; // Verifica se o usuário está logado

  return (
    <SafeAreaView style={styles.container}>
      {/* StatusBar escura porque o fundo agora é branco */}
      <StatusBar style="dark" />

      <View style={styles.content}>
        {/* ÍCONE DE DESTAQUE SUPERIOR (Estilo Apple Health) */}
        <View style={styles.iconContainer}>
          <View style={styles.iconBackground}>
            <Feather name="activity" size={32} color="#34C759" />
          </View>
        </View>

        {/* TÍTULO PRINCIPAL */}
        <Text style={styles.title}>
          Um tratamento seguro, legal e humanizado para transformar sua saúde
          com <Text style={styles.titleHighlight}>cannabis medicinal.</Text>
        </Text>

        {/* PARÁGRAFO EXPLICATIVO */}
        <Text style={styles.subtitle}>
          Atendimento médico especializado e suporte contínuo. A{" "}
          <Text style={styles.textBold}>Canna Consult</Text> une ciência e
          tecnologia para ajudar você a superar insônia, ansiedade e dores
          crônicas, com total segurança jurídica.
        </Text>

        {/* ESPAÇADOR FLEXÍVEL PARA EMPURRAR BOTÕES PARA BAIXO */}
        <View style={styles.spacer} />

        {/* BOTÕES DE AÇÃO */}
        <View style={styles.buttonsWrapper}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={() => {
              if (isLogged) {
                router.push("/(available-physicians)");
              } else {
                router.push("/(login)");
              }
            }}
          >
            <Text style={styles.primaryButtonText}>Iniciar Avaliação</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.6}
            onPress={() => router.push("/(medical-login)")}
          >
            <Text style={styles.secondaryButtonText}>Área do Medico</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // Fundo super clean e branco
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconBackground: {
    width: 64,
    height: 64,
    borderRadius: 18, // Curvatura padrão de ícone de app iOS
    backgroundColor: "rgba(52, 199, 89, 0.12)", // Fundo verde translúcido super suave
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 34,
    fontWeight: "800", // Título bem grosso estilo "Large Title" do iOS
    color: "#000000",
    lineHeight: 41,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  titleHighlight: {
    color: "#34C759", // Destaque na cor principal do iOS
  },
  subtitle: {
    fontSize: 17, // Tamanho padrão de body text do iOS
    color: "#3C3C43", // Cinza escuro nativo do iOS para subtítulos
    lineHeight: 24,
    fontWeight: "400",
  },
  textBold: {
    fontWeight: "600",
    color: "#000000",
  },
  spacer: {
    flex: 1, // Isso empurra os botões para a parte inferior da tela
  },
  buttonsWrapper: {
    gap: 12, // Menos espaço entre os botões para parecer um grupo coeso
  },
  primaryButton: {
    backgroundColor: "#34C759", // Verde Apple
    borderRadius: 14, // Curvatura padrão de botões no iOS 15+
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 17, // Tamanho nativo de botão
  },
  secondaryButton: {
    backgroundColor: "#F2F2F7", // Cinza clarinho nativo do iOS para botões secundários
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  secondaryButtonText: {
    color: "#34C759", // Texto verde combinando com a identidade
    fontWeight: "600",
    fontSize: 17,
  },
});
