import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import * as Location from "expo-location";

import { auth } from "@/firebaseConfig";

export default function OnboardingScreen() {
  const router = useRouter();
  const isLogged = auth.currentUser;

  // Estados para controle de localização
  const [isCheckingLocation, setIsCheckingLocation] = useState(true);
  const [isAllowedRegion, setIsAllowedRegion] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // Defina os países permitidos (BR = Brasil)
  const ALLOWED_COUNTRIES = ["BR"];

  useEffect(() => {
    checkLocation();
  }, []);

  const checkLocation = async () => {
    setIsCheckingLocation(true);
    setLocationError(null);

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError(
          "Precisamos da permissão de localização para garantir que o app opera dentro da legalidade na sua região.",
        );
        setIsCheckingLocation(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      let geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode.length > 0) {
        const userCountry = geocode[0].isoCountryCode; // Retorna 'BR', 'US', etc.
        if (ALLOWED_COUNTRIES.includes(userCountry)) {
          setIsAllowedRegion(true);
        } else {
          setIsAllowedRegion(false);
        }
      } else {
        setLocationError("Não foi possível determinar sua região.");
      }
    } catch (error) {
      setLocationError(
        "Ocorreu um erro ao verificar sua localização geográfica.",
      );
    } finally {
      setIsCheckingLocation(false);
    }
  };

  // TELA DE LOADING (Enquanto verifica o GPS)
  if (isCheckingLocation) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#34C759" />
          <Text
            style={[styles.subtitle, { marginTop: 16, textAlign: "center" }]}
          >
            Verificando disponibilidade na sua região...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // TELA DE ERRO OU REGIÃO BLOQUEADA
  if (locationError || isAllowedRegion === false) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View
              style={[
                styles.iconBackground,
                { backgroundColor: "rgba(255, 59, 48, 0.12)" },
              ]}
            >
              <Feather name="map-pin" size={32} color="#FF3B30" />
            </View>
          </View>

          <Text style={styles.title}>
            Região <Text style={{ color: "#FF3B30" }}>Não Suportada.</Text>
          </Text>

          <Text style={styles.subtitle}>
            {locationError
              ? locationError
              : "Devido a regulamentações legais e diretrizes médicas, a Canna Consult ainda não está disponível na sua localização atual."}
          </Text>

          <View style={styles.spacer} />

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: "#000000" }]}
            activeOpacity={0.8}
            onPress={checkLocation}
          >
            <Text style={styles.primaryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // TELA PRINCIPAL (Se a localização for permitida)
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconBackground}>
            <Feather name="activity" size={32} color="#34C759" />
          </View>
        </View>

        <Text style={styles.title}>
          Um tratamento seguro, legal e humanizado para transformar sua saúde
          com <Text style={styles.titleHighlight}>cannabis medicinal.</Text>
        </Text>

        <Text style={styles.subtitle}>
          Atendimento médico especializado e suporte contínuo. A{" "}
          <Text style={styles.textBold}>Canna Consult</Text> une ciência e
          tecnologia para ajudar você a superar insônia, ansiedade e dores
          crônicas, com total segurança jurídica.
        </Text>

        <View style={styles.spacer} />

        <View style={styles.buttonsWrapper}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={() => {
              if (isLogged) {
                router.push("/(available-physicians)");
              } else {
                router.push("/(login)");
              }
            }}
          >
            <Text style={styles.primaryButtonText}>Iniciar Avaliação</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.6}
            onPress={() => router.push("/(medical-login)")}
          >
            <Text style={styles.secondaryButtonText}>Área do Médico</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconBackground: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "rgba(52, 199, 89, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#000000",
    lineHeight: 41,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  titleHighlight: {
    color: "#34C759",
  },
  subtitle: {
    fontSize: 17,
    color: "#3C3C43",
    lineHeight: 24,
    fontWeight: "400",
  },
  textBold: {
    fontWeight: "600",
    color: "#000000",
  },
  spacer: {
    flex: 1,
  },
  buttonsWrapper: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#34C759",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 17,
  },
  secondaryButton: {
    backgroundColor: "#F2F2F7",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  secondaryButtonText: {
    color: "#34C759",
    fontWeight: "600",
    fontSize: 17,
  },
});
