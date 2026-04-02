import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import Purchases from "react-native-purchases"; // <-- Import da lib
import { useRouter } from "expo-router";

const PLAN_FEATURES = [
  "Consulta médica especializada em 24h",
  "Receita digital com validade legal",
  "Acesso a produtos certificados por parceiros",
  "Suporte prioritário via WhatsApp",
];

export default function PaymentScreen() {
  const [currentPackage, setCurrentPackage] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const configurePurchases = async () => {
      // Substitua pelas suas chaves públicas do RevenueCat
      if (Platform.OS === "ios") {
        Purchases.configure({ apiKey: "appl_gCeGYWQANUACtrAqWvmZbWWbRIo" });
      }
    };

    configurePurchases();
  }, []);

  // 1. Busca os planos configurados no RevenueCat assim que a tela abre
  useEffect(() => {
    async function fetchOfferings() {
      try {
        const offerings = await Purchases.getOfferings();
        // Pega o pacote principal configurado na sua dashboard
        if (
          offerings.current !== null &&
          offerings.current.availablePackages.length > 0
        ) {
          setCurrentPackage(offerings.current.availablePackages[0]);
        }
      } catch (error) {
        console.error("Erro ao buscar planos:", error);
        Alert.alert("Aviso", "Não foi possível carregar os planos no momento.");
      } finally {
        setIsFetching(false);
      }
    }

    fetchOfferings();
  }, []);

  // 2. Função para processar a compra
  const handlePurchase = async () => {
    if (!currentPackage) return;

    setIsPurchasing(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(currentPackage);

      router.push("/(chat)");
    } catch (error) {
      if (!error.userCancelled) {
        Alert.alert("Erro na compra", error.message);
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  // 3. Separar o símbolo da moeda e o valor para manter o design focado na tipografia
  // O RevenueCat devolve algo como "R$129.90" ou "$9.99"
  const priceString = currentPackage?.product?.priceString || "";
  // Usa RegEx simples para separar o que não é número (símbolo) do que é número
  const match = priceString.match(/^([^\d]+)([\d.,]+)$/);
  const currencySymbol = match ? match[1].trim() + " " : "R$ ";
  const displayPrice = match ? match[2] : "0,00";

  // Simulação de preço antigo (você pode colocar isso direto no RevenueCat via metadados se preferir)
  const oldPrice = currentPackage
    ? (currentPackage.product.price * 1.9).toFixed(2).replace(".", ",") // Fake markup de 90% para mostrar desconto
    : "249,90";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Pagamento</Text>
          <Text style={styles.subtitle}>
            Selecione o plano ideal para suas necessidades.
          </Text>
        </View>

        <View style={styles.card}>
          {isFetching ? (
            // ESTADO DE CARREGAMENTO (Loading Skeleton/Spinner)
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#34C759" />
              <Text style={styles.loadingText}>Buscando o melhor plano...</Text>
            </View>
          ) : (
            <>
              {/* BADGE / SELO */}
              <View style={styles.badgeContainer}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Ideal para começar</Text>
                </View>
              </View>

              <View style={styles.planHeader}>
                <Text style={styles.planTitle}>
                  {currentPackage?.product?.title || "Acesso Essencial"}
                </Text>
                <Text style={styles.planDescription}>
                  {currentPackage?.product?.description ||
                    "Ideal para começar sua jornada de forma segura e legal."}
                </Text>
              </View>

              {/* PRECIFICAÇÃO DINÂMICA */}
              <View style={styles.priceContainer}>
                <Text style={styles.oldPrice}>
                  De {currencySymbol}
                  {oldPrice} por
                </Text>
                <View style={styles.newPriceRow}>
                  <Text style={styles.currencySymbol}>{currencySymbol}</Text>
                  <Text style={styles.newPrice}>{displayPrice}</Text>
                </View>
                <View style={styles.savingsTag}>
                  <Feather name="tag" size={14} color="#1E7132" />
                  <Text style={styles.savingsText}>Melhor oferta</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.featuresContainer}>
                <Text style={styles.featuresTitle}>O que está incluso:</Text>
                {PLAN_FEATURES.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Feather name="check-circle" size={20} color="#34C759" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              {/* BOTÃO DE AÇÃO DINÂMICO */}
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  isPurchasing && styles.primaryButtonDisabled,
                ]}
                activeOpacity={0.8}
                onPress={handlePurchase}
                disabled={isPurchasing || !currentPackage}
              >
                {isPurchasing ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Iniciar Agora</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.securityInfo}>
          <Feather name="lock" size={14} color="#8E8E93" />
          <Text style={styles.securityText}>
            Pagamento seguro via Apple/Google
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  titleContainer: {
    marginTop: 16,
    marginBottom: 24,
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    minHeight: 400, // Garante um tamanho decente enquanto a lib busca o preço
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: "#8E8E93",
    fontWeight: "500",
  },
  badgeContainer: {
    position: "absolute",
    top: -14,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  badge: {
    backgroundColor: "#1C1C1E",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  planHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 15,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
  },
  priceContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  oldPrice: {
    fontSize: 15,
    color: "#8E8E93",
    textDecorationLine: "line-through",
    marginBottom: 4,
  },
  newPriceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    marginTop: 6,
  },
  newPrice: {
    fontSize: 48,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: -1,
  },
  savingsTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2FFF5",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  savingsText: {
    color: "#1E7132",
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#F2F2F7",
    width: "100%",
    marginBottom: 24,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: "#3C3C43",
    flex: 1,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: "#34C759",
    borderRadius: 14,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    backgroundColor: "#A1DCAE",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 17,
  },
  securityInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    gap: 6,
  },
  securityText: {
    fontSize: 13,
    color: "#8E8E93",
    fontWeight: "500",
  },
});
