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
  Modal,
  TextInput,
} from "react-native";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { signOut } from "firebase/auth";
import { db, auth, storage } from "../../firebaseConfig";

// Dependências Mobile
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { decode as atob } from "base-64";
import { marked } from "marked";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// CUIDADO: Você precisa ter um cliente HTTP, recomendo instalar o axios se não tiver
// ou usar fetch nativo. Como você usou axios na web, vou usar fetch aqui para não adicionar dependência,
// mas você pode trocar por axios se preferir.
const BACKEND_URL = "https://cannaconsult-backend.onrender.com";

// --- FUNÇÃO UTILITÁRIA MOBILE ---
// Baixa o arquivo e converte para Base64
const getBase64FromUrlMobile = async (url) => {
  try {
    const fileUri = FileSystem.documentDirectory + `temp_${Date.now()}.pdf`;

    // Baixa o arquivo
    const { uri } = await FileSystem.downloadAsync(url, fileUri);

    // Lê o arquivo como Base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Limpa o arquivo temporário
    await FileSystem.deleteAsync(fileUri, { idempotent: true });

    return base64;
  } catch (error) {
    console.error("Erro ao converter URL para Base64 no Mobile:", error);
    throw error;
  }
};

export default function MedicalAreaMobile() {
  const router = useRouter();
  const [laudos, setLaudos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [signingId, setSigningId] = useState(null);

  // Estados do Modal OTP
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [selectedLaudo, setSelectedLaudo] = useState(null);
  const [cpf, setCpf] = useState("");
  const [otp, setOtp] = useState("");

  // ==========================================
  // BUSCA DE DADOS
  // ==========================================
  const fetchLaudos = async () => {
    setIsLoading(true);
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
      Alert.alert("Erro", "Não foi possível carregar os dados.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLaudos();
  }, []);

  // ==========================================
  // HANDLERS (ASSINATURA, PDF E WHATSAPP)
  // ==========================================
  const handleIniciarAssinatura = (laudo) => {
    setSelectedLaudo(laudo);
    setOtp("");
    // Idealmente você poderia salvar o CPF no AsyncStorage (equivalente ao localStorage)
    // para não ter que digitar sempre, mas aqui estou apenas abrindo o modal.
    setOtpModalVisible(true);
  };

  const handleConfirmarAssinatura = async () => {
    const cleanCpf = cpf.replace(/\D/g, "");

    if (!cleanCpf || cleanCpf.length !== 11) {
      Alert.alert("Erro", "CPF inválido.");
      return;
    }
    if (!otp || otp.length !== 6) {
      Alert.alert("Erro", "OTP inválido.");
      return;
    }

    try {
      setOtpModalVisible(false);
      setSigningId(selectedLaudo.id);

      const urlLaudoOriginal =
        selectedLaudo.laudoPdfUrl || selectedLaudo.documentoPdfUrl;
      const urlReceitaOriginal = selectedLaudo.receitaPdfUrl;

      let novaUrlLaudo = null;
      let novaUrlReceita = null;

      // 1. ASSINAR LAUDO
      if (urlLaudoOriginal) {
        console.log("[MOBILE] Processando Laudo...");
        const laudoBase64 = await getBase64FromUrlMobile(urlLaudoOriginal);

        const responseLaudo = await fetch(`${BACKEND_URL}/api/sign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cpf: cleanCpf,
            otp: otp,
            pdfBase64: laudoBase64,
            tipoDocumento: "Laudo Médico",
          }),
        });

        if (!responseLaudo.ok) {
          const errorData = await responseLaudo.json();
          throw new Error(errorData.erro || "Erro na API ao assinar Laudo");
        }

        const dataLaudo = await responseLaudo.json();
        const laudoAssinadoBase64 = dataLaudo.data.pdfBase64;

        const laudoRef = ref(
          storage,
          `laudos_assinados/${selectedLaudo.id}_laudo_assinado.pdf`,
        );
        await uploadString(laudoRef, laudoAssinadoBase64, "base64", {
          contentType: "application/pdf",
        });
        novaUrlLaudo = await getDownloadURL(laudoRef);
      }

      // 2. ASSINAR RECEITA
      if (urlReceitaOriginal) {
        console.log("[MOBILE] Processando Receita...");
        const receitaBase64 = await getBase64FromUrlMobile(urlReceitaOriginal);

        const responseReceita = await fetch(`${BACKEND_URL}/api/sign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cpf: cleanCpf,
            otp: otp,
            pdfBase64: receitaBase64,
            tipoDocumento: "Receita Médica",
          }),
        });

        if (!responseReceita.ok) {
          const errorData = await responseReceita.json();
          throw new Error(errorData.erro || "Erro na API ao assinar Receita");
        }

        const dataReceita = await responseReceita.json();
        const receitaAssinadaBase64 = dataReceita.data.pdfBase64;

        const receitaRef = ref(
          storage,
          `receitas_assinadas/${selectedLaudo.id}_receita_assinada.pdf`,
        );
        await uploadString(receitaRef, receitaAssinadaBase64, "base64", {
          contentType: "application/pdf",
        });
        novaUrlReceita = await getDownloadURL(receitaRef);
      }

      // 3. ATUALIZAR FIRESTORE
      const laudoDocRef = doc(db, "laudos", selectedLaudo.id);
      const updateData = {
        status: "Finalizado",
        dataAssinatura: new Date().toISOString(),
        provedorAssinatura: "BirdID Pro",
      };

      if (novaUrlLaudo) {
        updateData.laudoPdfUrl = novaUrlLaudo; // Mantive as chaves originais do mobile
        updateData.laudoAssinadoUrl = novaUrlLaudo; // E adicionei as da web por segurança
      }
      if (novaUrlReceita) {
        updateData.receitaPdfUrl = novaUrlReceita;
        updateData.receitaAssinadaUrl = novaUrlReceita;
      }

      await updateDoc(laudoDocRef, updateData);

      Alert.alert("Sucesso", "Documentos assinados com sucesso!");
      fetchLaudos(); // Recarrega a lista
    } catch (error) {
      console.error("Erro na assinatura:", error);
      Alert.alert(
        "Erro",
        error.message || "Ocorreu um erro ao assinar os documentos.",
      );
    } finally {
      setSigningId(null);
    }
  };

  const decodeBase64 = (base64) => {
    try {
      const binString = atob(base64);
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
            <p><strong>Data de Emissão:</strong> ${laudo.dataCriacao?.split("-").reverse().join("/") || ""}</p>
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

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
      });
    } catch (error) {
      console.error("Erro ao gerar o PDF:", error);
      Alert.alert("Erro", "Ocorreu um erro ao tentar gerar o PDF.");
    }
  };

  const handleNotifyWhatsApp = async (laudo) => {
    if (!laudo.telefone) {
      Alert.alert("Aviso", "Número de telefone do paciente não encontrado.");
      return;
    }

    let telefoneFormatado = laudo.telefone.replace(/\D/g, "");
    if (!telefoneFormatado.startsWith("55"))
      telefoneFormatado = "+55" + telefoneFormatado;

    const mensagem = `Olá, ${laudo.paciente}! Seus documentos médicos já estão assinados e disponíveis no aplicativo. Acesse o Canna Consult para baixar seu Laudo e Receita!`;
    const whatsappUrl = `https://wa.me/${telefoneFormatado}?text=${encodeURIComponent(mensagem)}`;

    const canOpen = await Linking.canOpenURL(whatsappUrl);
    if (canOpen) {
      await Linking.openURL(whatsappUrl);
    } else {
      Alert.alert("Erro", "Não foi possível abrir o WhatsApp.");
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

    const isThisSigning = signingId === item.id;
    const isFinalizado = item.status === "Finalizado";

    let statusStyle = styles.statusPendente;
    let statusTextStyle = styles.statusTextPendente;
    if (item.status === "Aprovado") {
      statusStyle = styles.statusAprovado;
      statusTextStyle = styles.statusTextAprovado;
    } else if (isFinalizado) {
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

        {/* LINHA 1: GERAR PDF (RASCUNHO) E AVISAR PACIENTE */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.btnSecondary,
              !item.conteudoLaudo && styles.btnDisabled,
            ]}
            onPress={() => handleDownloadPDF(item)}
            disabled={!item.conteudoLaudo || !!signingId}
          >
            <Feather name="file-text" size={18} color="#374151" />
            <Text style={styles.btnSecondaryText}>Ler Texto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.btnWhatsApp]}
            onPress={() => handleNotifyWhatsApp(item)}
            disabled={!!signingId}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
            <Text style={styles.btnWhatsAppText}>Avisar Paciente</Text>
          </TouchableOpacity>
        </View>

        {/* LINHA 2: ASSINATURA BIRDID */}
        <View style={[styles.actionRow, { borderTopWidth: 0, paddingTop: 0 }]}>
          {!isFinalizado ? (
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.btnPrimary,
                isThisSigning && styles.btnDisabled,
              ]}
              onPress={() => handleIniciarAssinatura(item)}
              disabled={!!signingId}
            >
              {isThisSigning ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Feather name="edit-3" size={18} color="#FFF" />
                  <Text style={styles.btnPrimaryText}>Assinar Documentos</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View style={[styles.actionBtn, styles.btnSuccess]}>
              <Feather name="check-circle" size={18} color="#047857" />
              <Text style={styles.btnSuccessText}>Documentos Assinados</Text>
            </View>
          )}
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
          <Text style={styles.pageTitle}>Painel Médico</Text>
          <Text style={styles.pageSubtitle}>
            Assine digitalmente os laudos e receitas para seus pacientes.
          </Text>
        </View>

        {signingId && (
          <View style={styles.signingAlert}>
            <ActivityIndicator size="small" color="#0070BA" />
            <Text style={styles.signingAlertText}>
              Processando assinatura...
            </Text>
          </View>
        )}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#34C759" />
            <Text style={styles.loadingText}>Buscando consultas...</Text>
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
                Nenhum registro encontrado no momento.
              </Text>
            }
          />
        )}
      </View>

      {/* MODAL OTP */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={otpModalVisible}
        onRequestClose={() => setOtpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assinatura Digital (BirdID)</Text>
            <Text style={styles.modalSubtitle}>
              Assinando documentos de{" "}
              <Text style={{ fontWeight: "bold" }}>
                {selectedLaudo?.paciente}
              </Text>
              .
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CPF do Médico</Text>
              <TextInput
                style={styles.input}
                value={cpf}
                onChangeText={setCpf}
                placeholder="000.000.000-00"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Código BirdID (OTP)</Text>
              <TextInput
                style={[styles.input, styles.otpInput]}
                value={otp}
                onChangeText={(text) => setOtp(text.replace(/\D/g, ""))}
                placeholder="000000"
                keyboardType="numeric"
                maxLength={6}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setOtpModalVisible(false)}
              >
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  styles.modalBtnConfirm,
                  (otp.length !== 6 || cpf.replace(/\D/g, "").length !== 11) &&
                    styles.btnDisabled,
                ]}
                onPress={handleConfirmarAssinatura}
                disabled={
                  otp.length !== 6 || cpf.replace(/\D/g, "").length !== 11
                }
              >
                <Text style={styles.modalBtnConfirmText}>Assinar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  signingAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    gap: 10,
  },
  signingAlertText: { color: "#1E3A8A", fontWeight: "500" },

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

  actionRow: {
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
    marginBottom: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  btnSecondary: { backgroundColor: "#F3F4F6" },
  btnSecondaryText: { fontSize: 13, fontWeight: "600", color: "#374151" },

  btnWhatsApp: { backgroundColor: "#25D366" },
  btnWhatsAppText: { fontSize: 13, fontWeight: "600", color: "#FFFFFF" },

  btnPrimary: { backgroundColor: "#0070BA" },
  btnPrimaryText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },

  btnSuccess: { backgroundColor: "#D1FAE5" },
  btnSuccessText: { fontSize: 13, fontWeight: "700", color: "#047857" },

  btnDisabled: { opacity: 0.5 },

  // --- MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    marginBottom: 4,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    textAlign: "center",
    fontFamily: "monospace", // Se quiser que os números fiquem monoespaçados
  },
  otpInput: {
    fontSize: 24,
    letterSpacing: 10,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalBtnCancel: {
    backgroundColor: "#F3F4F6",
  },
  modalBtnCancelText: {
    color: "#EF4444",
    fontWeight: "600",
    fontSize: 16,
  },
  modalBtnConfirm: {
    backgroundColor: "#0070BA",
  },
  modalBtnConfirmText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
