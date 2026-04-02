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
  ImageBackground,
  Linking, // <-- Importado para abrir os links
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import Purchases from "react-native-purchases";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const PLAN_FEATURES = [
  "Consulta médica especializada em 24h",
  "Receita digital com validade legal",
  "Acesso a produtos certificados por parceiros",
  "Suporte prioritário via WhatsApp",
];

const BACKGROUND_IMAGE_URL =
  "https://images.unsplash.com/photo-1637091998767-e6a9d5e80271?q=80&w=1548&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export default function PaymentScreen() {
  const [currentPackage, setCurrentPackage] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const configurePurchases = async () => {
      if (Platform.OS === "ios") {
        Purchases.configure({ apiKey: "appl_gCeGYWQANUACtrAqWvmZbWWbRIo" });
      }
    };
    configurePurchases();
  }, []);

  useEffect(() => {
    async function fetchOfferings() {
      try {
        const offerings = await Purchases.getOfferings();
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

  // Função para abrir links externos (EULA e Privacidade)
  const handleOpenURL = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Erro", "Não foi possível abrir o link.");
      }
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao tentar abrir o link.");
    }
  };

  const priceString = currentPackage?.product?.priceString || "";
  const match = priceString.match(/^([^\d]+)([\d.,]+)$/);
  const currencySymbol = match ? match[1].trim() + " " : "R$ ";
  const displayPrice = match ? match[2] : "0,00";

  const oldPrice = currentPackage
    ? (currentPackage.product.price * 1.9).toFixed(2).replace(".", ",")
    : "249,90";

  return (
    <ImageBackground
      source={{ uri: BACKGROUND_IMAGE_URL }}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* GRADIENTE OVERLAY - Mais claro no topo, mais escuro embaixo para o texto brilhar */}
      <LinearGradient
        colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.8)", "#000000"]}
        style={styles.overlay}
      />

      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
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
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#34C759" />
                <Text style={styles.loadingText}>
                  Buscando o melhor plano...
                </Text>
              </View>
            ) : (
              <>
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
                    <Feather name="tag" size={14} color="#A1DCAE" />
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

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    (isPurchasing || !currentPackage) &&
                      styles.primaryButtonDisabled,
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
            <Feather name="lock" size={14} color="rgba(255, 255, 255, 0.7)" />
            <Text style={styles.securityText}>
              Pagamento seguro via Apple/Google
            </Text>
          </View>

          {/* SESSÃO DE TERMOS E POLÍTICA DE PRIVACIDADE */}
          <View style={styles.legalContainer}>
            <Text style={styles.legalText}>
              Ao continuar, você concorda com nossos{" "}
              <Text
                style={styles.linkText}
                onPress={() =>
                  handleOpenURL(
                    "https://www.notion.so/Termos-de-Uso-EULA-Canna-Consult-32d2f13e5f7d80078d87d411e3514916?source=copy_link",
                  )
                }
              >
                Termos de Uso (EULA)
              </Text>{" "}
              e nossa{" "}
              <Text
                style={styles.linkText}
                onPress={() =>
                  handleOpenURL(
                    "https://www.notion.so/Canna-Consult-Pol-tica-de-Privacidade-32d2f13e5f7d80c4b2bdd2ea79b53809?source=copy_link",
                  )
                }
              >
                Política de Privacidade
              </Text>
              .
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
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
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 22,
  },
  card: {
    paddingTop: 16,
    paddingBottom: 24,
    minHeight: 400,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
  },
  badgeContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  badge: {
    backgroundColor: "#34C759",
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
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 20,
  },
  priceContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  oldPrice: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.6)",
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
    color: "#FFFFFF",
    marginTop: 6,
  },
  newPrice: {
    fontSize: 54,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -1,
  },
  savingsTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(52, 199, 89, 0.2)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  savingsText: {
    color: "#A1DCAE",
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: "100%",
    marginBottom: 24,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
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
    color: "#FFFFFF",
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
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
  },
  // ESTILOS DOS TERMOS E PRIVACIDADE
  legalContainer: {
    marginTop: 16,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  legalText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    lineHeight: 18,
  },
  linkText: {
    color: "#A1DCAE", // Uma cor de destaque que combina com a tag de desconto
    textDecorationLine: "underline",
  },
});
