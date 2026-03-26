import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  ChevronDown,
  FileUp,
  Info,
  IdCard,
  Book,
  FileCheck,
  XCircle,
} from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";

// Novos imports do Firebase (Ajuste o caminho do seu firebaseConfig)
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig"; // <-- ATENÇÃO: Ajuste este caminho!

const PRIMARY_GREEN = "#34C759";

const DOCUMENT_OPTIONS = [
  { id: "rg", label: "RG - Registro Geral", icon: "id-card" },
  {
    id: "cnh",
    label: "CNH - Carteira Nacional de Habilitação",
    icon: "id-card",
  },
  { id: "passaporte", label: "Passaporte", icon: "book" },
];

export default function SendDocumentScreen() {
  const [docType, setDocType] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [frontFile, setFrontFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [backFile, setBackFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const handleSelectDocument = (label: string) => {
    setDocType(label);
    setIsDropdownOpen(false);
  };

  const handlePickDocument = async (side: "front" | "back") => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (side === "front") {
          setFrontFile(result.assets[0]);
        } else {
          setBackFile(result.assets[0]);
        }
      }
    } catch (error) {
      console.error("Erro ao selecionar o arquivo:", error);
      Alert.alert(
        "Erro",
        "Não foi possível selecionar o documento. Tente novamente.",
      );
    }
  };

  const handleRemoveFile = (side: "front" | "back") => {
    if (side === "front") setFrontFile(null);
    else setBackFile(null);
  };

  // Função auxiliar para enviar para o Cloudinary
  const uploadSingleFile = async (file: DocumentPicker.DocumentPickerAsset) => {
    const CLOUD_NAME = "dqvujibkn";
    const UPLOAD_PRESET = "expo-upload";
    const FOLDER_NAME = "documentos_medicos";

    const data = new FormData();
    data.append("file", {
      uri: file.uri,
      type: file.mimeType || "application/octet-stream",
      name: file.name,
    } as any);
    data.append("upload_preset", UPLOAD_PRESET);
    data.append("folder", FOLDER_NAME);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
      {
        method: "POST",
        body: data,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      },
    );

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || "Falha no upload");
    }
    return result.secure_url;
  };

  // --- FUNÇÃO ATUALIZADA: CLOUDINARY + FIRESTORE ---
  const uploadToCloudinaryAndSave = async () => {
    if (!frontFile || !backFile || !docType) return;

    // 1. Verifica se o usuário está logado
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert(
        "Erro de Autenticação",
        "Você precisa estar logado para enviar documentos.",
      );
      return;
    }

    setIsUploading(true);

    try {
      // 2. Faz o upload das imagens para o Cloudinary
      const [frontUrl, backUrl] = await Promise.all([
        uploadSingleFile(frontFile),
        uploadSingleFile(backFile),
      ]);

      // 3. Salva os dados no Firestore na coleção 'document'
      await addDoc(collection(db, "document"), {
        userId: currentUser.uid,
        documentType: docType,
        frontDocumentUrl: frontUrl,
        backDocumentUrl: backUrl,
        status: "pendente", // Opcional: útil para moderação/análise futura
        createdAt: serverTimestamp(), // Salva a data e hora do servidor do Firebase
      });

      Alert.alert(
        "Sucesso!",
        "Seus documentos foram enviados e salvos com sucesso.",
      );

      // 4. Limpa o formulário
      setFrontFile(null);
      setBackFile(null);
      setDocType(null);
    } catch (error: any) {
      console.error("Erro no processo:", error);
      Alert.alert(
        "Erro",
        error.message || "Ocorreu um erro ao enviar os dados. Tente novamente.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Função auxiliar para renderizar os botões
  const renderUploadBox = (
    side: "front" | "back",
    title: string,
    file: DocumentPicker.DocumentPickerAsset | null,
  ) => {
    return (
      <View style={styles.uploadSection}>
        <Text style={styles.uploadLabel}>{title}</Text>

        {!file ? (
          <TouchableOpacity
            style={styles.uploadArea}
            onPress={() => handlePickDocument(side)}
            disabled={isUploading}
          >
            <FileUp size={32} color={PRIMARY_GREEN} strokeWidth={1.5} />
            <Text style={styles.uploadText}>
              Selecionar {title.toLowerCase()}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.uploadAreaSuccess}>
            <View style={styles.fileInfoContainer}>
              <FileCheck size={28} color={PRIMARY_GREEN} />
              <View style={styles.fileTextContainer}>
                <Text
                  style={styles.fileNameText}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {file.name}
                </Text>
                <Text style={styles.fileSizeText}>
                  {(file.size! / 1024 / 1024).toFixed(2)} MB
                </Text>
              </View>
            </View>
            {!isUploading && (
              <TouchableOpacity
                onPress={() => handleRemoveFile(side)}
                style={styles.removeFileBtn}
              >
                <XCircle size={24} color="#FF3B30" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <Text style={styles.title}>Meus Documentos</Text>
          <Text style={styles.subtitle}>
            Gerencie e acesse todos os seus documentos médicos
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Enviar Documento</Text>

          <Text style={styles.label}>Tipo de Documento *</Text>
          <TouchableOpacity
            style={[styles.dropdown, isDropdownOpen && styles.dropdownOpen]}
            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            activeOpacity={0.8}
            disabled={isUploading}
          >
            <Text
              style={[
                styles.dropdownText,
                docType && styles.dropdownTextSelected,
              ]}
            >
              {docType || "Selecione o tipo de documento"}
            </Text>
            <ChevronDown
              size={20}
              color="#999"
              style={{
                transform: [{ rotate: isDropdownOpen ? "180deg" : "0deg" }],
              }}
            />
          </TouchableOpacity>

          {isDropdownOpen && (
            <View style={styles.dropdownList}>
              {DOCUMENT_OPTIONS.map((option, index) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.dropdownItem,
                    index === DOCUMENT_OPTIONS.length - 1 &&
                      styles.lastDropdownItem,
                  ]}
                  onPress={() => handleSelectDocument(option.label)}
                >
                  {option.icon === "id-card" ? (
                    <IdCard size={18} color="#666" />
                  ) : (
                    <Book size={18} color="#666" />
                  )}
                  <Text style={styles.dropdownItemText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.doubleUploadContainer}>
            {renderUploadBox("front", "Frente", frontFile)}
            <View style={{ width: 15 }} />
            {renderUploadBox("back", "Verso", backFile)}
          </View>

          {/* Botão de Enviar chama a nova função combinada */}
          <TouchableOpacity
            onPress={uploadToCloudinaryAndSave}
            style={[
              styles.submitButton,
              (!docType || !frontFile || !backFile || isUploading) &&
                styles.submitButtonDisabled,
            ]}
            disabled={!docType || !frontFile || !backFile || isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>ENVIAR AGORA</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Info size={18} color="#666" />
          <Text style={styles.infoText}>
            Seus dados são protegidos por criptografia de ponta a ponta.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  content: { padding: 20 },
  headerCard: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "700", color: "#2D3436", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#636E72" },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 20,
  },
  label: { fontSize: 14, fontWeight: "500", color: "#444", marginBottom: 8 },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
    backgroundColor: "#FFF",
  },
  dropdownOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
    borderBottomWidth: 0,
  },
  dropdownText: { color: "#999", fontSize: 15 },
  dropdownTextSelected: { color: "#2D3436" },
  dropdownList: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: "#FFF",
    marginBottom: 20,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  lastDropdownItem: { borderBottomWidth: 0 },
  dropdownItemText: { fontSize: 15, color: "#444", marginLeft: 10 },

  // Novos Estilos para o Upload Duplo
  doubleUploadContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  uploadSection: {
    flex: 1,
  },
  uploadLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: PRIMARY_GREEN,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0FFF4",
    minHeight: 110,
  },
  uploadText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    color: PRIMARY_GREEN,
    textAlign: "center",
  },
  uploadAreaSuccess: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: PRIMARY_GREEN,
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#F0FFF4",
    minHeight: 110,
  },
  fileInfoContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  fileTextContainer: {
    alignItems: "center",
    marginTop: 6,
  },
  fileNameText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2D3436",
    textAlign: "center",
  },
  fileSizeText: { fontSize: 11, color: "#666", marginTop: 2 },
  removeFileBtn: { position: "absolute", top: 5, right: 5, padding: 2 },

  submitButton: {
    backgroundColor: PRIMARY_GREEN,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonDisabled: { backgroundColor: "#A5D6A7" },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 10,
  },
  infoText: { fontSize: 12, color: "#666", marginLeft: 8 },
});
