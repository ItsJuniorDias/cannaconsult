import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    title: "Bem-vindo ao Dr. Gemini",
    description:
      "Sua plataforma segura para simular consultas médicas de cannabis medicinal no Brasil.",
    icon: "🌱",
  },
  {
    id: "2",
    title: "Sua Experiência Digital",
    description:
      "Nossa IA simula uma avaliação real, investigando sintomas para traçar o melhor plano.",
    icon: "💬",
  },
  {
    id: "3",
    title: "Entenda o Tratamento",
    description:
      "Aprenda sobre dosagem, titulação e como funciona a terapia canabinoide.",
    icon: "💧",
  },
  {
    id: "4",
    title: "Processo Anvisa Simplificado",
    description:
      "No final, geramos um laudo simulado e te guiamos pelo processo legal de importação.",
    icon: "📄",
  },
];

const OnboardingItem = ({ item }) => {
  return (
    <View style={styles.slide}>
      {/* Container estilo ícone da Apple (Squircle) */}
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>{item.icon}</Text>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );
};

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const router = useRouter();

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    setCurrentIndex(viewableItems[0].index);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNextPress = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.push("/(tabs)");
    }
  };

  const handleSkipPress = () => {
    // Adicionado o redirecionamento aqui também para o botão Pular funcionar
    router.push("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {currentIndex < slides.length - 1 && (
          <TouchableOpacity onPress={handleSkipPress} style={styles.skipButton}>
            <Text style={styles.skipText}>Pular</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={slides}
        renderItem={({ item }) => <OnboardingItem item={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
        scrollEventThrottle={32}
      />

      <View style={styles.footer}>
        <View style={styles.paginator}>
          {slides.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

            // Animação sutil para a largura
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 18, 8],
              extrapolate: "clamp",
            });

            // Cores: Branco para o ativo, Cinza escuro para os inativos
            const backgroundColor = scrollX.interpolate({
              inputRange,
              outputRange: ["#3A3A3C", "#FFFFFF", "#3A3A3C"],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={i.toString()}
                style={[styles.dot, { width: dotWidth, backgroundColor }]}
              />
            );
          })}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNextPress}>
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? "Começar" : "Continuar"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000", // Preto Verdadeiro (iOS Dark Mode)
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    marginTop: 10,
    height: 40,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    color: "#8E8E93", // Cinza padrão do sistema
    fontSize: 17,
    fontWeight: "500",
  },
  slide: {
    width: width,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingBottom: 60, // Sobe o conteúdo um pouco para fugir do rodapé
  },
  iconContainer: {
    width: 140,
    height: 140,
    backgroundColor: "#1C1C1E", // Cinza elevado do iOS
    borderRadius: 36, // Efeito "Squircle" (Canto arredondado Apple)
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 50,
    // Sombra sutil
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconText: {
    fontSize: 72,
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 32, // Tamanho de título grande iOS
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  description: {
    color: "#8E8E93", // Cinza secundário iOS
    fontSize: 17, // Padrão de leitura Apple
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "400",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  paginator: {
    flexDirection: "row",
    height: 10,
    marginBottom: 30,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  button: {
    backgroundColor: "#34C759", // Verde oficial do sistema iOS
    borderRadius: 16, // Botão mais retangular com cantos suaves
    paddingVertical: 18,
    width: "100%", // Ocupa quase toda a largura
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 17,
  },
});
