import { Link } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { authClient } from "@/lib/auth-client";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const signInResponse = await authClient.signIn.email({
      email,
      password,
    });
    if (signInResponse.error) {
      Alert.alert("Error", signInResponse.error.message);
      return;
    }
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <Text style={{ fontSize: 32, fontWeight: "bold", margin: 10 }}>
        Sign In
      </Text>
      <TextInput
        autoCapitalize="none"
        inputMode="email"
        onChangeText={setEmail}
        placeholder="Email"
        style={styles.input}
        value={email}
      />
      <TextInput
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
      />
      <Button onPress={handleLogin} title="Sign in" />
      <Link asChild href="/(auth)/sign-up">
        <Button title="Sign up" />
      </Link>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 10,
    padding: 10,
    margin: 10,
  },
});
