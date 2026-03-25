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

// Importações do Firebase Auth e Firestore
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "@/firebaseConfig"; // Ajuste o caminho

// --- 1. Schemas de Validação (Zod) ---
// VOLTAMOS PARA O CRM NO LOGIN
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

type FormData = z.infer<typeof registerSchema>; // Usamos o maior para o form state

export default function MedicalLoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    defaultValues: { name: "", crm: "", email: "", password: "" },
  });

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    clearErrors();
    reset();
  };

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

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);

    try {
      if (isLogin) {
        // --- LOGAR USUÁRIO (CRM + Senha) ---
        // 1. Busca o e-mail vinculado ao CRM no Firestore
        const q = query(
          collection(db, "physicians"),
          where("crm", "==", data.crm),
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          Alert.alert("Erro", "Nenhuma conta encontrada com este CRM.");
          setIsLoading(false);
          return;
        }

        // 2. Pega o e-mail do documento encontrado
        const userEmail = querySnapshot.docs[0].data().email;

        // 3. Faz o login no Firebase Auth usando o e-mail recuperado e a senha digitada
        await signInWithEmailAndPassword(auth, userEmail, data.password);

        console.log("Login realizado com sucesso");
        router.replace("/(area-physician)");
      } else {
        // --- CADASTRAR USUÁRIO ---
        try {
          await checkCrmInApi(data.crm);
        } catch (error: any) {
          setError("crm", { type: "manual", message: error.message });
          setIsLoading(false);
          return;
        }

        // Cria o usuário no Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password,
        );

        if (userCredential.user) {
          await updateProfile(userCredential.user, { displayName: data.name });

          // SALVA O CRM E E-MAIL NO FIRESTORE (Essencial para o login futuro funcionar)
          await setDoc(doc(db, "physicians", userCredential.user.uid), {
            name: data.name,
            crm: data.crm,
            email: data.email,
            createdAt: new Date(),
          });
        }

        Alert.alert("Sucesso", "Cadastro realizado com sucesso!");
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error(error);
      if (error.code === "auth/email-already-in-use") {
        Alert.alert("Erro", "Este e-mail já está em uso.");
      } else if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        Alert.alert("Erro", "Senha incorreta.");
      } else {
        Alert.alert("Erro", "Ocorreu um erro ao processar sua solicitação.");
      }
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
                    onChangeText={(text) => onChange(text.toUpperCase())}
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

            {/* Campo SENHA (Sempre visível) */}
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
