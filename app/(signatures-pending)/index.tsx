import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";

// Dados simulados para o exemplo
const pendingDocuments = [
  {
    id: "1",
    patient: "Alexandre de P. Dias Jr.",
    type: "Receita de Controle Especial",
    date: "Hoje, 14:30",
  },
  {
    id: "2",
    patient: "Mariana Silva Costa",
    type: "Pedido de Exames",
    date: "Hoje, 11:15",
  },
  {
    id: "3",
    patient: "Roberto Almeida",
    type: "Atestado Médico (2 dias)",
    date: "Ontem, 16:40",
  },
];

export default function SignaturesPendingScreen() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectAll = () => {
    if (selectedIds.length === pendingDocuments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingDocuments.map((doc) => doc.id));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Estilo iOS (Large Title) */}
        <View style={styles.header}>
          <Text style={styles.largeTitle}>Assinaturas</Text>
          <TouchableOpacity onPress={selectAll}>
            <Text style={styles.headerAction}>
              {selectedIds.length === pendingDocuments.length
                ? "Desmarcar"
                : "Selecionar Tudo"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.sectionHeader}>DOCUMENTOS PENDENTES</Text>

          {/* Lista Estilo "Inset Grouped" do iOS */}
          <View style={styles.listGroup}>
            {pendingDocuments.map((doc, index) => {
              const isSelected = selectedIds.includes(doc.id);
              const isLastItem = index === pendingDocuments.length - 1;

              return (
                <TouchableOpacity
                  key={doc.id}
                  style={[
                    styles.listItem,
                    !isLastItem && styles.listItemBorder,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => toggleSelection(doc.id)}
                >
                  <View style={styles.itemContent}>
                    <Text style={styles.patientName}>{doc.patient}</Text>
                    <Text style={styles.documentType}>{doc.type}</Text>
                    <Text style={styles.documentDate}>{doc.date}</Text>
                  </View>

                  {/* Círculo de Seleção (Checkmark) */}
                  <View
                    style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected,
                    ]}
                  >
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom Bar Fixa para Ação Principal */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              selectedIds.length === 0 && styles.primaryButtonDisabled,
            ]}
            disabled={selectedIds.length === 0}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              Assinar {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F2F2F7", // Fundo cinza padrão de Settings/Listas do iOS
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: "700",
    color: "#000000",
    letterSpacing: 0.3,
  },
  headerAction: {
    fontSize: 17,
    color: "#34C759", // System Blue
    fontWeight: "400",
    marginBottom: 6,
  },
  scrollContent: {
    paddingBottom: 100, // Espaço para a bottom bar
  },
  sectionHeader: {
    fontSize: 13,
    color: "#6E6E73",
    marginLeft: 32,
    marginTop: 24,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: -0.08,
  },
  listGroup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginHorizontal: 16,
    overflow: "hidden",
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 16,
    backgroundColor: "#FFFFFF",
  },
  listItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#C6C6C8",
  },
  itemContent: {
    flex: 1,
    paddingRight: 16,
  },
  patientName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  documentType: {
    fontSize: 15,
    color: "#3C3C43",
    marginBottom: 2,
  },
  documentDate: {
    fontSize: 13,
    color: "#8E8E93",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C6C6C8",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  checkboxSelected: {
    backgroundColor: "#34C759",
    borderColor: "#34C759",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32, // Padding extra para o home indicator do iPhone
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#C6C6C8",
  },
  primaryButton: {
    backgroundColor: "#34C759",
    borderRadius: 12, // Botões no iOS costumam usar 10 a 14 de radius
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    backgroundColor: "#4FAC66", // Verde desbotado para indicar inatividade
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.4,
  },
});
