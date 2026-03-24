import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

export default function SuccessProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* CONTEÚDO CENTRALIZADO */}
      <View style={styles.content}>
        {/* Ícone de Sucesso Estilo Apple Pay */}
        <View style={styles.iconContainer}>
          <Feather name="check" size={48} color="#FFFFFF" />
        </View>

        <Text style={styles.title}>Perfil criado com sucesso!</Text>

        <Text style={styles.subtitle}>
          Sua análise foi concluída. Agora você pode prosseguir com sua consulta
          médica.
        </Text>
      </View>

      {/* FOOTER FIXO NA PARTE INFERIOR */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => router.push("/(payment)")}
          style={styles.primaryButton}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Ir para pagar a consulta</Text>
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
  content: {
    flex: 1,
    justifyContent: "center", // Centraliza o conteúdo verticalmente
    alignItems: "center", // Centraliza o conteúdo horizontalmente
    paddingHorizontal: 32, // Um pouco mais de padding lateral para o texto não colar nas bordas
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#34C759", // Verde Apple
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    // Sombra sutil para dar profundidade ao ícone
    shadowColor: "#34C759",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#000000",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#8E8E93", // Cinza padrão da Apple para textos auxiliares
    textAlign: "center",
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24, // Dá um respiro da borda inferior do celular
  },
  primaryButton: {
    backgroundColor: "#34C759",
    borderRadius: 14, // Arredondamento padrão do iOS
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 17,
  },
});
