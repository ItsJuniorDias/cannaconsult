import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";

// 1. Importações do Hook Form, Zod e Firebase
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { db, auth } from "@/firebaseConfig"; // Ajuste para o caminho real do seu projeto
import { doc, setDoc } from "firebase/firestore";

const { width } = Dimensions.get("window");
const CARD_MARGIN = 12;
const CARD_WIDTH = (width - 48 - CARD_MARGIN) / 2;

const PRODUCT_PREFERENCES = [
  { id: "flores", label: "Flores", icon: "feather" },
  { id: "oleos", label: "Óleos", icon: "droplet" },
  { id: "extracoes", label: "Extrações", icon: "package" },
  { id: "gummies", label: "Gummies", icon: "smile" },
  { id: "pomadas", label: "Pomadas", icon: "heart" },
];

// 2. Definição do Schema com Zod
const preferencesSchema = z.object({
  selectedProducts: z.array(z.string()).default([]),
  duration: z.number().min(1, "Duração mínima é 1 mês").max(24).default(3),
  investment: z.number().min(0).max(5000).default(1000),
});

export default function DefineGoalsScreenFive() {
  const router = useRouter();
  const user = auth?.currentUser;

  // 3. Inicialização do React Hook Form
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      selectedProducts: [],
      duration: 3,
      investment: 1000,
    },
  });

  // Observamos os valores para renderizar a UI dinamicamente
  const selectedProducts = watch("selectedProducts");
  const duration = watch("duration");
  const investment = watch("investment");

  // 4. Funções de atualização via setValue
  const toggleProduct = (id) => {
    if (selectedProducts.includes(id)) {
      setValue(
        "selectedProducts",
        selectedProducts.filter((item) => item !== id),
      );
    } else {
      setValue("selectedProducts", [...selectedProducts, id]);
    }
  };

  const decreaseDuration = () => {
    if (duration > 1) setValue("duration", duration - 1);
  };

  const increaseDuration = () => {
    if (duration < 24) setValue("duration", duration + 1);
  };

  const formatCurrency = (value) => {
    return `R$ ${value.toLocaleString("pt-BR")}`;
  };

  // 5. Função para salvar os dados finais no Firestore
  const onSubmit = async (data) => {
    if (!user?.uid) {
      Alert.alert("Erro", "Usuário não autenticado.");
      return;
    }

    try {
      const patientRef = doc(db, "patients", user.uid);

      const preferencesRef = doc(db, "preferences", user.uid);

      await setDoc(
        preferencesRef,
        {
          ...data,
          userId: user.uid,
          updatedAt: new Date(), // Opcional: boa prática para saber quando foi salvo
        },
        { merge: true },
      );

      // Salva o último grupo de informações preservando o histórico dos Passos 1 ao 4
      await setDoc(patientRef, { preferences: data }, { merge: true });

      // Sucesso! Redireciona para a tela final de perfil criado
      router.push("/(success-profile)");
    } catch (error) {
      console.error("Erro ao salvar preferências finais:", error);
      Alert.alert("Erro", "Não foi possível finalizar seu cadastro.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          disabled={isSubmitting}
        >
          <Feather name="arrow-left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.progressText}>Passo 5 de 5</Text>
        <View style={{ width: 40 }} />
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

        {/* SEÇÃO 1: PREFERÊNCIAS (GRID) */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Preferências</Text>
          <Text style={styles.sectionSubtitle}>
            Selecione os produtos que você tem preferência para uso.
          </Text>

          <View style={styles.grid}>
            {PRODUCT_PREFERENCES.map((product) => {
              const isSelected = selectedProducts.includes(product.id);

              return (
                <TouchableOpacity
                  key={product.id}
                  activeOpacity={0.7}
                  onPress={() => toggleProduct(product.id)}
                  style={[styles.card, isSelected && styles.cardSelected]}
                  disabled={isSubmitting}
                >
                  <View
                    style={[
                      styles.iconWrapper,
                      isSelected && styles.iconWrapperSelected,
                    ]}
                  >
                    <Feather
                      name={product.icon}
                      size={24}
                      color={isSelected ? "#34C759" : "#8E8E93"}
                    />
                  </View>
                  <Text
                    style={[
                      styles.cardLabel,
                      isSelected && styles.cardLabelSelected,
                    ]}
                  >
                    {product.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* SEÇÃO 2: DURAÇÃO DO TRATAMENTO */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Expectativa de duração</Text>

          <View style={styles.stepperContainer}>
            <TouchableOpacity
              style={[
                styles.stepperButton,
                duration <= 1 && styles.stepperDisabled,
              ]}
              onPress={decreaseDuration}
              disabled={duration <= 1 || isSubmitting}
            >
              <Feather
                name="minus"
                size={20}
                color={duration <= 1 ? "#C7C7CC" : "#000"}
              />
            </TouchableOpacity>

            <Text style={styles.stepperValue}>
              {duration} {duration === 1 ? "mês" : "meses"}
            </Text>

            <TouchableOpacity
              style={styles.stepperButton}
              onPress={increaseDuration}
              disabled={isSubmitting}
            >
              <Feather name="plus" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* SEÇÃO 3: INVESTIMENTO MENSAL (SLIDER) */}
        <View style={styles.section}>
          <View style={styles.sliderHeaderRow}>
            <Text style={styles.sectionHeader}>Investimento mensal</Text>
            <Text style={styles.sliderRange}>(R$ 0 - R$ 5.000)</Text>
          </View>

          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={5000}
            step={100}
            value={investment}
            onValueChange={(val) => setValue("investment", val)}
            minimumTrackTintColor="#34C759"
            maximumTrackTintColor="#E5E5EA"
            thumbTintColor="#FFFFFF"
            disabled={isSubmitting} // Bloqueia arrastar enquanto salva
          />

          <View style={styles.sliderValueContainer}>
            <Text style={styles.investmentText}>
              {formatCurrency(investment)}
            </Text>
            <Text style={styles.perMonthText}>/mês</Text>
          </View>
        </View>
      </ScrollView>

      {/* FOOTER FIXO: Voltar e Finalizar */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.6}
          onPress={() => router.back()}
          disabled={isSubmitting}
        >
          <Text style={styles.secondaryButtonText}>Voltar</Text>
        </TouchableOpacity>

        {/* 6. Submissão do Formulário */}
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          style={[styles.primaryButton, isSubmitting && { opacity: 0.7 }]}
          activeOpacity={0.8}
          disabled={isSubmitting}
        >
          <Text style={styles.primaryButtonText}>
            {isSubmitting ? "Finalizando..." : "Finalizar"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ... Estilos originais mantidos abaixo
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
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
  section: { marginBottom: 36 },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 4,
  },
  sectionSubtitle: { fontSize: 14, color: "#8E8E93", marginBottom: 16 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: CARD_MARGIN,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#F2F2F7",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    height: 110,
    borderWidth: 2,
    borderColor: "transparent",
  },
  cardSelected: { backgroundColor: "#F2FFF5", borderColor: "#34C759" },
  iconWrapper: { marginBottom: 12 },
  cardLabel: { fontSize: 15, fontWeight: "500", color: "#3C3C43" },
  cardLabelSelected: { color: "#1E7132", fontWeight: "600" },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
  },
  stepperDisabled: { backgroundColor: "#F9F9F9" },
  stepperValue: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
    marginHorizontal: 24,
    minWidth: 80,
    textAlign: "center",
  },
  sliderHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sliderRange: { fontSize: 14, color: "#8E8E93", fontWeight: "500" },
  slider: {
    width: "100%",
    height: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  sliderValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 8,
  },
  investmentText: { fontSize: 24, fontWeight: "700", color: "#000000" },
  perMonthText: {
    fontSize: 15,
    color: "#8E8E93",
    marginLeft: 4,
    fontWeight: "500",
  },
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
  primaryButtonText: { color: "#FFFFFF", fontWeight: "600", fontSize: 17 },
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
