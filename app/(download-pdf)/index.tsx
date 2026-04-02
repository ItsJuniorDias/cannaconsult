import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  useColorScheme,
  Image,
} from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { marked } from "marked";

interface ChatMessage {
  role: string;
  text: string;
}

interface ConsultationDocument {
  chatHistory: ChatMessage[];
  createdAt?: any;
  messageCount?: number;
}

interface PatientInfo {
  name: string;
  cpf: string;
  email: string;
  birthDate: string;
  address: string;
  phone?: string;
}

export default function DownloadPDFScreen() {
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const router = useRouter();

  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    name: "",
    cpf: "",
    email: "",
    birthDate: "",
    address: "",
    phone: "",
  });

  const { consultationId } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (currentUser) {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setPatientInfo({
              name:
                userData.nomeCompleto ||
                userData.name ||
                currentUser.displayName ||
                "Não informado",
              cpf: userData.cpf || "Não informado",
              email: currentUser.email || userData.email || "Não informado",
              birthDate:
                userData.dataNascimento ||
                userData.birthDate ||
                "Não informado",
              address: userData.endereco || userData.address || "Não informado",
              phone: userData.telefone || userData.phone || "Não informado",
            });
          } else {
            setPatientInfo((prev) => ({
              ...prev,
              name: currentUser.displayName || "Não informado",
              email: currentUser.email || "Não informado",
            }));
          }
        } else {
          Alert.alert("Erro", "Nenhum usuário autenticado encontrado.");
        }
      } catch (error) {
        console.error("Erro ao buscar dados do paciente:", error);
        Alert.alert("Erro", "Falha ao carregar os dados do paciente.");
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchAsyncStorage = async () => {
      await AsyncStorage.setItem("@has_consultation", "true");
    };

    fetchAsyncStorage();
  }, []);

  const fetchChatHistory = async () => {
    if (!consultationId) {
      Alert.alert("Erro", "ID da consulta não fornecido.");
      return [];
    }
    try {
      const docRef = doc(db, "consultations", consultationId as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as ConsultationDocument;
        return data.chatHistory || [];
      } else {
        Alert.alert("Erro", "Consulta não encontrada.");
        return [];
      }
    } catch (error) {
      console.error("Erro ao buscar mensagens: ", error);
      throw error;
    }
  };

  // Função ajustada para receber o documento já em Base64
  const saveLaudoToFirestore = async (documentBase64: string) => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) return;

      const laudosCollection = collection(db, "laudos");

      await addDoc(laudosCollection, {
        userId: currentUser.uid,
        paciente: patientInfo.name,
        cpf: patientInfo.cpf,
        conteudoLaudo: documentBase64, // Salva o Base64 do documento completo
        dataCriacao: new Date().toISOString().split("T")[0],
        timestamp: serverTimestamp(),
        status: "Pendente",
        medico: "João Marcos Santos da Silva",
        crm: "CRM-MT 14316",
        telefone: patientInfo.phone,
      });
      console.log("Laudo salvo na collection 'laudos' com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar o laudo no Firestore: ", error);
    }
  };

  const generateHTML = (laudoText: string, logoUri: string) => {
    const laudoHtml = marked(laudoText);
    const dataHoje = new Date().toLocaleDateString("pt-BR");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { 
              padding: 40px; 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
              background-color: #FFFFFF;
              color: #111827;
              line-height: 1.5;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #1f2937;
              padding-bottom: 16px;
              margin-bottom: 24px;
            }
            .logo {
              height: 80px;
              object-fit: contain;
              border-radius: 16px;
              margin-bottom: 16px;
            }
            .header h1 {
              font-size: 24px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin: 0;
            }
            .header p {
              font-size: 14px;
              color: #4b5563;
              margin-top: 4px;
            }
            .patient-box {
              border: 1px solid #d1d5db;
              border-radius: 6px;
              padding: 16px;
              margin-bottom: 32px;
              background-color: #f9fafb;
            }
            .patient-box h2 {
              font-size: 16px;
              font-weight: 700;
              text-transform: uppercase;
              margin-top: 0;
              margin-bottom: 12px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 4px;
            }
            .grid {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              font-size: 14px;
            }
            .col {
              flex: 1 1 45%;
            }
            .col-full {
              flex: 1 1 100%;
            }
            .font-semibold {
              font-weight: 600;
            }
            .prose {
              font-size: 14px;
              line-height: 1.6;
              color: #1f2937;
              margin-bottom: 48px;
            }
            .prose h1, .prose h2, .prose h3 {
              font-weight: 700;
              color: #111827;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 4px;
              margin-top: 24px;
              margin-bottom: 12px;
            }
            .prose p { margin-top: 0; margin-bottom: 16px; }
            .prose ul, .prose ol { margin-top: 0; margin-bottom: 16px; padding-left: 24px; }
            .signature-block {
              margin-top: 64px;
              padding-top: 24px;
              border-top: 1px solid #1f2937;
              text-align: center;
              page-break-inside: avoid;
            }
            .signature-line {
              width: 256px;
              border-bottom: 2px solid #1f2937;
              margin: 0 auto 8px auto;
            }
            .signature-block p {
              margin: 0;
            }
            .sig-name {
              font-weight: 700;
              font-size: 15px;
            }
            .sig-crm {
              font-size: 13px;
              color: #4b5563;
              margin-top: 4px;
            }
            .sig-digital {
              font-size: 10px;
              color: #6b7280;
              margin-top: 16px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${logoUri}" class="logo" alt="Logo" />
            <h1>Laudo Médico para Uso de Cannabis Medicinal</h1>
            <p>Doutor: João Marcos Santos da Silva - CRM-MT 14316</p>
          </div>
          
          <div class="patient-box">
            <h2>Dados do Paciente</h2>
            <div class="grid">
              <div class="col"><span class="font-semibold">Nome Completo:</span> ${patientInfo.name}</div>
              <div class="col"><span class="font-semibold">CPF:</span> ${patientInfo.cpf}</div>
              <div class="col"><span class="font-semibold">E-mail:</span> ${patientInfo.email}</div>
              <div class="col"><span class="font-semibold">Data de Nascimento:</span> ${patientInfo.birthDate}</div>
              <div class="col-full"><span class="font-semibold">Endereço:</span> ${patientInfo.address}</div>
            </div>
          </div>

          <div class="prose">
            ${laudoHtml}
          </div>

          <div class="signature-block">
            <div class="signature-line"></div>
            <p class="sig-name">João Marcos Santos da Silva</p>
            <p class="sig-crm">CRM-MT 14316 - Especialidade Psiquiatria</p>
            <p class="sig-crm">Data de Emissão: ${dataHoje}</p>
            <p class="sig-digital">Assinado Digitalmente</p>
          </div>
        </body>
      </html>
    `;
  };

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      const messages = await fetchChatHistory();

      if (messages.length === 0) {
        Alert.alert("Aviso", "Não há mensagens para exportar.");
        setIsExporting(false);
        return;
      }

      const laudoMessage = messages[messages.length - 1];
      const laudoText = laudoMessage
        ? laudoMessage.text
        : "Nenhum laudo clínico encontrado.";

      const iconAsset = Image.resolveAssetSource(
        require("../../assets/images/icon.png"),
      );
      const logoUri = iconAsset ? iconAsset.uri : "";

      // 1. Gera o conteúdo HTML completo com layout, cabeçalhos, etc.
      const htmlContent = generateHTML(laudoText, logoUri);

      // 2. Converte ESSE HTML COMPLETO para Base64 para enviar ao Firestore
      const htmlBase64 = btoa(
        new Uint8Array(new TextEncoder().encode(htmlContent)).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          "",
        ),
      );

      // 3. Salva no Firestore o Base64 com o documento estruturado
      await saveLaudoToFirestore(htmlBase64);

      // 4. Gera o PDF localmente para o usuário salvar/compartilhar
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (isSharingAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Salvar Laudo Médico",
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("Erro", "O compartilhamento não está disponível.");
      }

      router.push("/(dashboard)");
    } catch (error) {
      console.error("Erro na geração do PDF:", error);
      Alert.alert("Erro", "Ocorreu um problema ao gerar o PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? "#1C1C1E" : "#FDF9F3" },
      ]}
    >
      <View style={styles.container}>
        <View
          style={[
            styles.contentCard,
            { backgroundColor: isDark ? "#2C2C2E" : "#FFFFFF" },
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="document-text" size={48} color="#34C759" />
          </View>

          <Text
            style={[styles.title, { color: isDark ? "#FFFFFF" : "#111827" }]}
          >
            Seu Laudo está Pronto
          </Text>
          <Text style={styles.subtitle}>
            Revise as informações e gere o documento oficial do laudo médico em
            PDF.
          </Text>

          <TouchableOpacity
            style={[
              styles.button,
              (isExporting || isLoadingUser) && styles.buttonDisabled,
            ]}
            onPress={handleDownloadPDF}
            disabled={isExporting || isLoadingUser}
            activeOpacity={0.7}
          >
            {isExporting || isLoadingUser ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Imprimir / Salvar PDF</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  contentCard: {
    width: "100%",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#E5F1FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0.35,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#4b5563",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    backgroundColor: "#34C759",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 9999,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
  },
  buttonDisabled: { backgroundColor: "#98E3AF" },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.4,
  },
});
