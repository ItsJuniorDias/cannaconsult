import React, { useState } from "react";
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
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

// Importações do React Hook Form e Zod
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Importações do Firebase Auth (Ajuste o caminho para o seu arquivo de configuração)
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebaseConfig";

// 1. Definição do Schema de Validação com Zod
const loginSchema = z.object({
  email: z
    .string({ error: "O e-mail é obrigatório." })
    .email("Digite um e-mail válido."),
  password: z
    .string({ error: "A senha é obrigatória." })
    .min(6, "A senha deve ter pelo menos 6 caracteres."),
});

// Inferindo a tipagem do schema
type LoginData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // 2. Configuração do React Hook Form com Zod Resolver
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 3. Função de submissão com Firebase Auth
  const onSubmit = async (data: LoginData) => {
    Keyboard.dismiss();
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      // Login bem sucedido! Navega para a próxima tela
      router.push("/(define-goals)");
    } catch (error: any) {
      console.error(error);
      // Tratamento básico de erros comuns do Firebase
      let errorMessage =
        "Ocorreu um erro ao tentar fazer login. Tente novamente.";
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        errorMessage = "E-mail ou senha incorretos.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Muitas tentativas falhas. Tente novamente mais tarde.";
      }

      Alert.alert("Erro no Login", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              disabled={isLoading}
            >
              <Feather name="arrow-left" size={24} color="#000000" />
            </TouchableOpacity>

            <Text style={styles.title}>Bem-vindo de volta</Text>
            <Text style={styles.subtitle}>
              Acesse sua Área do Paciente para continuar seu tratamento.
            </Text>
          </View>

          {/* FORMULÁRIO */}
          <View style={styles.form}>
            {/* Input de E-mail controlado pelo RHF */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>E-mail</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="nome@exemplo.com"
                    placeholderTextColor="#999999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isLoading}
                  />
                )}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}
            </View>

            {/* Input de Senha controlado pelo RHF */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Senha</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    style={[
                      styles.passwordWrapper,
                      errors.password && styles.inputError,
                    ]}
                  >
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Sua senha"
                      placeholderTextColor="#999999"
                      secureTextEntry={!showPassword}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      editable={!isLoading}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      <Feather
                        name={showPassword ? "eye" : "eye-off"}
                        size={20}
                        color="#8E8E93"
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          </View>

          {/* ESPAÇADOR E BOTÕES */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              style={[
                styles.primaryButton,
                isLoading && styles.primaryButtonDisabled,
              ]}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Ainda não é paciente? </Text>
              <TouchableOpacity
                onPress={() => router.push("/(create-account)")}
                disabled={isLoading}
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
  // ... (seus estilos originais continuam aqui, apenas adicionei os de erro abaixo)
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  inner: { flex: 1, paddingHorizontal: 24, justifyContent: "space-between" },
  header: { marginTop: 20 },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginBottom: 16,
    marginLeft: -8,
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
    color: "#3C3C43",
    lineHeight: 22,
    marginBottom: 32,
  },
  form: { gap: 20 },
  inputContainer: { gap: 8 },
  inputLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000000",
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#F2F2F7",
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
  eyeIcon: { padding: 16 },
  forgotPassword: { alignSelf: "flex-end", paddingVertical: 8 },
  forgotPasswordText: { color: "#34C759", fontSize: 15, fontWeight: "600" },
  footer: { marginTop: "auto", paddingBottom: 20, paddingTop: 20 },
  primaryButton: {
    backgroundColor: "#34C759",
    borderRadius: 14,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "600", fontSize: 17 },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: { color: "#8E8E93", fontSize: 15 },
  signupLink: { color: "#34C759", fontSize: 15, fontWeight: "600" },

  // NOVOS ESTILOS ADICIONADOS:
  inputError: {
    borderWidth: 1,
    borderColor: "#FF3B30", // Vermelho padrão iOS
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 13,
    marginLeft: 4,
  },
  primaryButtonDisabled: {
    backgroundColor: "#8EDC9F", // Verde mais claro para indicar desabilitado
  },
});
