import { GoogleGenerativeAI } from "@google/generative-ai";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// AVISO: Em produção, NUNCA deixe sua API Key direto no código do app.
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || "SUA_CHAVE_AQUI");

const systemInstruction = `
Você é o Dr. Gemini, um médico especialista em medicina canabinoide atuando no Brasil.
Seu objetivo é conduzir uma SIMULAÇÃO de consulta médica para prescrição de cannabis medicinal.
Regras:
1. Sempre seja empático, profissional e acolhedor.
2. Faça perguntas investigativas sobre os sintomas do paciente (ex: ansiedade, dor crônica).
3. Na primeira mensagem, DEIXE CLARO que você é uma IA e que isso é apenas uma simulação, não substituindo aconselhamento médico real.
4. Conduza a conversa passo a passo. Não faça todas as perguntas de uma vez.
5. No final da simulação, explique como seria o tratamento (óleo, dosagem inicial) e o processo burocrático com a Anvisa no Brasil.
`;

// --- COMPONENTE DO SKELETON ANIMADO (Padrão iOS) ---
const TypingSkeleton = () => {
  const fadeAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.4,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [fadeAnim]);

  return (
    <Animated.View
      style={[
        styles.messageBubble,
        styles.modelBubble,
        { opacity: fadeAnim, width: 120, paddingVertical: 14 },
      ]}
    >
      <View style={styles.skeletonLineLong} />
      <View style={styles.skeletonLineShort} />
    </Animated.View>
  );
};

export default function App() {
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "model",
      text: "Olá! Sou o Dr. Gemini. Bem-vindo à nossa simulação de consulta. Antes de começarmos, lembre-se: sou uma IA e esta é uma simulação educacional, não um conselho médico real. O que te traz ao consultório hoje?",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Ref para controlar a rolagem da lista
  const flatListRef = useRef(null);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: systemInstruction,
  });

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const newUserMessage = {
      id: Date.now().toString(),
      role: "user",
      text: inputText,
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInputText("");
    setIsLoading(true);

    try {
      const chatHistory = updatedMessages
        .filter((msg, index) => {
          if (index === 0 && msg.role === "model") return false;
          return true;
        })
        .map((msg) => ({
          role: msg.role === "model" ? "model" : "user",
          parts: [{ text: msg.text }],
        }));

      const lastUserMsg = chatHistory.pop();

      const chat = model.startChat({
        history: chatHistory,
      });

      const result = await chat.sendMessage(lastUserMsg.parts[0].text);
      const responseText = result.response.text();

      const newModelMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: responseText,
      };

      setMessages((prev) => [...prev, newModelMessage]);
    } catch (error) {
      console.error("Erro ao chamar o Gemini:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === "user";
    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.modelBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userText : styles.modelText,
          ]}
        >
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dr. Gemini</Text>
        <Text style={styles.headerSubtitle}>Clínica Canabinoide</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContainer}
        ListFooterComponent={isLoading ? <TypingSkeleton /> : null}
        // Garante que o chat role para o fim sempre que o conteúdo mudar
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputWrapper}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mensagem do iMessage..."
            placeholderTextColor="#8E8E93" // Cinza Apple
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && { backgroundColor: "#3A3A3C" },
            ]}
            onPress={sendMessage}
            disabled={isLoading || !inputText.trim()}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text
                style={[
                  styles.sendButtonText,
                  !inputText.trim() && { color: "#8E8E93" },
                ]}
              >
                Enviar
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000", // Preto Verdadeiro iOS
  },
  header: {
    paddingVertical: 12,
    backgroundColor: "rgba(28, 28, 30, 0.9)", // Cinza translúcido
    borderBottomWidth: 0.5,
    borderBottomColor: "#38383A", // Divisória sutil
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 17, // Tamanho de título iOS
    fontWeight: "600", // Semibold Apple
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    color: "#8E8E93",
    fontSize: 12,
    marginTop: 2,
    fontWeight: "400",
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#34C759", // Verde iOS Oficial
  },
  modelBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#2C2C2E", // Cinza Escuro de balão iOS
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  userText: {
    color: "#FFFFFF",
  },
  modelText: {
    color: "#FFFFFF", // Apple usa branco no Dark Mode para os dois balões
  },
  // Estilos das linhas do Skeleton (agora imitando os pontinhos de digitação ou barras neutras)
  skeletonLineLong: {
    height: 8,
    backgroundColor: "#8E8E93",
    borderRadius: 4,
    width: "80%",
    marginBottom: 6,
  },
  skeletonLineShort: {
    height: 8,
    backgroundColor: "#8E8E93",
    borderRadius: 4,
    width: "50%",
  },
  inputWrapper: {
    backgroundColor: "#000000", // Fundo do teclado
  },
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#000000",
    borderTopWidth: 0.5,
    borderTopColor: "#38383A",
    alignItems: "flex-end", // Alinha o botão de enviar na parte de baixo caso o input cresça
  },
  input: {
    flex: 1,
    backgroundColor: "#1C1C1E", // Cinza do campo de texto iOS
    color: "#FFFFFF",
    borderRadius: 20, // Formato "Pill"
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 16,
    marginRight: 10,
    maxHeight: 120, // Limita o crescimento vertical
  },
  sendButton: {
    backgroundColor: "#34C759",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2, // Alinha visualmente com o input
    height: 38,
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
});
