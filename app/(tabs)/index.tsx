import { GoogleGenerativeAI } from "@google/generative-ai";
import React, { useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useRouter } from "expo-router";

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const systemInstruction = `
Você é o Dr. Gemini, um médico especialista em medicina canabinoide atuando no Brasil.
Seu objetivo é conduzir uma SIMULAÇÃO de consulta médica.
Você DEVE seguir exatamente estes passos, fazendo as perguntas de um passo de cada vez e aguardando a resposta do usuário antes de ir para o próximo:
 
Passo 1 (Triagem): Antes de começar vamos perguntar as informações do usuário como separado por vírgula: nome, cpf, email, data de nascimento, endereço.
Passo 2 (Triagem): Pergunte os sintomas principais e há quanto tempo o paciente sente isso.
Passo 3 (Histórico): Pergunte sobre tratamentos atuais, medicamentos convencionais e se há histórico de psiquiatria na família (para avaliar contraindicação de THC).
Passo 4 (Experiência): Pergunte se o paciente já teve experiência prévia com cannabis na vida.
Passo 5 (Prescrição e Fim): Com base nas respostas, simule um plano de tratamento (ex: Óleo de CBD Full Spectrum, começando com poucas gotas,). Explique brevemente o processo da Anvisa.
Passo 6 (Escrevrer Laudo): "Laudo Médico para Uso de Cannabis Medicinal" [FIM_DA_CONSULTA].

Regras Gerais:
- Na primeira mensagem (Passo 1), lembre que você é uma IA e não substitui um médico.
- Seja empático e profissional.
- Nunca faça todas as perguntas de uma vez.
`;

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
      text: "Olá! Sou o Dr. Gemini. Bem-vindo à nossa simulação de consulta. Antes de começarmos, lembre-se: sou uma IA e esta é uma simulação educacional, não um conselho médico real. Para iniciarmos a nossa triagem (Passo 1), o que te traz ao consultório hoje e há quanto tempo você tem esses sintomas?",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConsultationEnded, setIsConsultationEnded] = useState(false);

  const flatListRef = useRef(null);
  const router = useRouter();

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: systemInstruction,
  });

  const saveConsultation = async (finalMessages) => {
    setIsSaving(true);
    try {
      const docRef = await addDoc(collection(db, "consultations"), {
        createdAt: serverTimestamp(),
        type: "cannabis_prescription_sim",
        status: "completed",
        messageCount: finalMessages.length,
        chatHistory: finalMessages.map((msg) => ({
          role: msg.role,
          text: msg.text,
        })),
      });

      Alert.alert(
        "Consulta Finalizada",
        "Seu laudo simulado e histórico foram salvos com sucesso.",
        [
          {
            onPress: () => {
              router.push({
                pathname: "/(download-pdf)",
                params: { consultationId: docRef.id },
              });
            },
            text: "Ver Laudo",
          },
        ],
      );
    } catch (error) {
      console.error("Erro ao salvar documento: ", error);
      Alert.alert(
        "Erro",
        "Não foi possível salvar o histórico da consulta no momento.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isConsultationEnded) return;

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
          // Ignora a primeira mensagem de sistema no histórico da API
          if (index === 0 && msg.role === "model") return false;
          return true;
        })
        .map((msg) => ({
          role: msg.role === "model" ? "model" : "user",
          parts: [{ text: msg.text }],
        }));

      const lastUserMsg = chatHistory.pop();
      const chat = model.startChat({ history: chatHistory });
      const result = await chat.sendMessage(lastUserMsg.parts[0].text);
      let responseText = result.response.text();

      const endTag = "[FIM_DA_CONSULTA]";
      let hasEnded = false;

      if (responseText.includes(endTag)) {
        hasEnded = true;
        responseText = responseText.replace(endTag, "").trim();
      }

      const newModelMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: responseText,
      };

      const finalMessageList = [...updatedMessages, newModelMessage];
      setMessages(finalMessageList);

      // Se a IA emitiu a tag, finaliza a consulta e salva direto
      if (hasEnded) {
        setIsConsultationEnded(true);
        await saveConsultation(finalMessageList);
      }
    } catch (error) {
      console.error("Erro ao chamar o Gemini:", error);
      Alert.alert("Erro", "Falha de conexão com a IA. Tente novamente.");
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
        <View style={styles.headerLeft}></View>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Dr. Gemini</Text>
          <Text style={styles.headerSubtitle}>
            {isConsultationEnded
              ? "Consulta Finalizada"
              : "Clínica Canabinoide"}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {isSaving && <ActivityIndicator color="#34C759" size="small" />}
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContainer}
        ListFooterComponent={isLoading ? <TypingSkeleton /> : null}
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
            placeholder={
              isConsultationEnded ? "Consulta encerrada." : "Mensagem..."
            }
            placeholderTextColor="#8E8E93"
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={!isConsultationEnded}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isConsultationEnded) && {
                backgroundColor: "#3A3A3C",
              },
            ]}
            onPress={sendMessage}
            disabled={isLoading || !inputText.trim() || isConsultationEnded}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text
                style={[
                  styles.sendButtonText,
                  (!inputText.trim() || isConsultationEnded) && {
                    color: "#8E8E93",
                  },
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
  container: { flex: 1, backgroundColor: "#000000" },
  header: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(28, 28, 30, 0.9)",
    borderBottomWidth: 0.5,
    borderBottomColor: "#38383A",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flex: 1 },
  headerCenter: { flex: 2, alignItems: "center" },
  headerRight: { flex: 1, alignItems: "flex-end" },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    color: "#8E8E93",
    fontSize: 12,
    marginTop: 2,
    fontWeight: "400",
  },
  chatContainer: { padding: 16, paddingBottom: 20 },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 8,
  },
  userBubble: { alignSelf: "flex-end", backgroundColor: "9#34C75" },
  modelBubble: { alignSelf: "flex-start", backgroundColor: "#2C2C2E" },
  messageText: { fontSize: 16, lineHeight: 22, letterSpacing: -0.3 },
  userText: { color: "#FFFFFF" },
  modelText: { color: "#FFFFFF" },
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
  inputWrapper: { backgroundColor: "#000000" },
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#000000",
    borderTopWidth: 0.5,
    borderTopColor: "#38383A",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    color: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 16,
    marginRight: 10,
    maxHeight: 120,
  },
  sendButton: {
    backgroundColor: "#34C759",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
    height: 38,
  },
  sendButtonText: { color: "#FFFFFF", fontWeight: "600", fontSize: 15 },
});
