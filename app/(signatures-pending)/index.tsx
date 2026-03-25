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
    mockContent:
      "USO ORAL\n\n1. Clonazepam 2mg ------ 1 caixa\nTomar 1 comprimido à noite.\n\n2. Escitalopram 10mg ------ 1 caixa\nTomar 1 comprimido pela manhã.\n\n_______________________\nTratamento contínuo.",
  },
  {
    id: "2",
    patient: "Mariana Silva Costa",
    type: "Pedido de Exames",
    date: "Hoje, 11:15",
    mockContent:
      "SOLICITAÇÃO DE EXAMES\n\n1. Hemograma Completo\n2. Glicemia de Jejum\n3. Colesterol Total e Frações\n\nJustificativa: Check-up anual.",
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
  const handleDownloadPDF = async () => {
    if (!viewingDoc) return;

    try {
      const htmlContent = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
              .header { text-align: center; margin-bottom: 40px; }
              .clinic-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
              .doc-type { font-size: 14px; color: #666; letter-spacing: 1px; text-transform: uppercase; }
              .divider { border-bottom: 1px solid #E5E5EA; margin: 20px 0; }
              .content { white-space: pre-wrap; font-size: 16px; line-height: 1.6; }
              .signature-box { 
                margin-top: 80px; 
                padding: 20px; 
                border: 2px solid #34C759; 
                border-radius: 8px; 
                background-color: #f0fdf4; 
                color: #15803d;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="clinic-name">CLÍNICA MÉDICA EXEMPLO</div>
              <div class="doc-type">${viewingDoc.type}</div>
            </div>
            
            <p><strong>Paciente:</strong> ${viewingDoc.patient}</p>
            <p><strong>Data:</strong> ${viewingDoc.date}</p>
            
            <div class="divider"></div>
            
            <div class="content">${viewingDoc.mockContent}</div>
            
            <div class="signature-box">
              <h3 style="margin: 0 0 10px 0;">✓ Documento Assinado Digitalmente</h3>
              <p style="margin: 4px 0; font-size: 18px;"><strong>${currentLoggedDoctor.name}</strong></p>
              <p style="margin: 4px 0;">CRM: ${currentLoggedDoctor.crm}</p>
              <p style="margin: 4px 0; font-size: 12px; color: #166534;">Validado via Biometria do Dispositivo</p>
              <p style="margin: 4px 0; font-size: 12px; color: #166534;">Data/Hora: ${new Date().toLocaleString()}</p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Salvar ou Compartilhar Documento",
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert(
          "Aviso",
          "O compartilhamento não está disponível neste dispositivo.",
        );
      }
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      Alert.alert("Erro", "Não foi possível gerar o arquivo PDF.");
    }
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
            <View style={styles.pdfHeader}>
              <Text style={styles.pdfClinicName}>CLÍNICA MÉDICA EXEMPLO</Text>
              <Text style={styles.pdfDocType}>
                {viewingDoc?.type.toUpperCase()}
              </Text>
            </View>

            <View style={styles.pdfBody}>
              <Text style={styles.pdfPatientInfo}>
                Paciente: <Text style={styles.bold}>{viewingDoc?.patient}</Text>
              </Text>
              <Text style={styles.pdfPatientInfo}>
                Data: {viewingDoc?.date}
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
                onPress={handleDownloadPDF}
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
  pdfHeader: { alignItems: "center", marginBottom: 32 },
  pdfClinicName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  pdfDocType: { fontSize: 14, color: "#666", letterSpacing: 1 },
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
});
