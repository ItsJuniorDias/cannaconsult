import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
  Modal,
  Image,
} from "react-native";
import ReactNativeBiometrics from "react-native-biometrics";

// Importações para geração e compartilhamento de PDF
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

interface Document {
  id: string;
  patient: string;
  type: string;
  date: string;
  mockContent: string;
}

// Mock do Médico Logado Atualmente
const currentLoggedDoctor = {
  name: "Dr. Roberto Almeida Dias",
  crm: "SP 123.456",
  signatureVisual: "Assinado Digitalmente via TouchID/FaceID",
};

const pendingDocuments: Document[] = [
  {
    id: "1",
    patient: "Alexandre de P. Dias Jr.",
    type: "Receita de Controle Especial",
    date: "Hoje, 14:30",
    //receita de flores e extrato
    mockContent:
      "Receita Médica\n\nPaciente: Alexandre de P. Dias Jr.\nData de Nascimento: 01/01/1990\nCPF: 449.556.578-85\nEndereço: Rua Exemplo, 123, São Paulo, SP\n\nPrescrição:\n- Flores de Cannabis Sativa (20g)\n- Extrato de Cannabis (10ml)\n\nDosagem:\n- Flores: 1g por dia, preferencialmente à noite\n- Extrato: 0,5ml por dia, dividido em duas doses\n\nValidade: 30 dias a partir da data de emissão",
  },
  {
    id: "2",
    patient: "Mariana Silva Costa",
    type: "Receita de Controle Especial",
    date: "Hoje, 11:15",
    //receita de flores e extrato
    mockContent:
      "Receita Médica\n\nPaciente: Mariana Silva Costa\nData de Nascimento: 15/05/1985\nCPF: 321.654.987-00\nEndereço: Avenida Exemplo, 456, Rio de Janeiro, RJ\n\nPrescrição:\n- Flores de Cannabis Indica (30g)\n- Extrato de Cannabis (15ml)\n\nDosagem:\n- Flores: 1,5g por dia, preferencialmente à noite\n- Extrato: 0,75ml por dia, dividido em duas doses\n\nValidade: 30 dias a partir da data de emissão",
  },
];

export default function SignaturesPendingScreen() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Estados para o Modal do PDF Mockado
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [isSignedByMe, setIsSignedByMe] = useState(false);

  const rnBiometrics = useMemo(() => new ReactNativeBiometrics(), []);

  // --- SELEÇÃO EM LOTE ---
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    if (selectedIds.length === pendingDocuments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingDocuments.map((doc) => doc.id));
    }
  };

  // --- ABRIR DOCUMENTO MOCKADO ---
  const handleAbrirDocumento = (doc: Document) => {
    setViewingDoc(doc);
    setIsSignedByMe(false);
    setIsModalVisible(true);
  };

  const fecharDocumento = () => {
    setIsModalVisible(false);
    setViewingDoc(null);
  };

  // --- LÓGICA DE ASSINATURA ---
  const ensureKeysExist = async () => {
    const { keysExist } = await rnBiometrics.biometricKeysExist();
    if (!keysExist) {
      const { publicKey } = await rnBiometrics.createKeys();
      console.log("Nova Chave Gerada:", publicKey);
    }
  };

  const executarAssinaturaIndividual = async (doc: Document) => {
    try {
      const { available } = await rnBiometrics.isSensorAvailable();
      if (!available) {
        Alert.alert("Erro", "Biometria não disponível neste aparelho.");
        return;
      }

      await ensureKeysExist();

      const payload = JSON.stringify({
        docId: doc.id,
        timestamp: Date.now(),
        doctorName: currentLoggedDoctor.name,
        doctorCRM: currentLoggedDoctor.crm,
        action: "MED_SIGNATURE_INDIVIDUAL",
      });

      const { success, signature, error } = await rnBiometrics.createSignature({
        promptMessage: `Assinar documento de ${doc.patient}`,
        payload: payload,
      });

      if (success && signature) {
        console.log("Assinatura Criptográfica gerada:", { signature, payload });
        setIsSignedByMe(true);
        Alert.alert("Sucesso", "Documento assinado digitalmente!");
      } else if (error !== "user_cancellation") {
        Alert.alert("Falha", "Não foi possível coletar a assinatura.");
      }
    } catch (err) {
      console.error("Erro na assinatura:", err);
      Alert.alert("Erro", "Ocorreu um problema técnico na assinatura.");
    }
  };

  // --- GERAR E BAIXAR PDF ---

  const handleDownloadPDF = (logoUri: string, qrCodeUri: string) => {
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
            .chat-container { 
              flex: 1;
              display: flex; 
              flex-direction: column; 
            }
            
            /* --- NOVOS ESTILOS DA ASSINATURA E QR CODE --- */
            .signature-block {
              margin-top: 60px;
              display: flex; 
              align-items: center; 
              justify-content: flex-end; 
              page-break-inside: avoid;
            }
            
            /* Estilo atualizado baseado no primeiro código (verde com borda) */
            .signature-box { 
              padding: 20px; 
              border: 2px solid #34C759; 
              border-radius: 12px; 
              background-color: #f0fdf4; 
              color: #15803d;
              text-align: center;
              max-width: 60%; /* Mantém o layout de coluna ao lado do QR */
            }
            
            .signature-box h3 {
               margin: 0 0 10px 0;
               font-size: 16px;
            }
            
            .signature-box p {
               margin: 4px 0;
               font-size: 14px;
            }
            
            .signature-box .doctor-name {
                font-size: 18px;
                font-weight: bold;
            }
            
            .signature-box .validation-text {
                font-size: 12px;
                color: #166534;
                margin-top: 8px;
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
              <p><strong>Nome:</strong> Alexandre Junior</p>
              <p><strong>CPF:</strong> 44955657885</p>
              <p><strong>E-mail:</strong> alexandre.junior@example.com</p>
              <p><strong>Data de Nasc.:</strong> 01/01/1990</p>
              <p><strong>Endereço:</strong> Rua Exemplo, 123, São Paulo, SP</p>
            </div>
          </div>
          
          <hr class="divider" />

      

          <div class="signature-block">
            <div class="signature-box">
              <h3>✓ Documento Assinado Digitalmente</h3>
              <p class="doctor-name">Murilo Alves Navarro</p>
              <p>CRM/SP 177992 - Especialidade: Cannabis</p>
              <p class="validation-text">Validado via Biometria do Dispositivo</p>
              <p class="validation-text">Emissão: ${new Date().toLocaleString("pt-BR")}</p>
            </div>
            
            <div class="qr-code-container">
              <img src="${qrCodeUri}" class="qr-code" alt="QR Code Estático" />
            </div>
          </div>

        </body>
      </html>
    `;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.largeTitle}>Assinaturas</Text>
          <TouchableOpacity onPress={selectAll}>
            <Text style={styles.headerAction}>
              {selectedIds.length === pendingDocuments.length
                ? "Desmarcar"
                : "Tudo"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.sectionHeader}>DOCUMENTOS PENDENTES</Text>
          <View style={styles.listGroup}>
            {pendingDocuments.map((doc, index) => {
              const isSelected = selectedIds.includes(doc.id);
              const isLastItem = index === pendingDocuments.length - 1;

              return (
                <View
                  key={doc.id}
                  style={[
                    styles.listItem,
                    !isLastItem && styles.listItemBorder,
                  ]}
                >
                  <TouchableOpacity
                    style={styles.itemContent}
                    onPress={() => handleAbrirDocumento(doc)}
                  >
                    <Text style={styles.patientName}>{doc.patient}</Text>
                    <Text style={styles.documentType}>{doc.type}</Text>
                    <Text style={styles.documentDate}>{doc.date}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => toggleSelection(doc.id)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxSelected,
                      ]}
                    >
                      {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              selectedIds.length === 0 && styles.primaryButtonDisabled,
            ]}
            disabled={selectedIds.length === 0}
            onPress={() =>
              Alert.alert(
                "Lote",
                "A assinatura em lote não mostra visualmente o carimbo neste teste.",
              )
            }
          >
            <Text style={styles.primaryButtonText}>
              Assinar Lote{" "}
              {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MODAL DO PDF MOCKADO */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={fecharDocumento}>
              <Text style={styles.modalCancelText}>Fechar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Visualização</Text>
            <View style={{ width: 50 }} />
          </View>

          {/* O "Papel" do PDF */}
          <ScrollView
            style={styles.pdfBackground}
            contentContainerStyle={styles.pdfPaper}
          >
            {/* CABEÇALHO COM LOGO E NOME DA CLÍNICA */}
            <View style={styles.pdfHeader}>
              <Image
                source={require("../../assets/images/icon.png")}
                style={styles.pdfLogo}
                resizeMode="contain"
              />
              <Text style={styles.pdfClinicName}>CANNA CONSULT</Text>
              <Text style={styles.pdfClinicSub}>
                Especialistas em Medicina Canabinoide
              </Text>

              <View style={styles.pdfDocTypeContainer}>
                <Text style={styles.pdfDocType}>
                  {viewingDoc?.type.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.pdfBody}>
              <Text style={styles.pdfPatientInfo}>
                Paciente: <Text style={styles.bold}>{viewingDoc?.patient}</Text>
              </Text>
              <Text style={styles.pdfPatientInfo}>
                Data de Emissão:{" "}
                <Text style={styles.bold}>{viewingDoc?.date}</Text>
              </Text>

              <View style={styles.pdfDivider} />

              <Text style={styles.pdfContent}>{viewingDoc?.mockContent}</Text>
            </View>

            {/* ÁREA DE ASSINATURA DINÂMICA */}
            <View style={styles.pdfFooter}>
              {isSignedByMe ? (
                <View style={styles.verifiedStamp}>
                  <Text style={styles.verifiedStampIcon}>✓</Text>
                  <View>
                    <Text style={styles.pdfDoctorName}>
                      {currentLoggedDoctor.name}
                    </Text>
                    <Text style={styles.pdfDoctorCRM}>
                      CRM-{currentLoggedDoctor.crm}
                    </Text>
                    <Text style={styles.signatureVisualInfo}>
                      Assinado Digitalmente via TouchID/FaceID
                    </Text>
                    <Text style={styles.signatureVisualInfo}>
                      {new Date().toLocaleString()}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={{ alignItems: "center" }}>
                  <View style={styles.signatureLine} />
                  <Text style={styles.pdfDoctorName_Placeholder}>
                    Dr(a). Aguardando Assinatura...
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Botões do Modal: Assinar vs Baixar */}
          <View style={styles.modalBottomBar}>
            {!isSignedByMe ? (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() =>
                  viewingDoc && executarAssinaturaIndividual(viewingDoc)
                }
              >
                <Text style={styles.primaryButtonText}>
                  Assinar com Biometria
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: "#007AFF" }]}
                onPress={async () => {
                  const iconAsset = Image.resolveAssetSource(
                    require("../../assets/images/icon.png"),
                  );
                  const logoUri = iconAsset ? iconAsset.uri : "";

                  const qrCodeAsset = Image.resolveAssetSource(
                    require("../../assets/images/qrcode.png"),
                  );
                  const qrCodeUri = qrCodeAsset ? qrCodeAsset.uri : "";

                  const htmlContent = handleDownloadPDF(logoUri, qrCodeUri);

                  const { uri } = await Print.printToFileAsync({
                    html: htmlContent,
                    base64: false,
                  });

                  const isSharingAvailable = await Sharing.isAvailableAsync();
                  if (isSharingAvailable) {
                    await Sharing.shareAsync(uri, {
                      mimeType: "application/pdf",
                      dialogTitle: "Baixar Documento Médico",
                      UTI: "com.adobe.pdf",
                    });
                  }
                }}
              >
                <Text style={styles.primaryButtonText}>
                  Baixar / Compartilhar PDF
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F2F2F7" },
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  largeTitle: { fontSize: 34, fontWeight: "700", color: "#000" },
  headerAction: { fontSize: 17, color: "#34C759", marginBottom: 6 },
  scrollContent: { paddingBottom: 120 },
  sectionHeader: {
    fontSize: 13,
    color: "#6E6E73",
    marginLeft: 32,
    marginTop: 24,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  listGroup: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    marginHorizontal: 16,
    overflow: "hidden",
  },
  listItem: { flexDirection: "row", alignItems: "center" },
  listItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#C6C6C8",
  },
  itemContent: { flex: 1, paddingVertical: 12, paddingLeft: 16 },
  patientName: { fontSize: 17, fontWeight: "600", color: "#000" },
  documentType: { fontSize: 15, color: "#3C3C43" },
  documentDate: { fontSize: 13, color: "#8E8E93", marginTop: 2 },
  checkboxContainer: { paddingHorizontal: 16, paddingVertical: 20 },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: "#C6C6C8",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: { backgroundColor: "#34C759", borderColor: "#34C759" },
  checkmark: { color: "#FFF", fontSize: 14, fontWeight: "bold" },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#C6C6C8",
  },
  primaryButton: {
    backgroundColor: "#34C759",
    borderRadius: 14,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: { backgroundColor: "#A9E2B6" },
  primaryButtonText: { color: "#FFF", fontSize: 17, fontWeight: "600" },

  // --- STYLES DO MODAL PDF ---
  modalContainer: { flex: 1, backgroundColor: "#F2F2F7" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#C6C6C8",
    backgroundColor: "#FFF",
  },
  modalCancelText: { color: "#007AFF", fontSize: 17 },
  modalTitle: { fontSize: 17, fontWeight: "600" },
  pdfBackground: { flex: 1, backgroundColor: "#D1D1D6", padding: 16 },
  pdfPaper: {
    backgroundColor: "#FFF",
    borderRadius: 4,
    minHeight: 600,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  pdfBody: { flex: 1 },
  pdfPatientInfo: { fontSize: 14, color: "#333", marginBottom: 4 },
  bold: { fontWeight: "bold" },
  pdfDivider: { height: 1, backgroundColor: "#E5E5EA", marginVertical: 16 },
  pdfContent: { fontSize: 15, lineHeight: 24, color: "#000" },

  // --- FOOTER E CARIMBO ---
  pdfFooter: { alignItems: "center", marginTop: 64, minHeight: 80 },
  signatureLine: {
    width: 220,
    height: 1.5,
    backgroundColor: "#8E8E93",
    marginBottom: 12,
  },
  pdfDoctorName_Placeholder: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#8E8E93",
  },

  verifiedStamp: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#34C759",
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(52, 199, 89, 0.05)",
  },
  verifiedStampIcon: {
    fontSize: 28,
    color: "#34C759",
    fontWeight: "bold",
    marginRight: 16,
  },
  pdfDoctorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  pdfDoctorCRM: { fontSize: 14, color: "#555", fontWeight: "600" },
  signatureVisualInfo: { fontSize: 11, color: "#34C759", marginTop: 2 },

  modalBottomBar: {
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#C6C6C8",
  },

  // --- CABEÇALHO DO PDF ---
  pdfHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  pdfLogo: {
    width: 70,
    height: 70,
    marginBottom: 12,
    borderRadius: 16, // Deixa a logo arredondada (estilo Apple)
  },
  pdfClinicName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1C1C1E",
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  pdfClinicSub: {
    fontSize: 13,
    color: "#6E6E73",
    marginBottom: 16,
    fontStyle: "italic",
  },
  pdfDocTypeContainer: {
    backgroundColor: "rgba(52, 199, 89, 0.1)", // Um verde bem clarinho de fundo
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  pdfDocType: {
    fontSize: 13,
    color: "#15803d", // Verde mais escuro para combinar com o tema Canna
    fontWeight: "700",
    letterSpacing: 1,
  },
});
