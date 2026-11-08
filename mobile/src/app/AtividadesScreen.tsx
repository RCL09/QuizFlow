import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

type Filtro = "todas" | "aFazer" | "concluidas";
type Status = "aFazer" | "pendente" | "concluida";

type Atividade = {
  id: string;
  titulo: string;
  turma: string;
  prazo: string;
  status: Status;
  progresso: number; // 0 a 1
  icone: string;
  cor: string;
  corClara: string;
};

const ATIVIDADES_EXEMPLO: Atividade[] = [
  {
    id: "1",
    titulo: "Atividade de História",
    turma: "Turma A",
    prazo: "Entrega: 15/10",
    status: "aFazer",
    progresso: 0.5,
    icone: "📓",
    cor: "#C084FC",
    corClara: "#F3E4FE",
  },
  {
    id: "2",
    titulo: "Exercício de Frações",
    turma: "Turma B",
    prazo: "Vence hoje",
    status: "aFazer",
    progresso: 0.32,
    icone: "🧮",
    cor: "#60A5FA",
    corClara: "#DBE9FE",
  },
  {
    id: "3",
    titulo: "Leitura de Português",
    turma: "Turma B",
    prazo: "Vence hoje",
    status: "pendente",
    progresso: 0.22,
    icone: "📖",
    cor: "#FBBF24",
    corClara: "#FDF3D9",
  },
  {
    id: "4",
    titulo: "Questionário de Ciências",
    turma: "Turma B",
    prazo: "Vence hoje",
    status: "concluida",
    progresso: 1,
    icone: "🔬",
    cor: "#4ADE80",
    corClara: "#E0F8E7",
  },
];

const ESTILO_STATUS: Record<Status, { label: string; bg: string; color: string }> = {
  aFazer: { label: "A fazer", bg: "#DDE3FB", color: "#2E3A6B" },
  pendente: { label: "Pendente", bg: "#FBE7C6", color: "#8A5A0B" },
  concluida: { label: "Concluída", bg: "#BFEBCB", color: "#1E6B3A" },
};

type Props = {
  userName?: string;
  authToken?: string | null;
  onLogout?: () => void;
};

export default function AtividadesScreen({ userName = "Ana", authToken, onLogout }: Props) {
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [atividades, setAtividades] = useState<Atividade[]>(ATIVIDADES_EXEMPLO);
  const [erro, setErro] = useState("");

  const lista = useMemo(() => {
    if (filtro === "aFazer") return atividades.filter((a) => a.status === "aFazer");
    if (filtro === "concluidas") return atividades.filter((a) => a.status === "concluida");
    return atividades;
  }, [filtro, atividades]);

  const pendentes = atividades.filter((a) => a.status !== "concluida").length;

  async function carregarAtividades() {
    setErro("");
    try {
      // Endpoint sugerido: ajuste para a rota real do seu backend.
      const response = await fetch(`${API_BASE_URL}/api/aluno/atividades`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      });
      if (!response.ok) throw new Error("Não foi possível carregar as atividades.");
      const data = await response.json();
      if (Array.isArray(data?.atividades)) setAtividades(data.atividades);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErro(
        msg.includes("Network request failed") || msg.includes("Failed to fetch")
          ? "Não foi possível conectar ao servidor."
          : msg
      );
    }
  }

  function alternarConclusao(id: string) {
    setAtividades((atual) =>
      atual.map((a) =>
        a.id === id
          ? {
              ...a,
              status: a.status === "concluida" ? ("aFazer" as Status) : ("concluida" as Status),
              progresso: a.status === "concluida" ? 0.5 : 1,
            }
          : a
      )
    );
  }

  const inicial = userName.trim().charAt(0).toUpperCase() || "A";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Topo */}
        <View style={styles.header}>
          <Text style={styles.brand}>QuizFlow</Text>
          <Pressable onLongPress={onLogout} style={styles.avatar}>
            <Text style={styles.avatarText}>{inicial}</Text>
          </Pressable>
        </View>

        <Text style={styles.hello}>Olá, {userName}!</Text>

        {/* Filtros */}
        <View style={styles.chipsRow}>
          <Chip label="Todas" ativo={filtro === "todas"} onPress={() => setFiltro("todas")} />
          <Chip label="A fazer" ativo={filtro === "aFazer"} onPress={() => setFiltro("aFazer")} />
          <Chip label="Concluídas" ativo={filtro === "concluidas"} onPress={() => setFiltro("concluidas")} />
        </View>

        {!!erro && (
          <Pressable onPress={carregarAtividades} style={styles.errorBox}>
            <Text style={styles.errorText}>{erro} Toque para tentar de novo.</Text>
          </Pressable>
        )}

        {/* Lista */}
        {lista.map((a) => {
          const s = ESTILO_STATUS[a.status];
          return (
            <Pressable
              key={a.id}
              onPress={() => alternarConclusao(a.id)}
              style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.99 }] }]}
            >
              <View style={[styles.cardBar, { backgroundColor: a.cor }]} />
              <View style={styles.cardBody}>
                <View style={[styles.iconBox, { backgroundColor: a.corClara }]}>
                  <Text style={styles.icon}>{a.icone}</Text>
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.titleRow}>
                    <Text style={styles.cardTitle}>{a.titulo}</Text>
                    <View style={[styles.statusPill, { backgroundColor: s.bg }]}>
                      <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
                    </View>
                  </View>

                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${Math.round(a.progresso * 100)}%`, backgroundColor: a.cor },
                      ]}
                    />
                  </View>

                  <Text style={styles.cardSub}>
                    {a.turma} • {a.prazo}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}

        {lista.length === 0 && <Text style={styles.empty}>Nenhuma atividade por aqui.</Text>}

        <Text style={styles.footer}>
          {pendentes === 1
            ? "Você tem 1 atividade pendente"
            : `Você tem ${pendentes} atividades pendentes`}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Chip({ label, ativo, onPress }: { label: string; ativo: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, ativo && styles.chipActive]}>
      <Text style={[styles.chipText, ativo && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const ROXO = "#6E4FC9";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F4F1FB" },
  scroll: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 20 },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  brand: { fontSize: 27, fontWeight: "800", color: "#7B57D1", letterSpacing: -0.5 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#E1E7FA", alignItems: "center", justifyContent: "center" },
  avatarText: { color: ROXO, fontSize: 18, fontWeight: "800" },

  hello: { fontSize: 26, fontWeight: "800", color: "#1E1B33", marginBottom: 14 },

  chipsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  chip: { paddingHorizontal: 18, paddingVertical: 11, borderRadius: 22, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#C9CBDA" },
  chipActive: { backgroundColor: "#DCD6F7", borderColor: "#DCD6F7" },
  chipText: { fontSize: 14.5, color: "#5B5A6B", fontWeight: "600" },
  chipTextActive: { color: "#4B2FA0", fontWeight: "800" },

  errorBox: { backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA", borderRadius: 12, padding: 12, marginBottom: 14 },
  errorText: { color: "#B91C1C", fontSize: 12.5, fontWeight: "600" },

  card: { backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1, borderColor: "#ECE7F8", marginBottom: 14, overflow: "hidden", shadowColor: "#2A1458", shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  cardBar: { width: 5, position: "absolute", top: 0, bottom: 0, left: 0 },
  cardBody: { flexDirection: "row", padding: 16, paddingLeft: 18, gap: 14, alignItems: "center" },
  iconBox: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 24 },
  cardContent: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  cardTitle: { flex: 1, fontSize: 17, fontWeight: "800", color: "#111018", lineHeight: 22 },
  statusPill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 11.5, fontWeight: "700" },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: "#EAE7F1", marginTop: 10, overflow: "hidden" },
  progressFill: { height: 4, borderRadius: 2 },
  cardSub: { fontSize: 13, color: "#3D3655", marginTop: 9 },
  empty: { textAlign: "center", color: "#8A8799", marginTop: 24 },
  footer: { textAlign: "center", color: "#6B6680", fontSize: 13.5, marginTop: 6 },
});
