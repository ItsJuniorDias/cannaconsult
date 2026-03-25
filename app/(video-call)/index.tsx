import React, { useRef, useState, useEffect, use } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { Camera } from "expo-camera";
import { Audio } from "expo-av";
import { useRouter } from "expo-router";

const ROOM_URL = "https://cannaprescription.daily.co/canna_room";

export default function VideoCallScreen() {
  const webviewRef = useRef(null);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isRequesting, setIsRequesting] = useState(true);

  const router = useRouter();

  // Pede as permissões assim que a tela abre
  useEffect(() => {
    (async () => {
      try {
        const cameraStatus = await Camera.requestCameraPermissionsAsync();
        const audioStatus = await Audio.requestPermissionsAsync();

        if (
          cameraStatus.status === "granted" &&
          audioStatus.status === "granted"
        ) {
          setHasPermissions(true);
        } else {
          setHasPermissions(false);
        }
      } catch (error) {
        console.warn("Erro ao pedir permissões:", error);
      } finally {
        setIsRequesting(false);
      }
    })();
  }, []);

  const leaveCall = () => {
    router.back();
    console.log("Saindo da chamada...");
  };

  // Tela de Loading enquanto pede permissão
  if (isRequesting) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34C75E" />
        <Text style={styles.loadingText}>Preparando sala segura...</Text>
      </View>
    );
  }

  // Tela de Erro se o usuário negar a permissão
  if (!hasPermissions) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#FF3B30" />
        <Text style={styles.loadingText}>
          Precisamos da sua câmera e microfone para a consulta.
        </Text>
      </View>
    );
  }

  // Se tem permissão, renderiza a WebView normalmente
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1C1C1E" />

      {/* Cabeçalho Flutuante Customizado */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={leaveCall}>
          <Ionicons name="chevron-down" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.secureBadge}>
          <Ionicons name="shield-checkmark" size={14} color="#34C75E" />
          <Text style={styles.secureText}>Consulta Segura</Text>
        </View>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => webviewRef.current?.reload()}
        >
          <Ionicons name="refresh" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.webviewContainer}>
        <WebView
          ref={webviewRef}
          source={{ uri: ROOM_URL }}
          style={styles.webview}
          // Props obrigatórias para WebRTC na WebView
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={["*"]} // Permite carregar recursos externos cruciais
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1C1E",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: "#FFF",
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    zIndex: 10,
    backgroundColor: "#1C1C1E",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  secureBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(52, 199, 94, 0.3)",
  },
  secureText: {
    color: "#34C75E",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },
  webviewContainer: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
