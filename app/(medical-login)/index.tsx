import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// --- 1. Schemas de Validação (Zod) ---
const loginSchema = z.object({
  crm: z
    .string()
    .regex(/^\d{4,10}-[A-Z]{2}$/, "Formato inválido (ex: 123456-SP)"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

const registerSchema = z.object({
  name: z.string().min(3, "O nome completo é obrigatório"),
  crm: z
    .string()
    .regex(/^\d{4,10}-[A-Z]{2}$/, "Formato inválido (ex: 123456-SP)"),
  email: z.string().email("Digite um e-mail válido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

// Tipagem baseada nos schemas
type FormData = z.infer<typeof registerSchema>;

export default function MedicalLoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // --- 2. Configuração do React Hook Form ---
  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    // Alterna o schema de validação dinamicamente com base no estado
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    defaultValues: {
      name: "",
      crm: "",
      email: "",
      password: "",
    },
  });

  // Função para alternar entre Login e Cadastro e limpar os erros/campos
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    clearErrors();
    reset();
  };

  // --- 3. Simulação da API de Validação do CRM ---
  const checkCrmInApi = async (crm: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (crm.includes("0000")) {
          reject(new Error("CRM não encontrado no conselho federal."));
        } else {
          resolve(true);
        }
      }, 1500);
    });
  };

  // --- 4. Submissão do Formulário ---
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);

    try {
      if (isLogin) {
        // Agora fazemos login usando o CRM e a Senha
        console.log("Fazendo Login com:", data.crm, data.password);
        // Lógica de Login (Supabase, Firebase, sua API, etc)

        router.replace("/(area-physician)"); // Redireciona para a área do médico após login
      } else {
        // Validação Assíncrona do CRM via API durante o Cadastro
        try {
          await checkCrmInApi(data.crm);
        } catch (error: any) {
          setError("crm", { type: "manual", message: error.message });
          setIsLoading(false);
          return;
        }

        console.log("Criando conta para:", data);
        Alert.alert("Sucesso", "Cadastro realizado com sucesso!");

        setIsLogin(true);
      }
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao processar sua solicitação.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              {isLogin ? "Portal do Médico" : "Criar Conta"}
            </Text>
            <Text style={styles.subtitle}>
              {isLogin
                ? "Acesse sua conta para continuar"
                : "Preencha seus dados profissionais"}
            </Text>
          </View>

          <View style={styles.form}>
            {/* Campo NOME (Apenas Cadastro) */}
            {!isLogin && (
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value } }) => (
                  <>
                    <TextInput
                      style={[styles.input, errors.name && styles.inputError]}
                      placeholder="Nome Completo"
                      placeholderTextColor="#8E8E93"
                      autoCapitalize="words"
                      value={value}
                      onChangeText={onChange}
                      editable={!isLoading}
                    />
                    {errors.name && (
                      <Text style={styles.errorText}>
                        {errors.name.message}
                      </Text>
                    )}
                  </>
                )}
              />
            )}

            {/* Campo CRM (Sempre visível: Login e Cadastro) */}
            <Controller
              control={control}
              name="crm"
              render={({ field: { onChange, value } }) => (
                <>
                  <TextInput
                    style={[styles.input, errors.crm && styles.inputError]}
                    placeholder="CRM (ex: 123456-SP)"
                    placeholderTextColor="#8E8E93"
                    autoCapitalize="characters"
                    value={value}
                    onChangeText={(text) => onChange(text.toUpperCase())} // Força maiúsculas
                    editable={!isLoading}
                  />
                  {errors.crm && (
                    <Text style={styles.errorText}>{errors.crm.message}</Text>
                  )}
                </>
              )}
            />

            {/* Campo E-MAIL (Apenas Cadastro) */}
            {!isLogin && (
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <>
                    <TextInput
                      style={[styles.input, errors.email && styles.inputError]}
                      placeholder="E-mail"
                      placeholderTextColor="#8E8E93"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={value}
                      onChangeText={onChange}
                      editable={!isLoading}
                    />
                    {errors.email && (
                      <Text style={styles.errorText}>
                        {errors.email.message}
                      </Text>
                    )}
                  </>
                )}
              />
            )}

            {/* Campo SENHA (Sempre visível: Login e Cadastro) */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <>
                  <TextInput
                    style={[styles.input, errors.password && styles.inputError]}
                    placeholder="Senha"
                    placeholderTextColor="#8E8E93"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    editable={!isLoading}
                  />
                  {errors.password && (
                    <Text style={styles.errorText}>
                      {errors.password.message}
                    </Text>
                  )}
                </>
              )}
            />

            {isLogin && (
              <TouchableOpacity style={styles.forgotPasswordButton}>
                <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Botão com Loading */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              isLoading && styles.primaryButtonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {isLogin ? "Entrar" : "Cadastrar"}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isLogin ? "Não possui uma conta? " : "Já possui uma conta? "}
            </Text>
            <TouchableOpacity onPress={toggleAuthMode} disabled={isLoading}>
              <Text style={styles.footerActionText}>
                {isLogin ? "Cadastre-se" : "Faça Login"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  keyboardView: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    paddingVertical: 40,
  },
  header: { marginBottom: 40, marginTop: 20 },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#000000",
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  subtitle: { fontSize: 17, color: "#8E8E93", letterSpacing: -0.2 },
  form: { marginBottom: 30 },
  input: {
    backgroundColor: "#F2F2F7",
    height: 54,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 17,
    color: "#000000",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputError: { borderColor: "#FF3B30", backgroundColor: "#FFF0F0" },
  errorText: {
    color: "#FF3B30",
    fontSize: 13,
    marginBottom: 12,
    marginLeft: 4,
    marginTop: -4,
  },
  forgotPasswordButton: { alignSelf: "flex-end", marginTop: 4 },
  forgotPasswordText: { color: "#34C759", fontSize: 15, fontWeight: "500" },
  primaryButton: {
    backgroundColor: "#34C759",
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#34C759",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonDisabled: { opacity: 0.7 },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.4,
  },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 32 },
  footerText: { fontSize: 15, color: "#8E8E93" },
  footerActionText: { fontSize: 15, color: "#34C759", fontWeight: "600" },
});
