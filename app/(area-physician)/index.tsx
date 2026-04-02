import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { signOut } from "firebase/auth";
import { db, auth, storage } from "../../firebaseConfig";

// Dependências Mobile
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { decode as atob } from "base-64";
import { marked } from "marked";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function MedicalAreaMobile() {
  const router = useRouter();
  const [laudos, setLaudos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [laudoProcessando, setLaudoProcessando] = useState(null); // Para mostrar loading no card específico

  // ==========================================
  // BUSCA DE DADOS
  // ==========================================
  useEffect(() => {
    const fetchLaudos = async () => {
      try {
        const laudosRef = collection(db, "laudos");
        const q = query(laudosRef, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        const laudosData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setLaudos(laudosData);
      } catch (error) {
        console.error("Erro ao buscar laudos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLaudos();
  }, []);

  // ==========================================
  // HANDLERS (PDF E WHATSAPP NO MOBILE)
  // ==========================================
  const decodeBase64 = (base64) => {
    try {
      const binString = atob(base64);
      // No RN, utf8 é tratado por padrão se a string estiver limpa,
      // se houver caracteres especiais, você pode usar libs como utf8 ou Buffer
      return decodeURIComponent(escape(binString));
    } catch (e) {
      console.error("Erro ao decodificar Base64", e);
      return "Erro ao carregar o conteúdo do laudo.";
    }
  };

  const handleDownloadPDF = async (laudo) => {
    if (!laudo.conteudoLaudo) {
      Alert.alert("Erro", "Conteúdo do laudo não encontrado.");
      return;
    }

    try {
      const markdownString = decodeBase64(laudo.conteudoLaudo);
      const htmlContent = marked.parse(markdownString);

      const html = `
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        </head>
        <body style="padding: 40px; font-family: sans-serif; color: #333; line-height: 1.6;">
          <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="text-transform: uppercase; font-size: 22px; margin: 0;">Laudo Médico - Cannabis Medicinal</h1>
            <p style="color: #666; margin-top: 5px;">Dr. ${laudo.medico || "João Marcos Santos da Silva"} - ${laudo.crm || "CRM-MT 14316"}</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 15px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 30px;">
            <h3 style="margin-top: 0; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Dados do Paciente</h3>
            <p><strong>Nome:</strong> ${laudo.paciente}</p>
            <p><strong>CPF:</strong> ${laudo.cpf}</p>
            <p><strong>Data de Emissão:</strong> ${laudo.dataCriacao.split("-").reverse().join("/")}</p>
          </div>

          <div style="font-size: 14px;">
            ${htmlContent}
          </div>

          <div style="margin-top: 60px; text-align: center; border-top: 1px solid #333; padding-top: 20px;">
            <p><strong>${laudo.medico || "João Marcos Santos da Silva"}</strong></p>
            <p style="font-size: 12px; color: #666;">${laudo.crm || "CRM-MT 14316"}</p>
            <p style="font-size: 10px; color: #999; margin-top: 10px;">Assinado Digitalmente</p>
          </div>
        </body>
        </html>
      `;

      // Gera o PDF no sistema de arquivos do aparelho
      const { uri } = await Print.printToFileAsync({ html });

      // Abre a tela nativa para salvar, enviar ou visualizar o PDF
      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
      });
    } catch (error) {
      console.error("Erro ao gerar o PDF:", error);
      Alert.alert("Erro", "Ocorreu um erro ao tentar gerar o PDF.");
    }
  };

  const handleUploadAndSendToWhatsApp = async (laudo) => {
    if (!laudo.telefone) {
      Alert.alert(
        "Aviso",
        "Número de telefone do paciente não encontrado no banco de dados.",
      );
      return;
    }

    try {
      // 1. Abre o seletor de arquivos do dispositivo
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return; // Usuário fechou o seletor

      const file = result.assets[0];
      setLaudoProcessando(laudo.id);
      setIsUploading(true);

      // 2. Prepara o arquivo para o Firebase Storage no formato Blob
      const response = await fetch(file.uri);
      const blob = await response.blob();
      const fileName = `laudos_assinados/${laudo.id}_${Date.now()}_${file.name}`;
      const storageReference = ref(storage, fileName);

      // 3. Faz o upload
      await uploadBytes(storageReference, blob);
      const downloadURL = await getDownloadURL(storageReference);

      // 4. Atualiza o banco de dados
      const laudoRef = doc(db, "laudos", laudo.id);
      await updateDoc(laudoRef, {
        status: "Finalizado",
        urlAssinado: downloadURL,
        dataAssinatura: new Date().toISOString(),
      });

      // Atualiza estado local
      setLaudos((prevLaudos) =>
        prevLaudos.map((item) =>
          item.id === laudo.id ? { ...item, status: "Finalizado" } : item,
        ),
      );

      // 5. Formata número de telefone
      let telefoneFormatado = laudo.telefone.replace(/\D/g, "");
      if (!telefoneFormatado.startsWith("55")) {
        telefoneFormatado = "+55" + telefoneFormatado;
      }

      // 6. Abre o WhatsApp nativamente
      const mensagem = `Olá, ${laudo.paciente}! Aqui está o seu Laudo Médico assinado. Você pode acessá-lo através deste link: ${downloadURL}`;
      const whatsappUrl = `https://wa.me/${telefoneFormatado}?text=${encodeURIComponent(mensagem)}`;

      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert(
          "Erro",
          "Não foi possível abrir o WhatsApp. Ele está instalado no aparelho?",
        );
      }
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      Alert.alert(
        "Erro",
        "Ocorreu um erro ao atualizar o status ou enviar o arquivo.",
      );
    } finally {
      setIsUploading(false);
      setLaudoProcessando(null);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);

      router.replace("/(login)");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  // ==========================================
  // RENDERIZAÇÃO DOS CARDS
  // ==========================================
  const renderLaudo = ({ item }) => {
    const dataFormatada = item.dataCriacao
      ? item.dataCriacao.split("-").reverse().join("/")
      : "N/A";
    const isThisCardLoading = isUploading && laudoProcessando === item.id;

    let statusStyle = styles.statusPendente;
    let statusTextStyle = styles.statusTextPendente;
    if (item.status === "Aprovado") {
      statusStyle = styles.statusAprovado;
      statusTextStyle = styles.statusTextAprovado;
    } else if (item.status === "Finalizado") {
      statusStyle = styles.statusFinalizado;
      statusTextStyle = styles.statusTextFinalizado;
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.pacienteNome}>{item.paciente}</Text>
          <View style={[styles.statusBadge, statusStyle]}>
            <Text style={[styles.statusText, statusTextStyle]}>
              {item.status || "Pendente"}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>CPF: </Text>
            {item.cpf}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Data: </Text>
            {dataFormatada}
          </Text>
        </View>

        {/* BOTÕES DE AÇÃO */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.btnDownload,
              !item.conteudoLaudo && styles.btnDisabled,
            ]}
            onPress={() => handleDownloadPDF(item)}
            disabled={!item.conteudoLaudo || isThisCardLoading}
          >
            <MaterialIcons name="file-download" size={20} color="#374151" />
            <Text style={styles.btnDownloadText}>Gerar PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.btnUpload,
              isThisCardLoading && styles.btnDisabled,
            ]}
            onPress={() => handleUploadAndSendToWhatsApp(item)}
            disabled={isThisCardLoading}
          >
            {isThisCardLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
                <Text style={styles.btnUploadText}>Enviar Assinado</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          CANNA CONSULT <Text style={styles.headerHighlight}>| Médico</Text>
        </Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="#6B7280" />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <View style={styles.pageInfo}>
          <Text style={styles.pageTitle}>Laudos Gerados</Text>
          <Text style={styles.pageSubtitle}>
            Consulte e envie os laudos das avaliações.
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#34C759" />
            <Text style={styles.loadingText}>Buscando laudos...</Text>
          </View>
        ) : (
          <FlatList
            data={laudos}
            keyExtractor={(item) => item.id}
            renderItem={renderLaudo}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Nenhum laudo encontrado no momento.
              </Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// ==========================================
// ESTILOS
// ==========================================
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FDF9F3" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    elevation: 2,
  },
  headerTitle: { fontSize: 16, fontWeight: "bold", color: "#1F2937" },
  headerHighlight: { color: "#34C759" },
  logoutButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  logoutText: { fontSize: 14, fontWeight: "600", color: "#6B7280" },
  container: { flex: 1, padding: 20 },
  pageInfo: { marginBottom: 20 },
  pageTitle: { fontSize: 24, fontWeight: "bold", color: "#1F2937" },
  pageSubtitle: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#6B7280", fontSize: 16 },
  listContent: { paddingBottom: 20 },
  emptyText: {
    textAlign: "center",
    color: "#9CA3AF",
    marginTop: 40,
    fontSize: 16,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  pacienteNome: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    flex: 1,
    marginRight: 8,
  },
  cardBody: { flexDirection: "column", gap: 4, marginBottom: 16 },
  infoText: { fontSize: 14, color: "#4B5563" },
  infoLabel: { fontWeight: "bold", color: "#9CA3AF" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: "bold" },
  statusAprovado: { backgroundColor: "#DBEAFE" },
  statusTextAprovado: { color: "#1D4ED8" },
  statusFinalizado: { backgroundColor: "#D1FAE5" },
  statusTextFinalizado: { color: "#047857" },
  statusPendente: { backgroundColor: "#FEF3C7" },
  statusTextPendente: { color: "#B45309" },

  actionButtonsContainer: {
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  btnDownload: { backgroundColor: "#F3F4F6" },
  btnDownloadText: { fontSize: 13, fontWeight: "bold", color: "#374151" },
  btnUpload: { backgroundColor: "#25D366" },
  btnUploadText: { fontSize: 13, fontWeight: "bold", color: "#FFFFFF" },
  btnDisabled: { opacity: 0.5 },
});
