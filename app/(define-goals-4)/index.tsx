import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

// 1. Importações do Hook Form, Zod e Firebase
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { db, auth } from "@/firebaseConfig"; // Ajuste o caminho da sua config
import { doc, setDoc } from "firebase/firestore";

const GENDER_OPTIONS = [
  { id: "masculino", label: "Masculino", icon: "user" },
  { id: "feminino", label: "Feminino", icon: "user" },
  { id: "outros", label: "Outros", icon: "users" },
];

// 2. Schema de validação Zod
const physicalInfoSchema = z.object({
  height: z.string().min(1, "A altura é obrigatória"),
  weight: z.string().min(1, "O peso é obrigatório"),
  gender: z.string().min(1, "O sexo é obrigatório"),
});

export default function DefineGoalsScreenFour() {
  const router = useRouter();
  const user = auth?.currentUser;

  // 3. Configuração do React Hook Form
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isValid, isSubmitting },
  } = useForm({
    resolver: zodResolver(physicalInfoSchema),
    mode: "onChange", // Valida o form a cada digitação para liberar o botão de avançar
    defaultValues: {
      height: "",
      weight: "",
      gender: "",
    },
  });

  // Observa a opção selecionada para trocar a cor do botão
  const selectedGender = watch("gender");

  // 4. Função para salvar no Firestore
  const onSubmit = async (data) => {
    if (!user?.uid) {
      Alert.alert("Erro", "Usuário não autenticado.");
      return;
    }

    try {
      // Usando a mesma coleção "patients" do passo anterior
      const patientRef = doc(db, "patients", user.uid);

      // merge: true adiciona sem deletar a saúde mental (Passo 3) e o histórico (Passo 2)
      await setDoc(patientRef, { physicalInfo: data }, { merge: true });

      router.push("/(define-goals-5)");
    } catch (error) {
      console.error("Erro ao salvar informações físicas:", error);
      Alert.alert("Erro", "Não foi possível salvar seus dados.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              disabled={isSubmitting}
            >
              <Feather name="arrow-left" size={24} color="#000000" />
            </TouchableOpacity>
            <Text style={styles.progressText}>Passo 4 de 5</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled" // Permite clicar na lista sem precisar fechar o teclado antes
          >
            {/* TÍTULOS */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Defina seu objetivo</Text>
              <Text style={styles.subtitle}>
                Nossa inteligência artificial irá te auxiliar com algumas
                perguntas para personalizar sua experiência médica.
              </Text>
            </View>

            <Text style={styles.sectionHeader}>Informações Físicas</Text>

            {/* INPUTS: ALTURA E PESO LADO A LADO */}
            <View style={styles.rowInputs}>
              {/* ALTURA */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Altura</Text>
                <View style={styles.inputWrapper}>
                  <Controller
                    control={control}
                    name="height"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={styles.input}
                        placeholder="1,80"
                        placeholderTextColor="#8E8E93"
                        keyboardType="decimal-pad"
                        value={value}
                        onChangeText={onChange}
                        maxLength={4}
                      />
                    )}
                  />
                  <Text style={styles.unitText}>m</Text>
                </View>
              </View>

              {/* PESO */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Peso</Text>
                <View style={styles.inputWrapper}>
                  <Controller
                    control={control}
                    name="weight"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={styles.input}
                        placeholder="70"
                        placeholderTextColor="#8E8E93"
                        keyboardType="decimal-pad"
                        value={value}
                        onChangeText={onChange}
                        maxLength={5}
                      />
                    )}
                  />
                  <Text style={styles.unitText}>kg</Text>
                </View>
              </View>
            </View>

            {/* SELEÇÃO DE SEXO */}
            <Text style={[styles.sectionHeader, { marginTop: 12 }]}>Sexo</Text>
            <View style={styles.genderList}>
              {GENDER_OPTIONS.map((option, index) => {
                const isSelected = selectedGender === option.id;
                const isLast = index === GENDER_OPTIONS.length - 1;

                return (
                  <TouchableOpacity
                    key={option.id}
                    activeOpacity={0.7}
                    onPress={() =>
                      setValue("gender", option.id, { shouldValidate: true })
                    }
                    style={[
                      styles.genderRow,
                      !isLast && styles.genderRowSeparator,
                      isSelected && styles.genderRowSelected,
                    ]}
                  >
                    <View style={styles.genderRowLeft}>
                      <Feather
                        name={option.icon}
                        size={20}
                        color={isSelected ? "#34C759" : "#8E8E93"}
                      />
                      <Text
                        style={[
                          styles.genderText,
                          isSelected && styles.genderTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </View>

                    {isSelected && (
                      <Feather name="check" size={20} color="#34C759" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* FOOTER FIXO */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.6}
              onPress={() => router.back()}
              disabled={isSubmitting}
            >
              <Text style={styles.secondaryButtonText}>Voltar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              style={[
                styles.primaryButton,
                (!isValid || isSubmitting) && styles.primaryButtonDisabled,
              ]}
              activeOpacity={0.8}
              disabled={!isValid || isSubmitting}
            >
              <Text
                style={[
                  styles.primaryButtonText,
                  (!isValid || isSubmitting) &&
                    styles.primaryButtonTextDisabled,
                ]}
              >
                {isSubmitting ? "Salvando..." : "Avançar"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  keyboardAvoid: { flex: 1 },
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
  progressText: { fontSize: 15, fontWeight: "600", color: "#8E8E93" },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  titleContainer: { marginTop: 16, marginBottom: 32 },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: { fontSize: 16, color: "#3C3C43", lineHeight: 22 },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 16,
    marginTop: 8,
  },
  rowInputs: { flexDirection: "row", gap: 16, marginBottom: 24 },
  inputGroup: { flex: 1 },
  inputLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
  },
  input: { flex: 1, height: "100%", fontSize: 17, color: "#000000" },
  unitText: {
    fontSize: 17,
    color: "#8E8E93",
    fontWeight: "500",
    marginLeft: 8,
  },
  genderList: {
    backgroundColor: "#F2F2F7",
    borderRadius: 16,
    overflow: "hidden",
  },
  genderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  genderRowSeparator: { borderBottomWidth: 1, borderBottomColor: "#F2F2F7" },
  genderRowSelected: { backgroundColor: "#F2FFF5" },
  genderRowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  genderText: { fontSize: 16, color: "#000000", fontWeight: "400" },
  genderTextSelected: { color: "#1E7132", fontWeight: "600" },
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
  primaryButtonDisabled: { backgroundColor: "#E5E5EA" },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "600", fontSize: 17 },
  primaryButtonTextDisabled: { color: "#8E8E93" },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    borderRadius: 14,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: { color: "#000000", fontWeight: "600", fontSize: 17 },
});
