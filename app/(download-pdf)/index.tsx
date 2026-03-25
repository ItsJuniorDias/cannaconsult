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
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";

import AsyncStorage, {
  AsyncStorageError,
} from "@react-native-async-storage/async-storage";

// 1. IMPORTAR O MARKED AQUI
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

export default function DownloadPDFScreen() {
  const [isExporting, setIsExporting] = useState(false);
  const { consultationId } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  console.log(
    consultationId,
    "ID da consulta recebido nos parâmetros de busca",
  );

  const patientInfo = {
    name: "Alexandre Júnior",
    cpf: "449.556.578-85",
    email: "juniordias_@live.com",
    birthDate: "20/08/1997",
    address: "Rua Saldanha marinho, 2443",
  };

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

  const generateHTML = (
    messages: ChatMessage[],
    logoUri: string,
    qrCodeUri: string,
  ) => {
    const chatHtml = messages
      .map((msg, index) => {
        console.log("Gerando HTML para mensagem:", msg);

        //CONVERTER E RENDERIZAR SOMENTE A ULTIMA MENSAGEM DA IA QUE É O LAUDO MEDICO
        if (index === messages.length - 1) {
          const messageHtml = marked(msg.text);
          const roleClass = "ai-message";
          const roleLabel = "Médico";
          return `
            <div class="message ${roleClass}">
            <div class="message-role">${roleLabel}</div>
            <div class="message-body">${messageHtml}</div>
          </div>
        `;
        }
      })
      .join("");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { 
              padding: 32px; 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
              background-color: #FFFFFF;
              display: flex;
              flex-direction: column;
              min-height: 95vh;
            }
            .header {
              display: flex;
              align-items: center;
              margin-bottom: 32px;
            }
            .logo {
              width: 80px;
              height: 80px;
              border-radius: 16px;
              object-fit: cover;
              margin-right: 24px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            }
            .patient-info {
              flex: 1;
              color: #1C1C1E;
            }
            .patient-info p {
              margin: 4px 0;
              font-size: 14px;
              line-height: 1.4;
            }
            .patient-info strong {
              font-weight: 600;
              color: #8E8E93;
              margin-right: 4px;
            }
            .divider {
              border: 0;
              border-bottom: 1px solid #E5E5EA;
              margin-bottom: 32px;
              width: 100%;
            }
            
            /* --- ESTILOS DO CHAT E MARKDOWN --- */
            .chat-container { 
              flex: 1;
              display: flex; 
              flex-direction: column; 
              gap: 16px;
            }
            .message {
              padding: 16px;
              border-radius: 12px;
              margin-bottom: 16px;
            }
            .user-message {
              background-color: #E5F1FF;
              border-left: 4px solid #007AFF;
            }
            .ai-message {
              background-color: #F2F2F7;
              border-left: 4px solid #34C75E;
            }
            .message-role {
              font-size: 12px;
              font-weight: 700;
              color: #8E8E93;
              margin-bottom: 8px;
              text-transform: uppercase;
            }
            .message-body {
              font-size: 14px;
              color: #1C1C1E;
              line-height: 1.6;
            }
            /* Garantir que listas, negritos e parágrafos do markdown fiquem bonitos */
            .message-body p { margin: 0 0 8px 0; }
            .message-body p:last-child { margin: 0; }
            .message-body ul, .message-body ol { margin: 8px 0; padding-left: 20px; }
            .message-body strong { font-weight: 700; color: #000; }
            
            /* --- ESTILOS DA ASSINATURA E QR CODE --- */
            .signature-block {
              margin-top: 60px;
              display: flex;
              align-items: center; 
              justify-content: flex-end; 
              page-break-inside: avoid; /* Evita que a assinatura quebre pela metade em duas páginas */
            }
            .signature-content {
              background-color: #F2F2F7;
              padding: 24px;
              border-radius: 12px;
              color: #1C1C1E;
              font-size: 13px;
              line-height: 1.6;
              max-width: 60%;
            }
            .signature-content p {
              margin: 4px 0;
            }
            .signature-content strong {
              font-weight: 600;
              color: #3A3A3C;
            }
            .signature-title {
              font-size: 15px;
              font-weight: 700;
              margin-bottom: 12px;
              color: #000000;
            }
            .qr-code-container {
              width: 120px;
              height: 120px;
              margin-left: 24px; 
              background-color: #FFFFFF;
              padding: 12px;
              border-radius: 16px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.08);
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .qr-code {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${logoUri}" class="logo" alt="Logo" />
            <div class="patient-info">
              <p><strong>Nome:</strong> ${patientInfo.name}</p>
              <p><strong>CPF:</strong> ${patientInfo.cpf}</p>
              <p><strong>E-mail:</strong> ${patientInfo.email}</p>
              <p><strong>Data de Nasc.:</strong> ${patientInfo.birthDate}</p>
              <p><strong>Endereço:</strong> ${patientInfo.address}</p>
            </div>
          </div>
          
          <hr class="divider" />

          <div class="chat-container">
            ${chatHtml}
          </div>

          <div class="signature-block">
            <div class="signature-content">
              <div class="signature-title">Informações de Emissão e Responsabilidade Técnica</div>
              <p><strong>Assinado digitalmente por:</strong> Murilo Alves Navarro</p>
              <p><strong>CRM:</strong> CRM/SP 177992</p>
              <p><strong>Especialidade:</strong> Cannabis Medicinal</p>
              <p><strong>Data de Criação:</strong> 11/03/2026</p>
              <p><strong>Data de Emissão:</strong> 11/03/2026</p>
            </div>
            
            <div class="qr-code-container">
              <img src="${qrCodeUri}" class="qr-code" alt="QR Code Estático" />
            </div>
          </div>
        </body>
      </html>
    `;
  };

  // ... (o resto da sua função handleDownloadPDF e o componente continuam os mesmos)

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      const messages = await fetchChatHistory();

      if (messages.length === 0) {
        Alert.alert("Aviso", "Não há mensagens para exportar.");
        setIsExporting(false);
        return;
      }

      const iconAsset = Image.resolveAssetSource(
        require("../../assets/images/icon.png"),
      );
      const logoUri = iconAsset ? iconAsset.uri : "";

      const qrCodeAsset = Image.resolveAssetSource(
        require("../../assets/images/qrcode.png"),
      );
      const qrCodeUri = qrCodeAsset ? qrCodeAsset.uri : "";

      const htmlContent = generateHTML(messages, logoUri, qrCodeUri);

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (isSharingAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Baixar Histórico do Chat",
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("Erro", "O compartilhamento não está disponível.");
      }
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
        { backgroundColor: isDark ? "#1C1C1E" : "#F2F2F7" },
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
            <Ionicons name="document-text" size={48} color="#34C75E" />
          </View>

          <Text
            style={[styles.title, { color: isDark ? "#FFFFFF" : "#000000" }]}
          >
            Exportar Prontuário
          </Text>
          <Text style={styles.subtitle}>
            Baixe o documento oficial assinado digitalmente com o histórico da
            consulta.
          </Text>

          <TouchableOpacity
            style={[styles.button, isExporting && styles.buttonDisabled]}
            onPress={handleDownloadPDF}
            disabled={isExporting}
            activeOpacity={0.7}
          >
            {isExporting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Gerar e Salvar PDF</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... manter seus estilos inalterados
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  contentCard: {
    width: "100%",
    borderRadius: 20,
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
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.35,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "400",
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
  },
  button: {
    backgroundColor: "#34C75E",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
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
