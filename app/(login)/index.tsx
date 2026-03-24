import React, { use, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.inner}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* HEADER */}
          <View style={styles.header}>
            {/* Botão de voltar sutil */}
            <TouchableOpacity style={styles.backButton}>
              <Feather name="arrow-left" size={24} color="#000000" />
            </TouchableOpacity>

            <Text style={styles.title}>Bem-vindo de volta</Text>
            <Text style={styles.subtitle}>
              Acesse sua Área do Paciente para continuar seu tratamento.
            </Text>
          </View>

          {/* FORMULÁRIO */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>E-mail</Text>
              <TextInput
                style={styles.input}
                placeholder="nome@exemplo.com"
                placeholderTextColor="#999999"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Senha</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Sua senha"
                  placeholderTextColor="#999999"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Feather
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#8E8E93" // Cinza padrão de ícones do iOS
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          </View>

          {/* ESPAÇADOR E BOTÕES */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() => router.push("/(define-goals)")}
              style={styles.primaryButton}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Entrar</Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Ainda não é paciente? </Text>
              <TouchableOpacity
                onPress={() => router.push("/(create-account)")}
              >
                <Text style={styles.signupLink}>Iniciar Avaliação</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  header: {
    marginTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginBottom: 16,
    marginLeft: -8, // Compensa o padding para alinhar visualmente com o título
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: "#3C3C43", // Cinza nativo do iOS para subtítulos
    lineHeight: 22,
    marginBottom: 32,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000000",
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#F2F2F7", // Fundo de input padrão do iOS
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    fontSize: 17,
    color: "#000000",
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    height: 54,
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 16,
    fontSize: 17,
    color: "#000000",
  },
  eyeIcon: {
    padding: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    paddingVertical: 8,
  },
  forgotPasswordText: {
    color: "#34C759", // Verde principal para links
    fontSize: 15,
    fontWeight: "600",
  },
  footer: {
    marginTop: "auto",
    paddingBottom: 20,
    paddingTop: 20,
  },
  primaryButton: {
    backgroundColor: "#34C759",
    borderRadius: 14,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 17,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    color: "#8E8E93",
    fontSize: 15,
  },
  signupLink: {
    color: "#34C759",
    fontSize: 15,
    fontWeight: "600",
  },
});
