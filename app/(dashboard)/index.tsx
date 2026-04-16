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

// Importações do Firebase
import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

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

        // Cria a referência da coleção
        const laudosCollection = collection(db, "laudos");

        // Cria a query filtrando apenas os laudos do usuário logado
        // ATENÇÃO: Certifique-se de que o campo no Firestore se chama 'userId'
        const q = query(laudosCollection, where("userId", "==", user.uid));

        // Executa a query
        const laudosSnapshot = await getDocs(q);

        const laudosData = laudosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

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

  // Função para abrir a URL
  const handleDownload = async (url) => {
    if (!url) {
      Alert.alert(
        "Aviso",
        "Este documento não possui um link válido para download.",
      );
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Erro", "Não foi possível abrir o link deste documento.");
      }
    } catch (error) {
      console.error("Erro ao tentar abrir URL:", error);
      Alert.alert("Erro", "Ocorreu um problema ao tentar baixar o arquivo.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Olá, {laudos[0]?.paciente || "Usuário"}
          </Text>
          <Text style={styles.subGreeting}>Seja bem-vindo de volta.</Text>
        </View>

        {/* Alerta de Documento */}
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

        {/* Card de Pagamento */}
        {!laudos.length && (
          <TouchableOpacity
            style={styles.paymentCard}
            activeOpacity={0.8}
            onPress={() => router.push("/(payment)")}
          >
            <View style={styles.paymentIconContainer}>
              <Feather name="credit-card" size={22} color="#FFF" />
            </View>
            <View style={styles.paymentTextContainer}>
              <Text style={styles.paymentTitle}>Pagamentos</Text>
              <Text style={styles.paymentDescription}>
                Gerencie seu plano para não perder acesso aos seus laudos.
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color="rgba(255, 255, 255, 0.7)"
            />
          </TouchableOpacity>
        )}

        {/* Área de Laudos */}
        <View style={styles.gridContainer}>
          <View style={styles.mainCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Meus Laudos</Text>
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
                        Consulta - {item.status || "Pendente"}
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
              <Text style={styles.modalTitle}>Documentos Médicos</Text>
              <TouchableOpacity onPress={closeModal}>
                <Feather name="x" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.docIconContainer}>
                <Feather name="folder" size={48} color="#34C75E" />
              </View>
              <Text style={styles.modalTextInfo}>
                Seus documentos médicos estão prontos. Selecione abaixo qual
                arquivo deseja baixar para o seu dispositivo.
              </Text>
            </View>

            <View style={styles.modalActions}>
              {/* Botão de Laudo */}
              {selectedLaudo?.laudoPdfUrl && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.downloadButton]}
                  onPress={() => handleDownload(selectedLaudo.laudoPdfUrl)}
                >
                  <Feather
                    name="file-text"
                    size={20}
                    color="#FFF"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.downloadButtonText}>
                    Baixar Laudo Médico
                  </Text>
                </TouchableOpacity>
              )}

              {/* Botão de Receita */}
              {selectedLaudo?.receitaPdfUrl && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.secondaryButton]}
                  onPress={() => handleDownload(selectedLaudo.receitaPdfUrl)}
                >
                  <Feather
                    name="file-plus"
                    size={20}
                    color="#34C75E"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.secondaryButtonText}>Baixar Receita</Text>
                </TouchableOpacity>
              )}

              {/* Fallback caso nenhum documento esteja disponível */}
              {!selectedLaudo?.laudoPdfUrl && !selectedLaudo?.receitaPdfUrl && (
                <Text style={styles.emptyModalText}>
                  Documentos ainda não disponíveis.
                </Text>
              )}
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
    marginBottom: 16,
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
  paymentCard: {
    backgroundColor: "#34C75E",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#34C75E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  paymentTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },
  paymentDescription: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 4,
    lineHeight: 18,
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
  emptyModalText: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    marginTop: 10,
  },
  modalActions: {
    paddingTop: 10,
    gap: 12,
    width: "100%",
  },
  actionButton: {
    flexDirection: "row",
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  downloadButton: {
    backgroundColor: "#34C75E",
  },
  downloadButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "rgba(52, 199, 94, 0.1)",
  },
  secondaryButtonText: {
    color: "#34C75E",
    fontSize: 16,
    fontWeight: "600",
  },
});
