import React, { useState } from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import TurmasScreen from "./TurmasScreen";
import AtividadesScreen from "./AtividadesScreen";
import NotasScreen from "./NotasScreen";

export type AlunoTab = "turmas" | "atividades" | "notas";

type Props = {
  userName?: string;
  authToken?: string | null;
  onLogout?: () => void;
};

/**
 * Casca do app do aluno: guarda qual aba está aberta e desenha a barra
 * inferior uma única vez. As telas internas (Turmas/Atividades/Notas) NÃO
 * têm barra própria — ela vive só aqui, para não aparecer duplicada.
 */
export default function AlunoApp({ userName = "Aluno", authToken, onLogout }: Props) {
  const [tab, setTab] = useState<AlunoTab>("turmas");

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F1FB" />

      <View style={styles.content}>
        {tab === "turmas" && (
          <TurmasScreen userName={userName} authToken={authToken} onLogout={onLogout} />
        )}
        {tab === "atividades" && (
          <AtividadesScreen userName={userName} authToken={authToken} onLogout={onLogout} />
        )}
        {tab === "notas" && (
          <NotasScreen userName={userName} authToken={authToken} onLogout={onLogout} />
        )}
      </View>

      <View style={styles.bottomNav}>
        <NavItem
          icon="👥"
          label="Turmas"
          ativo={tab === "turmas"}
          onPress={() => setTab("turmas")}
        />
        <NavItem
          icon="📋"
          label="Atividades"
          ativo={tab === "atividades"}
          onPress={() => setTab("atividades")}
        />
        <NavItem
          icon="📄"
          label="Notas"
          ativo={tab === "notas"}
          onPress={() => setTab("notas")}
        />
      </View>
    </SafeAreaView>
  );
}

function NavItem({
  icon,
  label,
  ativo,
  onPress,
}: {
  icon: string;
  label: string;
  ativo: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.navItem} accessibilityRole="button">
      <View style={[styles.navIconWrap, ativo && styles.navIconActive]}>
        <Text style={[styles.navIcon, !ativo && { opacity: 0.55 }]}>{icon}</Text>
      </View>
      <Text style={[styles.navLabel, ativo && styles.navLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F4F1FB" },
  content: { flex: 1 },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E7E2F3",
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 6 : 12,
  },
  navItem: { flex: 1, alignItems: "center" },
  navIconWrap: { paddingHorizontal: 22, paddingVertical: 5, borderRadius: 18 },
  navIconActive: { backgroundColor: "#E6DEFA" },
  navIcon: { fontSize: 18 },
  navLabel: { fontSize: 12, color: "#8A8799", marginTop: 4, fontWeight: "600" },
  navLabelActive: { color: "#4B2FA0", fontWeight: "800" },
});
