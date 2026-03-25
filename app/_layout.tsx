import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)/index" options={{ headerShown: false }} />
        <Stack.Screen name="(app)/index" options={{ headerShown: false }} />
        <Stack.Screen
          name="(download-pdf)/index"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="(area-physician)/index"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="(available-physicians)/index"
          options={{ headerShown: false }}
        />

        <Stack.Screen name="(login)/index" options={{ headerShown: false }} />
        <Stack.Screen
          name="(medical-login)/index"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="(create-account)/index"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="(define-goals)/index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(define-goals-2)/index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(define-goals-3)/index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(define-goals-4)/index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(define-goals-5)/index"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="(success-profile)/index"
          options={{ headerShown: false }}
        />

        <Stack.Screen name="(payment)/index" options={{ headerShown: false }} />

        <Stack.Screen
          name="(video-call)/index"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="(signatures-pending)/index"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="(dashboard)/index"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="(send-document)/index"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="(my-revenues)/index"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="(my-consultations)/index"
          options={{ headerShown: false }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
