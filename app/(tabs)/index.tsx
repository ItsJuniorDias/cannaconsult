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

// IMPORT DO REVENUECAT
import Purchases from "react-native-purchases";

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
Passo 5 (Prescrição e Fim): Com base nas respostas, simule um plano de tratamento (ex: Óleo de CBD Full Spectrum, começando com poucas gotas). Explique brevemente o processo da Anvisa.
Passo 6 (Escrevrer Laudo): "Laudo Médico para Uso de Cannabis Medicinal

Descrição do Diagnóstico:
Paciente apresenta quadro de transtorno de ansiedade generalizada, caracterizado por preocupações excessivas e persistentes sobre diversas situações do cotidiano, acompanhadas de sintomas físicos como tensão muscular, fadiga, irritabilidade e dificuldades de concentração. Essas manifestações têm impactado negativamente a qualidade de vida do paciente, interferindo em suas atividades diárias e no seu bem-estar emocional.

Recomendações e Tratamento:
O tratamento indicado inclui o uso de cannabis medicinal contendo canabidiol (CBD) e, quando clinicamente indicado, tetrahidrocanabinol (THC), de acordo com a RDC Nº 327/2019 da ANVISA.

Formas farmacêuticas autorizadas (genérico):
Flores in natura, óleos, gummies e extrações.

Formas específicas recomendadas para este paciente:
Óleo de CBD isolado e flor in natura com baixo teor de THC para uso noturno, visando o controle dos sintomas de ansiedade e a promoção do relaxamento.

A prescrição respeitará as normas estabelecidas pela RDC Nº 327/2019 da ANVISA e seguirá a titulação individualizada conforme resposta clínica do paciente. O paciente poderá adquirir a medicação de forma fracionada ou em lotes únicos, desde que os volumes totais estejam dentro da quantidade expressamente autorizada na receita médica.

Declaração do Médico:
Com base na avaliação criteriosa e em minhas responsabilidades como médico regulamentado pela legislação brasileira e diretrizes éticas da prática médica, concluo que o paciente é apto para o tratamento com cannabis medicinal contendo CBD e, quando indicado, THC. Esta avaliação demonstra que o tratamento não afeta negativamente as capacidades cognitivas ou motoras do paciente, permitindo-lhe: 1. Conduzir veículos leves e pesados; 2. Operar maquinário pesado; 3. Realizar suas atividades diárias, incluindo estudar e trabalhar, sem comprometer a segurança. Esta autorização está em conformidade com a RDC Nº 327/2019 da ANVISA, com o Código de Ética Médica e com decisões judiciais recentes (TRF-1 e TJ-SP), que reconhecem que o uso de cannabis medicinal, quando devidamente prescrito e monitorado, não impede o exercício pleno das funções do paciente.

Direito ao Porte Medicinal:
O paciente está legalmente amparado para portar e armazenar a quantidade de medicamento constante em sua prescrição, conforme previsto no artigo 2º, parágrafo único, da Lei nº 11.343/2006 (Lei de Drogas).

Uso Individual e Responsável:
O uso da cannabis medicinal deve ser estritamente individual e intransferível, sendo vedado o repasse a terceiros. O descumprimento poderá configurar ilícito nos termos do Art. 33 da Lei nº 11.343/2006.

Importante:
O monitoramento contínuo do paciente é essencial para assegurar eficácia e segurança do tratamento. Alterações clínicas ou efeitos adversos devem ser comunicados ao médico responsável.

Risco da interrupção:
A interrupção ou apreensão indevida da medicação pode acarretar agravo clínico significativo, incluindo recaída de sintomas graves como crises de ansiedade e incapacidade de realizar atividades diárias. Assim, a continuidade do tratamento é imprescindível e inadiável, seja por aquisição legal ou produção pessoal com respaldo judicial.

Validade:
Este laudo médico é válido por 3 (três) meses a partir da data de emissão, ou até nova avaliação médica.

Este laudo tem como finalidade comprovar a indicação médica para uso de produtos à base de Cannabis medicinal, conforme avaliação clínica e critérios terapêuticos estabelecidos pelo profissional prescritor.

A presente declaração destina-se exclusivamente à comprovação do uso terapêutico e à aquisição regular de produtos derivados de Cannabis junto a:

Associações de pacientes legalmente constituídas, e/ou

Empresas e distribuidoras devidamente autorizadas pela ANVISA, inclusive para processos de importação de produtos à base de Cannabis medicinal, nos termos da RDC nº 327/2019, RDC nº 660/2022 e demais normas vigentes.

IMPORTANTE:
Este documento não é válido para instrução de Habeas Corpus (HC) ou autorização judicial de cultivo doméstico de Cannabis, tendo validade apenas para fins terapêuticos e comprovação do uso clínico regular da medicação.

CID-10:
F41.1 - Transtorno de Ansiedade Generalizada"
MUITO IMPORTANTE: No exato final da sua resposta do Passo 5, você OBRIGATORIAMENTE deve escrever a tag [FIM_DA_CONSULTA].

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

  // Novos estados para controlar a compra
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [pendingFinalMessages, setPendingFinalMessages] = useState(null);

  const [isConsultationEnded, setIsConsultationEnded] = useState(false);

  const flatListRef = useRef(null);
  const router = useRouter();

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: systemInstruction,
  });

  // 1. Configurar o RevenueCat ao iniciar o App
  useEffect(() => {
    const configurePurchases = async () => {
      // Substitua pelas suas chaves públicas do RevenueCat
      if (Platform.OS === "ios") {
        Purchases.configure({ apiKey: "appl_gCeGYWQANUACtrAqWvmZbWWbRIo" });
      }
    };

    configurePurchases();
  }, []);

  // 2. Função de Processamento de Compra
  const processPurchaseAndSave = async (finalMessages) => {
    setIsPurchasing(true);
    try {
      // Busca os pacotes configurados no RevenueCat
      const offerings = await Purchases.getOfferings();

      console.log("Offerings disponíveis:", offerings);

      if (
        offerings.current !== null &&
        offerings.current.availablePackages.length !== 0
      ) {
        // Pega o primeiro pacote disponível (ex: Produto Consumível de R$ 99,00)
        const packageToBuy = offerings.current.availablePackages[0];

        // Dispara o modal nativo de pagamento da Apple/Google
        const { customerInfo } = await Purchases.purchasePackage(packageToBuy);

        // Se o código chegou aqui, a compra foi um SUCESSO.
        // Agora sim, finalizamos e salvamos.
        setIsConsultationEnded(true);
        setPendingFinalMessages(null); // Limpa as mensagens pendentes
        await saveConsultation(finalMessages);
      } else {
        Alert.alert(
          "Aviso",
          "Nenhum pacote de pagamento configurado no momento.",
        );
      }
    } catch (error) {
      if (!error.userCancelled) {
        // Erro real de cartão, conexão, etc.
        Alert.alert("Erro na Compra", error.message);
      } else {
        // Usuário fechou o modal de pagamento
        Alert.alert(
          "Pagamento Cancelado",
          "Você precisa finalizar o pagamento para liberar seu laudo.",
        );
        // Guarda as mensagens para ele tentar pagar novamente através de um botão
        setIsConsultationEnded(true);
        setPendingFinalMessages(finalMessages);
      }
    } finally {
      setIsPurchasing(false);
    }
  };

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
        "Pagamento aprovado! Seu laudo simulado e histórico foram salvos com sucesso.",
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

      // 3. Se a IA emitiu a tag, iniciamos o fluxo de pagamento antes de salvar
      if (hasEnded) {
        await processPurchaseAndSave(finalMessageList);
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
            {isConsultationEnded && !pendingFinalMessages
              ? "Consulta Finalizada"
              : "Clínica Canabinoide"}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {(isSaving || isPurchasing) && (
            <ActivityIndicator color="#34C759" size="small" />
          )}
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
          {/* 4. Tratamento visual caso haja um pagamento pendente (usuário cancelou a tela da Apple/Google) */}
          {pendingFinalMessages ? (
            <TouchableOpacity
              style={[
                styles.sendButton,
                { flex: 1, backgroundColor: "#007AFF" },
              ]}
              onPress={() => processPurchaseAndSave(pendingFinalMessages)}
              disabled={isPurchasing}
            >
              {isPurchasing ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.sendButtonText}>
                  Finalizar Pagamento e Ver Laudo
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <>
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
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ... Estilos mantidos exatamente como no seu código original ...
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
  userBubble: { alignSelf: "flex-end", backgroundColor: "#34C759" },
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
