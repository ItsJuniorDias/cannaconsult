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
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

// 1. Imports de Integração
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebaseConfig"; // ATENÇÃO: Verifique o caminho do seu arquivo de configuração do Firebase

// 2. Schema de Validação (Zod)
const registerSchema = z
  .object({
    nome: z
      .string({ error: "Nome é obrigatório" })
      .min(3, "O nome deve ter pelo menos 3 caracteres"),
    email: z.string({ error: "E-mail é obrigatório" }).email("E-mail inválido"),
    cpf: z.string({ error: "CPF é obrigatório" }).min(11, "CPF inválido"),

    telefone: z.string().optional(),
    cep: z.string().optional(),
    endereco: z.string().optional(),
    numero: z.string().optional(),
    complemento: z.string().optional(),
    cidade: z.string().optional(),

    dataNascimento: z
      .string({ error: "Data de nascimento é obrigatória" })
      .min(8, "Data incompleta"),
    senha: z
      .string({ error: "Senha é obrigatória" })
      .min(8, "Mínimo de 8 caracteres")
      .regex(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula"),
    confirmarSenha: z
      .string({ error: "Confirme sua senha" })
      .min(1, "Confirme sua senha"),
    termos: z
      .boolean({ error: "Aceite os termos para continuar" })
      .refine((val) => val === true, {
        message: "Você deve aceitar os termos e condições",
      }),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// Componente auxiliar ajustado para receber erros do React Hook Form
const InputField = ({
  label,
  required,
  style,
  error,
  ...props
}: {
  label: string;
  required?: boolean;
  style?: object;
  error?: string;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  secureTextEntry?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
}) => (
  <View style={[styles.inputContainer, style]}>
    <Text style={styles.inputLabel}>
      {label} {required && <Text style={styles.asterisk}>*</Text>}
    </Text>
    <TextInput
      style={[styles.input, error && styles.inputError]}
      placeholderTextColor="#8E8E93"
      {...props}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  // 3. Inicialização do React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      termos: false,
    },
  });

  // 4. Função de Cadastro (Firebase)
  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      // Cria o usuário no Firebase Authentication
      await createUserWithEmailAndPassword(auth, data.email, data.senha);

      // Aqui você poderia salvar os dados adicionais (nome, CPF, etc.) no Firestore

      Alert.alert("Sucesso!", "Sua conta foi criada com sucesso.");

      router.replace("/(login)"); // Ou a rota da sua Home logada
    } catch (error: any) {
      console.error(error);
      const message =
        error.code === "auth/email-already-in-use"
          ? "Este e-mail já está cadastrado."
          : error.code === "auth/invalid-email"
            ? "Formato de e-mail inválido."
            : "Ocorreu um erro ao criar a conta. Tente novamente.";
      Alert.alert("Erro no Cadastro", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Feather name="arrow-left" size={24} color="#000000" />
            </TouchableOpacity>

            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>
              Preencha os dados abaixo para criar sua conta.
            </Text>
          </View>

          {/* FORMULÁRIO */}
          <View style={styles.form}>
            <Controller
              control={control}
              name="nome"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  label="Nome Completo"
                  required
                  placeholder="Digite seu nome completo"
                  autoCapitalize="words"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.nome?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  label="Email"
                  required
                  placeholder="Digite seu email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="cpf"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  label="CPF"
                  required
                  placeholder="000.000.000-00"
                  keyboardType="numeric"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.cpf?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="telefone"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  label="Telefone"
                  placeholder="(11) 99999-9999"
                  keyboardType="phone-pad"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.telefone?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="cep"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  label="CEP"
                  placeholder="00000-000"
                  keyboardType="numeric"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.cep?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="endereco"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  label="Endereço"
                  placeholder="Rua, avenida, etc"
                  autoCapitalize="words"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.endereco?.message}
                />
              )}
            />

            <View style={styles.row}>
              <Controller
                control={control}
                name="numero"
                render={({ field: { onChange, onBlur, value } }) => (
                  <InputField
                    label="Número"
                    placeholder="123"
                    keyboardType="numeric"
                    style={styles.halfInput}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    error={errors.numero?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="complemento"
                render={({ field: { onChange, onBlur, value } }) => (
                  <InputField
                    label="Complemento"
                    placeholder="Apto 101"
                    style={styles.halfInput}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    error={errors.complemento?.message}
                  />
                )}
              />
            </View>

            <Controller
              control={control}
              name="cidade"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  label="Cidade"
                  placeholder="Nome da cidade"
                  autoCapitalize="words"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.cidade?.message}
                />
              )}
            />

            {/* DATA DE NASCIMENTO (Layout Customizado) */}
            <Controller
              control={control}
              name="dataNascimento"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Data de Nascimento <Text style={styles.asterisk}>*</Text>
                  </Text>
                  <View
                    style={[
                      styles.inputWithIcon,
                      errors.dataNascimento && styles.inputError,
                    ]}
                  >
                    <TextInput
                      style={styles.inputFlex}
                      placeholder="dd/mm/aaaa"
                      placeholderTextColor="#8E8E93"
                      keyboardType="numeric"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                    />
                    <Feather
                      name="calendar"
                      size={20}
                      color="#8E8E93"
                      style={styles.iconRight}
                    />
                  </View>
                  {errors.dataNascimento && (
                    <Text style={styles.errorText}>
                      {errors.dataNascimento.message}
                    </Text>
                  )}
                </View>
              )}
            />

            {/* SENHA (Layout Customizado) */}
            <Controller
              control={control}
              name="senha"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Senha <Text style={styles.asterisk}>*</Text>
                  </Text>
                  <View
                    style={[
                      styles.inputWithIcon,
                      errors.senha && styles.inputError,
                    ]}
                  >
                    <TextInput
                      style={styles.inputFlex}
                      placeholder="Digite sua senha"
                      placeholderTextColor="#8E8E93"
                      secureTextEntry={!showPassword}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Feather
                        name={showPassword ? "eye" : "eye-off"}
                        size={20}
                        color="#8E8E93"
                        style={styles.iconRight}
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.senha ? (
                    <Text style={styles.errorText}>{errors.senha.message}</Text>
                  ) : (
                    <Text style={styles.helperText}>
                      Mínimo 8 dígitos e 1 letra maiúscula
                    </Text>
                  )}
                </View>
              )}
            />

            {/* CONFIRMAR SENHA (Layout Customizado) */}
            <Controller
              control={control}
              name="confirmarSenha"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Confirmar Senha <Text style={styles.asterisk}>*</Text>
                  </Text>
                  <View
                    style={[
                      styles.inputWithIcon,
                      errors.confirmarSenha && styles.inputError,
                    ]}
                  >
                    <TextInput
                      style={styles.inputFlex}
                      placeholder="Confirme sua senha"
                      placeholderTextColor="#8E8E93"
                      secureTextEntry={!showConfirmPassword}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      <Feather
                        name={showConfirmPassword ? "eye" : "eye-off"}
                        size={20}
                        color="#8E8E93"
                        style={styles.iconRight}
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.confirmarSenha && (
                    <Text style={styles.errorText}>
                      {errors.confirmarSenha.message}
                    </Text>
                  )}
                </View>
              )}
            />

            {/* TERMOS E CONDIÇÕES */}
            <Controller
              control={control}
              name="termos"
              render={({ field: { onChange, value } }) => (
                <View>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    activeOpacity={0.7}
                    onPress={() => onChange(!value)}
                  >
                    <View
                      style={[styles.checkbox, value && styles.checkboxActive]}
                    >
                      {value && (
                        <Feather name="check" size={14} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>
                      Aceito os Termos e Condições
                    </Text>
                  </TouchableOpacity>
                  {errors.termos && (
                    <Text
                      style={[
                        styles.errorText,
                        { marginTop: -8, marginBottom: 8 },
                      ]}
                    >
                      {errors.termos.message}
                    </Text>
                  )}
                </View>
              )}
            />

            {/* BOTÃO CRIAR CONTA */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                loading && styles.primaryButtonDisabled,
              ]}
              activeOpacity={0.8}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Criar Conta</Text>
              )}
            </TouchableOpacity>

            {/* LINK LOGIN */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Já possui conta? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.loginLink}>Faça login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginBottom: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: "#3C3C43",
    lineHeight: 22,
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
  asterisk: {
    color: "#34C759",
  },
  input: {
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    fontSize: 17,
    color: "#000000",
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 13,
    marginLeft: 4,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    height: 54,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputFlex: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 16,
    fontSize: 17,
    color: "#000000",
  },
  iconRight: {
    padding: 16,
  },
  helperText: {
    fontSize: 13,
    color: "#8E8E93",
    marginLeft: 4,
    marginTop: -4,
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  halfInput: {
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#C7C7CC",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  checkboxActive: {
    backgroundColor: "#34C759",
    borderColor: "#34C759",
  },
  checkboxLabel: {
    fontSize: 15,
    color: "#000000",
    fontWeight: "400",
  },
  primaryButton: {
    backgroundColor: "#34C759",
    borderRadius: 14,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  primaryButtonDisabled: {
    backgroundColor: "#A1DCAE",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 17,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    color: "#8E8E93",
    fontSize: 15,
  },
  loginLink: {
    color: "#34C759",
    fontSize: 15,
    fontWeight: "600",
  },
});
