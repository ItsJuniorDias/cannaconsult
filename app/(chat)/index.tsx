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
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { useRouter } from "expo-router";
import Markdown from "react-native-markdown-display";
import { onAuthStateChanged } from "firebase/auth";

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const systemInstruction = `
  Você é o Doutor, um médico especialista em medicina canabinoide atuando no Brasil.
  Seu objetivo é conduzir uma SIMULAÇÃO de consulta médica.
  Você DEVE seguir exatamente estes passos, fazendo as perguntas de um passo de cada vez e aguardando a resposta do usuário antes de ir para o próximo:
  
  Passo 1 (Triagem): Antes de começar, peça as informações do usuário separadas por vírgula: Nome Completo, CPF, E-mail, Data de Nascimento e Endereço.
  Passo 2 (Sintomas): Pergunte os sintomas principais e há quanto tempo o paciente sente isso.
  Passo 3 (Histórico): Pergunte sobre tratamentos atuais, medicamentos convencionais que utiliza e se há histórico de transtornos psiquiátricos na família.
  Passo 4 (Experiência): Pergunte se o paciente já teve experiência prévia com cannabis medicinal ou recreativa.
  Passo 5 (Prescrição): Com base nas respostas, simule e explique um plano de tratamento (ex: Óleo de CBD Full Spectrum, dosagem inicial). Explique brevemente o processo de autorização da Anvisa e pergunte se o paciente entendeu.
  Passo 6 (Escrever Laudo): Com base em TODAS as informações fornecidas pelo paciente nos passos anteriores, redija um "Laudo Médico para Uso de Cannabis Medicinal" completo e formal. Inclua os dados do paciente, resumo clínico, CID (sugerido com base nos sintomas) e a prescrição recomendada. Formate lindamente usando Markdown. AO FINAL DO LAUDO, inclua obrigatoriamente a tag [FIM_DA_CONSULTA].

  Regras Gerais:
  - Na primeira mensagem (Passo 1), lembre que você é uma IA e não substitui um médico.
  - Seja empático e profissional.
  - Nunca faça todas as perguntas de uma vez, espere a resposta.
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
      text: "Olá! Sou o Doutor. Bem-vindo à nossa consulta. Antes de começarmos, lembre-se: sou uma IA e esta é uma simulação educacional. Para iniciarmos a nossa triagem (Passo 1), o que te traz ao consultório hoje e há quanto tempo você tem esses sintomas?",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConsultationEnded, setIsConsultationEnded] = useState(false);

  const [isInitializing, setIsInitializing] = useState(true);
  const [dynamicSystemInstruction, setDynamicSystemInstruction] =
    useState(systemInstruction);

  const flatListRef = useRef(null);
  const router = useRouter();

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: dynamicSystemInstruction,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Busca as preferências no Firestore
          const prefRef = doc(db, "preferences", user.uid);
          const prefSnap = await getDoc(prefRef);

          let preferencesText =
            "O paciente não definiu preferências específicas. Avalie a melhor via de administração.";

          if (prefSnap.exists()) {
            const data = prefSnap.data();
            const produtosSelecionados =
              data.products && data.products.length > 0
                ? data.products.join(", ")
                : "nenhuma preferência específica";

            preferencesText = `
              PREFERÊNCIAS OBRIGATÓRIAS DO PACIENTE:
              - Produtos/Vias de administração escolhidas: ${produtosSelecionados}.
              - Investimento mensal planejado: R$ ${data.monthlyInvestment}.
              - Duração esperada do tratamento: ${data.durationInMonths} meses.
              
              REGRA CRÍTICA DE PRESCRIÇÃO: Você DEVE prescrever EXCLUSIVAMENTE os produtos escolhidos pelo paciente (${produtosSelecionados}). Não prescreva óleos se ele escolheu apenas flores, por exemplo. Adapte a dosagem ao orçamento mensal informado.
            `;
          }

          // Monta a instrução do sistema com as preferências injetadas
          const instruction = `
            Você é o Doutor, um médico especialista em medicina canabinoide atuando no Brasil.
            Seu objetivo é conduzir uma de consulta médica.
            
            ${preferencesText}

            Você DEVE seguir exatamente estes passos, fazendo as perguntas de um passo de cada vez e aguardando a resposta do usuário antes de ir para o próximo:
            
            Passo 1 (Sintomas): Pergunte os sintomas principais e há quanto tempo o paciente sente isso.
            Passo 2 (Histórico): Pergunte sobre tratamentos atuais, medicamentos convencionais que utiliza e se há histórico de transtornos psiquiátricos na família.
            Passo 3 (Experiência): Pergunte se o paciente já teve experiência prévia com cannabis medicinal ou recreativa.
            Passo 4 (Prescrição): Com base nas respostas e nas PREFERÊNCIAS DO PACIENTE listadas acima, simule e explique um plano de tratamento restrito ao que o paciente escolheu. Explique brevemente o processo de autorização da Anvisa e pergunte se o paciente entendeu.
            Passo 5 (Escrever Laudo): Com base em TODAS as informações fornecidas, redija um "Laudo Médico para Uso de Cannabis Medicinal" completo e formal, resumo clínico, sem a identificação do paciente, CID (sugerido) e a prescrição recomendada (RESTRITA ÀS PREFERÊNCIAS). Formate lindamente usando Markdown. AO FINAL DO LAUDO, inclua obrigatoriamente a tag [FIM_DA_CONSULTA].

            Regras Gerais:
            - Médico Responsável: Dr. João Marcos Santos da Silva, CRM-MT 14316 - Especialidade Psiquiatria.
            - Na primeira mensagem (Passo 1), lembre que você é uma IA e não substitui um médico.
            - Seja empático e profissional.
            - Não é um documento simulado, pois será assinado por um médico de verdade, então não deixe nada explícito que possa indicar que é uma simulação.
            - Nunca faça todas as perguntas de uma vez, sempre uma pergunta por vez, aguardando a resposta do paciente.
            - Deixe bem claro que foi feita uma anamnese/triagem, pois a consulta oficial fica a cargo do médico.
          `;

          setDynamicSystemInstruction(instruction);
        } catch (error) {
          console.error("Erro ao buscar preferências:", error);
        } finally {
          setIsInitializing(false);
        }
      } else {
        // Usuário não logado (Redirecionar ou lidar com o erro)
        console.warn("Usuário não autenticado.");
        setIsInitializing(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const saveConsultation = async (finalMessages) => {
    setIsSaving(true);
    try {
      const docRef = await addDoc(collection(db, "consultations"), {
        userId: auth.currentUser?.uid,
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
        {isUser ? (
          <Text style={styles.userText}>{item.text}</Text>
        ) : (
          <Markdown style={markdownStyles}>{item.text}</Markdown>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}></View>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Doutor</Text>
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
    maxWidth: "85%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#34C759",
    borderBottomRightRadius: 4,
  },
  modelBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#2C2C2E",
    borderBottomLeftRadius: 4,
  },
  userText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
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

const markdownStyles = {
  body: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 22,
  },
  strong: {
    fontWeight: "bold",
    color: "#34C759",
  },
  heading1: {
    color: "#FFFFFF",
    fontSize: 22,
    marginVertical: 5,
    fontWeight: "bold",
  },
  heading2: {
    color: "#FFFFFF",
    fontSize: 18,
    marginVertical: 5,
    fontWeight: "bold",
  },
  bullet_list: {
    color: "#FFFFFF",
  },
  ordered_list: {
    color: "#FFFFFF",
  },
  link: {
    color: "#34C759",
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 8,
  },
};
