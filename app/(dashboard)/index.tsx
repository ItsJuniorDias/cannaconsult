import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Alert,
  Linking,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Importações para geração e visualização do PDF
import { writeAsStringAsync, deleteAsync } from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print"; // Nova importação adicionada

// Importações do Firebase (Ajuste o caminho conforme o seu projeto)
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { EncodingType } from "expo-file-system/build/ExpoFileSystem.types";

export default function Dashboard() {
  const router = useRouter();

  // Estados principais
  const [laudos, setLaudos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados do Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLaudo, setSelectedLaudo] = useState(null);

  // Efeito para buscar os dados no Firestore ao carregar a tela
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const user = auth.currentUser;
        if (!user) {
          console.warn("Usuário não autenticado");
          return;
        }

        const laudosCollection = collection(db, "laudos");
        const laudosSnapshot = await getDocs(laudosCollection);

        // Mapeia os documentos e filtra (caso você relacione o laudo ao usuário logado)
        const laudosData = laudosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // .filter((laudo) => laudo.paciente === user.displayName); // Adapte o filtro conforme sua regra de negócio

        setLaudos(laudosData);
      } catch (error) {
        console.error("Erro ao buscar dados do Firestore:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Funções de controle do Modal
  const openModal = (laudo) => {
    setSelectedLaudo(laudo);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedLaudo(null);
  };

  // Função 1: Abre a URL do laudo assinado no navegador/leitor do sistema
  const handleDownload = async (url) => {
    if (!url) {
      Alert.alert("Aviso", "Este laudo não possui um link para download.");
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Erro", "Não foi possível abrir o link deste laudo.");
      }
    } catch (error) {
      console.error("Erro ao tentar abrir URL:", error);
      Alert.alert("Erro", "Ocorreu um problema ao tentar baixar o arquivo.");
    }
  };

  // Função 2: Converte o código (HTML/Texto) em PDF e abre nativamente

  const handleGenerateAndOpenPdf = async (conteudoBase64) => {
    if (!conteudoBase64) {
      Alert.alert("Aviso", "Conteúdo do laudo indisponível.");
      return;
    }

    try {
      // Decodifica o Base64 para texto (assumindo que seja HTML)
      const decodedContent = atob(conteudoBase64);

      //formatar o conteúdo HTML para garantir que seja renderizado corretamente
      const htmlContent = `
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #34C75E; }
              p { font-size: 14px; line-height: 1.5; }
            </style>
          </head>
          <body>
            ${decodedContent}
          </body>
        </html>
      `;

      // Gera o PDF usando o conteúdo decodificado
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
      });

      // Compartilha o PDF gerado
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Compartilhar Laudo Médico",
        UTI: "com.adobe.pdf",
      });

      // Opcional: Exclui o arquivo temporário após compartilhar
      await deleteAsync(uri, { idempotent: true });
    } catch (error) {
      console.error("Erro ao processar Base64:", error);
      Alert.alert("Erro", "Não foi possível processar e abrir o laudo.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, Alexandre</Text>
          <Text style={styles.subGreeting}>Seja bem-vindo de volta.</Text>
        </View>

        {/* Alerta */}
        <TouchableOpacity style={styles.alertCard} activeOpacity={0.7}>
          <View style={styles.alertIconContainer}>
            <Feather name="folder" size={24} color="#34C75E" />
          </View>
          <View style={styles.alertTextContainer}>
            <Text style={styles.alertTitle}>Estamos quase lá!</Text>
            <Text style={styles.alertDescription}>
              Envie seu documento de identificação para agilizar suas receitas.
            </Text>

            <TouchableOpacity onPress={() => router.push("/(send-document)")}>
              <Text style={styles.alertLink}>Enviar agora →</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Área de Laudos */}
        <View style={styles.gridContainer}>
          <View style={styles.mainCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Meus Laudos</Text>
              <TouchableOpacity onPress={() => router.push("/(my-revenues)")}>
                <Text style={styles.seeMore}>Ver todos</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator size="small" color="#34C75E" />
              </View>
            ) : laudos.length > 0 ? (
              <View style={styles.listContainer}>
                {laudos.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.listItem,
                      index === laudos.length - 1 && styles.lastListItem,
                    ]}
                    activeOpacity={0.6}
                    onPress={() => openModal(item)}
                  >
                    <View
                      style={[
                        styles.itemIcon,
                        { backgroundColor: "rgba(52, 199, 94, 0.1)" },
                      ]}
                    >
                      <Feather name="file-text" size={20} color="#34C75E" />
                    </View>
                    <View style={styles.itemContent}>
                      <Text style={styles.itemTitle}>
                        Laudo Médico - {item.status || "Pendente"}
                      </Text>
                      <Text style={styles.itemSubtitle}>
                        Dr(a). {item.medico || "Não informado"} •{" "}
                        {item.dataCriacao || ""}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#C7C7CC" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.infoCircle}>
                  <Feather name="info" size={20} color="#8E8E93" />
                </View>
                <Text style={styles.emptyText}>Nenhum laudo encontrado.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modal de Ações do Laudo */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes do Laudo</Text>
              <TouchableOpacity onPress={closeModal}>
                <Feather name="x" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.docIconContainer}>
                <Feather name="file-text" size={48} color="#34C75E" />
              </View>
              <Text style={styles.modalTextInfo}>
                O laudo médico está pronto. Você pode visualizá-lo diretamente
                no seu celular ou baixar a versão assinada.
              </Text>
            </View>

            <View style={styles.modalActions}>
              {/* Botão que abre a URL */}
              <TouchableOpacity
                style={[styles.actionButton, styles.downloadButton]}
                onPress={() => handleDownload(selectedLaudo?.urlAssinado)}
              >
                <Feather
                  name="download"
                  size={20}
                  color="#FFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.downloadButtonText}>
                  Baixar PDF Assinado
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
    marginTop: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 16,
    color: "#8E8E93",
    marginTop: 4,
  },
  alertCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: "#34C75E",
  },
  alertIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "rgba(52, 199, 94, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#34C75E",
  },
  alertDescription: {
    fontSize: 14,
    color: "#3A3A3C",
    marginTop: 2,
  },
  alertLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#34C75E",
    marginTop: 8,
  },
  gridContainer: {
    gap: 20,
  },
  mainCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 20,
    minHeight: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  seeMore: {
    fontSize: 14,
    color: "#34C75E",
    fontWeight: "600",
  },
  listContainer: {
    flex: 1,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5EA",
  },
  lastListItem: {
    borderBottomWidth: 0,
  },
  itemIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 10,
  },
  infoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#8E8E93",
  },

  // --- Estilos do Modal ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  modalBody: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  docIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(52, 199, 94, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTextInfo: {
    fontSize: 15,
    color: "#3A3A3C",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  modalActions: {
    paddingTop: 10,
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  downloadButton: {
    backgroundColor: "#34C75E",
  },
  downloadButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  viewButton: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#34C75E",
  },
  viewButtonText: {
    color: "#34C75E",
    fontSize: 16,
    fontWeight: "600",
  },
});
