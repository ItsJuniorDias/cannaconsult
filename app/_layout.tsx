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
          name="(area-patient)/index"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="(available-physicians)/index"
          options={{ headerShown: false }}
        />

        <Stack.Screen name="(login)/index" options={{ headerShown: false }} />

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
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
