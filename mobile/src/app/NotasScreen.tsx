import React, { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

type Filtro = "todas" | "provas" | "trabalhos";
type Tipo = "prova" | "trabalho";

type Nota = {
  id: string;
  materia: string;
  turma: string;
  valor: number; // 0 a 10
  tipo: Tipo;
  data: string;
  cor: string;
  corClara: string;
};

const NOTAS_EXEMPLO: Nota[] = [
  { id: "1", materia: "Matemática", turma: "Matemática — 2º A", valor: 9.0, tipo: "prova", data: "20/10", cor: "#7C5CD6", corClara: "#EDE7FB" },
  { id: "2", materia: "Português", turma: "Português — 2º A", valor: 8.5, tipo: "trabalho", data: "18/10", cor: "#2BA3A6", corClara: "#DDF4F4" },
  { id: "3", materia: "Biologia", turma: "Biologia — 2º A", valor: 9.3, tipo: "prova", data: "15/10", cor: "#4CA867", corClara: "#E0F3E5" },
  { id: "4", materia: "História", turma: "História — 2º A", valor: 8.1, tipo: "trabalho", data: "10/10", cor: "#D9962B", corClara: "#FCEFD8" },
];

function formatarNota(v: number) {
  return v.toFixed(1).replace(".", ",");
}

function serieDaTurma(turma: string) {
  const partes = turma.split("—");
  return partes.length > 1 ? partes[1].trim() : "";
}

type Props = {
  userName?: string;
  authToken?: string | null;
  onLogout?: () => void;
};

export default function NotasScreen({ userName = "Ana", authToken, onLogout }: Props) {
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [notas, setNotas] = useState<Nota[]>(NOTAS_EXEMPLO);
  const [erro, setErro] = useState("");

  const lista = useMemo(() => {
    if (filtro === "provas") return notas.filter((n) => n.tipo === "prova");
    if (filtro === "trabalhos") return notas.filter((n) => n.tipo === "trabalho");
    return notas;
  }, [filtro, notas]);

  const media = useMemo(() => {
    if (notas.length === 0) return 0;
    return notas.reduce((soma, n) => soma + n.valor, 0) / notas.length;
  }, [notas]);

  async function carregarNotas() {
    setErro("");
    try {
      // Endpoint sugerido: ajuste para a rota real do seu backend.
      const response = await fetch(`${API_BASE_URL}/api/aluno/notas`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      });
      if (!response.ok) throw new Error("Não foi possível carregar as notas.");
      const data = await response.json();
      if (Array.isArray(data?.notas)) setNotas(data.notas);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErro(
        msg.includes("Network request failed") || msg.includes("Failed to fetch")
          ? "Não foi possível conectar ao servidor."
          : msg
      );
    }
  }

  const inicial = userName.trim().charAt(0).toUpperCase() || "A";
  const ultima = notas[0];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F1FB" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Topo */}
        <View style={styles.header}>
          <Text style={styles.brand}>QuizFlow</Text>
          <Pressable onLongPress={onLogout} style={styles.avatar}>
            <Text style={styles.avatarText}>{inicial}</Text>
          </Pressable>
        </View>

        <Text style={styles.hello}>Olá, {userName}!</Text>

        {/* Resumo */}
        <View style={styles.statsRow}>
          <Stat valor={formatarNota(media)} label="Média geral" bg="#EDE7FB" />
          <Stat valor={String(notas.length)} label="Notas lançadas" bg="#D7F2F1" />
          <Stat valor="92%" label="Frequência" bg="#E0F3E5" />
        </View>

        {/* Filtros */}
        <View style={styles.chipsRow}>
          <Chip label="Todas" ativo={filtro === "todas"} onPress={() => setFiltro("todas")} />
          <Chip label="Provas" ativo={filtro === "provas"} onPress={() => setFiltro("provas")} />
          <Chip label="Trabalhos" ativo={filtro === "trabalhos"} onPress={() => setFiltro("trabalhos")} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Minhas notas</Text>
          <Pressable onPress={carregarNotas}>
            <Text style={styles.sectionLink}>Atualizar</Text>
          </Pressable>
        </View>

        {!!erro && (
          <Pressable onPress={carregarNotas} style={styles.errorBox}>
            <Text style={styles.errorText}>{erro} Toque para tentar de novo.</Text>
          </Pressable>
        )}

        {/* Lista de notas */}
        {lista.map((n) => (
          <View key={n.id} style={styles.card}>
            <View style={[styles.cardBar, { backgroundColor: n.cor }]} />
            <View style={styles.cardBody}>
              <View style={[styles.badge, { backgroundColor: n.corClara }]}>
                <Text style={[styles.badgeText, { color: n.cor }]}>{n.materia.charAt(0)}</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {n.materia} {serieDaTurma(n.turma) ? `— ${serieDaTurma(n.turma)}` : ""}
                </Text>
                <Text style={styles.cardSub} numberOfLines={1}>
                  {n.tipo === "prova" ? "Prova" : "Trabalho"} • {n.data}
                </Text>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.round((n.valor / 10) * 100)}%`, backgroundColor: n.cor },
                    ]}
                  />
                </View>
              </View>
              <Text style={[styles.grade, { color: n.cor }]}>{formatarNota(n.valor)}</Text>
            </View>
          </View>
        ))}

        {lista.length === 0 && <Text style={styles.empty}>Nenhuma nota por aqui.</Text>}

        {!!ultima && (
          <View style={styles.lastBox}>
            <Text style={styles.lastLabel}>ÚLTIMA NOTA LANÇADA</Text>
            <Text style={styles.lastValue}>
              {ultima.turma} • {formatarNota(ultima.valor)}
            </Text>
            <Text style={styles.lastDate}>{ultima.data}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ valor, label, bg }: { valor: string; label: string; bg: string }) {
  return (
    <View style={styles.stat}>
      <View style={[styles.statPill, { backgroundColor: bg }]}>
        <Text style={styles.statValue}>{valor}</Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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

  statsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  stat: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#E7E2F3", paddingVertical: 10, paddingHorizontal: 6, alignItems: "center" },
  statPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginBottom: 4 },
  statValue: { fontSize: 17, fontWeight: "800", color: "#1F1640" },
  statLabel: { fontSize: 11, color: "#3D3655", textAlign: "center" },

  chipsRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  chip: { paddingHorizontal: 18, paddingVertical: 11, borderRadius: 22, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#C9CBDA" },
  chipActive: { backgroundColor: "#DCD6F7", borderColor: "#DCD6F7" },
  chipText: { fontSize: 14.5, color: "#5B5A6B", fontWeight: "600" },
  chipTextActive: { color: "#4B2FA0", fontWeight: "800" },

  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 19, fontWeight: "800", color: "#1E1B33" },
  sectionLink: { fontSize: 13.5, fontWeight: "700", color: ROXO },

  errorBox: { backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA", borderRadius: 12, padding: 12, marginBottom: 14 },
  errorText: { color: "#B91C1C", fontSize: 12.5, fontWeight: "600" },

  card: { backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1, borderColor: "#ECE7F8", marginBottom: 12, overflow: "hidden", shadowColor: "#2A1458", shadowOpacity: 0.06, shadowRadius: 9, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  cardBar: { width: 5, position: "absolute", top: 0, bottom: 0, left: 0 },
  cardBody: { flexDirection: "row", alignItems: "center", padding: 15, paddingLeft: 17, gap: 12 },
  badge: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  badgeText: { fontSize: 19, fontWeight: "800" },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#111018" },
  cardSub: { fontSize: 12.5, color: "#3D3655", marginTop: 3 },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: "#EAE7F1", marginTop: 9, overflow: "hidden" },
  progressFill: { height: 4, borderRadius: 2 },
  grade: { fontSize: 22, fontWeight: "800", marginLeft: 6 },
  empty: { textAlign: "center", color: "#8A8799", marginTop: 24 },

  lastBox: { backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1, borderColor: "#ECE7F8", padding: 15, marginTop: 8 },
  lastLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 1, color: "#8A8799" },
  lastValue: { fontSize: 16, fontWeight: "800", color: "#1E1B33", marginTop: 7 },
  lastDate: { fontSize: 12.5, color: "#6B6680", marginTop: 3 },
});
