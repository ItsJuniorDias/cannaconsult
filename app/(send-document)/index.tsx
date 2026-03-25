import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
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

  // Novo estado para guardar as informações do arquivo selecionado
  const [selectedFile, setSelectedFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const handleSelectDocument = (label: string) => {
    setDocType(label);
    setIsDropdownOpen(false);
  };

  // Função para abrir o seletor de arquivos
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        // Limita os tipos de arquivos conforme a sua UI (PDF e Imagens)
        type: ["application/pdf", "image/jpeg", "image/png"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Arquivo selecionado com sucesso
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      console.error("Erro ao selecionar o arquivo:", error);
      Alert.alert(
        "Erro",
        "Não foi possível selecionar o documento. Tente novamente.",
      );
    }
  };

  // Função para limpar o arquivo selecionado
  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header Section */}
        <View style={styles.headerCard}>
          <Text style={styles.title}>Meus Documentos</Text>
          <Text style={styles.subtitle}>
            Gerencie e acesse todos os seus documentos médicos
          </Text>
        </View>

        {/* Upload Form Section */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Enviar Documento</Text>

          <Text style={styles.label}>Tipo de Documento *</Text>

          {/* Dropdown Button */}
          <TouchableOpacity
            style={[styles.dropdown, isDropdownOpen && styles.dropdownOpen]}
            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            activeOpacity={0.8}
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

          {/* Dropdown Options List */}
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

          {/* Área de Upload Dinâmica */}
          {!selectedFile ? (
            <TouchableOpacity
              style={styles.uploadArea}
              onPress={handlePickDocument}
            >
              <FileUp size={40} color={PRIMARY_GREEN} strokeWidth={1.5} />
              <Text style={styles.uploadText}>
                Toque para selecionar um arquivo
              </Text>
              <Text style={styles.uploadSubtext}>PDF, JPG ou PNG até 10MB</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.uploadAreaSuccess}>
              <View style={styles.fileInfoContainer}>
                <FileCheck size={32} color={PRIMARY_GREEN} />
                <View style={styles.fileTextContainer}>
                  <Text
                    style={styles.fileNameText}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    {selectedFile.name}
                  </Text>
                  <Text style={styles.fileSizeText}>
                    {(selectedFile.size! / 1024 / 1024).toFixed(2)} MB
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleRemoveFile}
                style={styles.removeFileBtn}
              >
                <XCircle size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            onPress={() => {
              console.log(selectedFile, "SELECTED FILES");
            }}
            style={[
              styles.submitButton,
              (!docType || !selectedFile) && styles.submitButtonDisabled,
            ]}
            disabled={!docType || !selectedFile}
          >
            <Text style={styles.submitButtonText}>ENVIAR AGORA</Text>
          </TouchableOpacity>
        </View>

        {/* Info Box */}
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
  // ... (mantenha os estilos anteriores de container, text, dropdown, etc) ...
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

  // Estilos da área de Upload
  uploadArea: {
    borderWidth: 2,
    borderColor: PRIMARY_GREEN,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0FFF4",
    marginBottom: 20,
  },
  uploadText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: PRIMARY_GREEN,
  },
  uploadSubtext: { fontSize: 12, color: "#666", marginTop: 4 },

  // Novos estilos para quando o arquivo for selecionado com sucesso
  uploadAreaSuccess: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: PRIMARY_GREEN,
    borderRadius: 12,
    padding: 20,
    backgroundColor: "#F0FFF4",
    marginBottom: 20,
  },
  fileInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  fileTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  fileNameText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D3436",
  },
  fileSizeText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  removeFileBtn: {
    padding: 4,
  },

  submitButton: {
    backgroundColor: PRIMARY_GREEN,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonDisabled: { backgroundColor: "#A5D6A7" }, // Cor mais clara quando desabilitado
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
