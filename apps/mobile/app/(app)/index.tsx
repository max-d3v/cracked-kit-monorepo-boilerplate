import { Button, ScrollView, StyleSheet, Text, View } from "react-native";

import { authClient } from "@/lib/auth-client";

export default function TabOneScreen() {
  const { data: session } = authClient.useSession();
  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, gap: 16 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text style={styles.title}> Expo 🤝 Better Auth</Text>
      <Text style={styles.title}>Welcome {session?.user?.name}</Text>

      <View>
        <Text>User:</Text>
        <Text
          selectable
          style={{
            backgroundColor: "black",
            padding: 16,
            color: "orange",
            borderRadius: 16,
          }}
        >
          {JSON.stringify(session?.user, null, 2)}
        </Text>
      </View>

      <Button onPress={() => authClient.signOut()} title="Sign out" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
