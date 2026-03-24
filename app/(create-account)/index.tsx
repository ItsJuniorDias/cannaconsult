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
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

// Componente auxiliar para os inputs ficarem padronizados e o código mais limpo
const InputField = ({
  label,
  required,
  style,
  ...props
}: {
  label: string;
  required?: boolean;
  style?: object;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  secureTextEntry?: boolean;
}) => (
  <View style={[styles.inputContainer, style]}>
    <Text style={styles.inputLabel}>
      {label} {required && <Text style={styles.asterisk}>*</Text>}
    </Text>
    <TextInput style={styles.input} placeholderTextColor="#8E8E93" {...props} />
  </View>
);

export default function RegisterScreen() {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

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
            <InputField
              label="Nome Completo"
              required
              placeholder="Digite seu nome completo"
              autoCapitalize="words"
            />

            <InputField
              label="Email"
              required
              placeholder="Digite seu email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <InputField
              label="CPF"
              required
              placeholder="000.000.000-00"
              keyboardType="numeric"
            />

            <InputField
              label="Telefone"
              placeholder="(11) 99999-9999"
              keyboardType="phone-pad"
            />

            <InputField
              label="CEP"
              placeholder="00000-000"
              keyboardType="numeric"
            />

            <InputField
              label="Endereço"
              placeholder="Rua, avenida, etc"
              autoCapitalize="words"
            />

            {/* LINHA DUPLA: NÚMERO E COMPLEMENTO */}
            <View style={styles.row}>
              <InputField
                label="Número"
                placeholder="123"
                keyboardType="numeric"
                style={styles.halfInput}
              />
              <InputField
                label="Complemento"
                placeholder="Apto 101, Bloco"
                style={styles.halfInput}
              />
            </View>

            <InputField
              label="Cidade"
              placeholder="Nome da cidade"
              autoCapitalize="words"
            />

            {/* DATA DE NASCIMENTO */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Data de Nascimento <Text style={styles.asterisk}>*</Text>
              </Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.inputFlex}
                  placeholder="dd/mm/aaaa"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
                <Feather
                  name="calendar"
                  size={20}
                  color="#8E8E93"
                  style={styles.iconRight}
                />
              </View>
            </View>

            {/* SENHA */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Senha <Text style={styles.asterisk}>*</Text>
              </Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.inputFlex}
                  placeholder="Digite sua senha"
                  placeholderTextColor="#8E8E93"
                  secureTextEntry={!showPassword}
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
              <Text style={styles.helperText}>
                Mínimo 8 dígitos e 1 letra maiúscula
              </Text>
            </View>

            {/* CONFIRMAR SENHA */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Confirmar Senha <Text style={styles.asterisk}>*</Text>
              </Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.inputFlex}
                  placeholder="Confirme sua senha"
                  placeholderTextColor="#8E8E93"
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Feather
                    name={showConfirmPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#8E8E93"
                    style={styles.iconRight}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* TERMOS E CONDIÇÕES (Checkbox Apple-like) */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              activeOpacity={0.7}
              onPress={() => setTermsAccepted(!termsAccepted)}
            >
              <View
                style={[
                  styles.checkbox,
                  termsAccepted && styles.checkboxActive,
                ]}
              >
                {termsAccepted && (
                  <Feather name="check" size={14} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                Aceito os Termos e Condições
              </Text>
            </TouchableOpacity>

            {/* BOTÃO CRIAR CONTA */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                !termsAccepted && styles.primaryButtonDisabled, // Desativa visualmente se não aceitar termos
              ]}
              activeOpacity={0.8}
              disabled={!termsAccepted}
            >
              <Text style={styles.primaryButtonText}>Criar Conta</Text>
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
    color: "#34C759", // Asterisco verde para combinar com o tema
  },
  input: {
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    fontSize: 17,
    color: "#000000",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    height: 54,
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
    backgroundColor: "#A1DCAE", // Verde mais opaco quando desativado
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
