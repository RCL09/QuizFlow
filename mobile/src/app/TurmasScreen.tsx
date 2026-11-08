import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

type Turma = {
  id: string;
  nome: string;
  professor: string;
  alunos: number;
  cor: string;
  corClara: string;
};

// Dados de exemplo — troque pela resposta da sua API quando ela existir.
const TURMAS_INICIAIS: Turma[] = [
  { id: "1", nome: "Matemática — 2º A", professor: "Prof. Carlos Menezes", alunos: 21, cor: "#7C5CD6", corClara: "#EDE7FB" },
  { id: "2", nome: "Português — 2º A", professor: "Profa. Renata Lopes", alunos: 21, cor: "#2BA3A6", corClara: "#DDF4F4" },
  { id: "3", nome: "Biologia — 2º A", professor: "Profa. Camila Andrade", alunos: 21, cor: "#4CA867", corClara: "#E0F3E5" },
  { id: "4", nome: "História — 2º A", professor: "Prof. Rafael Nogueira", alunos: 21, cor: "#D9962B", corClara: "#FCEFD8" },
];

const CORES = [
  { cor: "#3B82F6", corClara: "#DBEAFE" },
  { cor: "#C2410C", corClara: "#FFEDD5" },
  { cor: "#6D28D9", corClara: "#EDE9FE" },
];

type Props = {
  userName?: string;
  authToken?: string | null;
  onLogout?: () => void;
};

export default function TurmasScreen({ userName = "Ana", authToken, onLogout }: Props) {
  const [turmas, setTurmas] = useState<Turma[]>(TURMAS_INICIAIS);
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  const turmasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return turmas;
    return turmas.filter(
      (t) => t.nome.toLowerCase().includes(termo) || t.professor.toLowerCase().includes(termo)
    );
  }, [busca, turmas]);

  function abrirModal() {
    setCodigo("");
    setErro("");
    setModalAberto(true);
  }

  async function entrarNaTurma() {
    const valor = codigo.trim().toUpperCase();
    if (valor.length < 4) {
      setErro("Digite um código válido (ex.: QF-MAT2A).");
      return;
    }

    setEnviando(true);
    setErro("");
    try {
      // Endpoint sugerido: ajuste para a rota real do seu backend.
      const response = await fetch(`${API_BASE_URL}/api/turmas/entrar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ codigo: valor }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "Código inválido ou turma não encontrada.");

      const paleta = CORES[turmas.length % CORES.length];
      const nova: Turma = {
        id: String(data?.turma?.id ?? Date.now()),
        nome: data?.turma?.nome ?? `Turma ${valor}`,
        professor: data?.turma?.professor ?? "Professor",
        alunos: data?.turma?.alunos ?? 1,
        ...paleta,
      };
      setTurmas((atual) => [...atual, nova]);
      setModalAberto(false);
      setAviso(`Você entrou em ${nova.nome}!`);
      setTimeout(() => setAviso(""), 3000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErro(
        msg.includes("Network request failed") || msg.includes("Failed to fetch")
          ? "Não foi possível conectar ao servidor."
          : msg
      );
    } finally {
      setEnviando(false);
    }
  }

  const inicial = userName.trim().charAt(0).toUpperCase() || "A";

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F5FD" />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
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
          <Stat valor={String(turmas.length)} label="Turmas" bg="#EDE7FB" />
          <Stat valor="12" label="Atividades pendentes" bg="#D7F2F1" flex={1.6} />
          <Stat valor="92%" label="Média geral" bg="#FCEBC8" />
        </View>

        {/* Botão código da turma */}
        <Pressable
          onPress={abrirModal}
          style={({ pressed }) => [styles.joinButton, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.joinPlus}>+</Text>
          <Text style={styles.joinText}>Entrar com código da turma</Text>
        </Pressable>

        {/* Busca */}
        <View style={styles.search}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={busca}
            onChangeText={setBusca}
            placeholder="Buscar turma..."
            placeholderTextColor="#9A9AA8"
            style={styles.searchInput}
          />
        </View>

        {!!aviso && (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{aviso}</Text>
          </View>
        )}

        {/* Lista de turmas */}
        {turmasFiltradas.map((t) => (
          <Pressable
            key={t.id}
            style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.99 }] }]}
          >
            <View style={[styles.cardBar, { backgroundColor: t.cor }]} />
            <View style={styles.cardBody}>
              <View style={[styles.badge, { backgroundColor: t.corClara }]}>
                <Text style={[styles.badgeText, { color: t.cor }]}>{t.nome.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle} numberOfLines={1}>{t.nome}</Text>
                <Text style={styles.cardSub} numberOfLines={1}>
                  {t.professor} • {t.alunos} alunos
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
          </Pressable>
        ))}

        {turmasFiltradas.length === 0 && (
          <Text style={styles.empty}>Nenhuma turma encontrada.</Text>
        )}
      </ScrollView>

      {/* Modal código */}
      <Modal visible={modalAberto} transparent animationType="fade" onRequestClose={() => setModalAberto(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.overlay}
        >
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Entrar em uma turma</Text>
            <Text style={styles.modalSub}>
              Peça o código ao seu professor e digite abaixo.
            </Text>

            <TextInput
              value={codigo}
              onChangeText={(v) => setCodigo(v.toUpperCase())}
              placeholder="Ex.: QF-MAT2A"
              placeholderTextColor="#A6A3B8"
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={12}
              style={[styles.codeInput, !!erro && { borderColor: "#F87171" }]}
              onSubmitEditing={entrarNaTurma}
            />
            {!!erro && <Text style={styles.errorText}>{erro}</Text>}

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setModalAberto(false)} disabled={enviando}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.confirmButton} onPress={entrarNaTurma} disabled={enviando}>
                {enviando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.confirmText}>Entrar</Text>}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function Stat({ valor, label, bg, flex = 1 }: { valor: string; label: string; bg: string; flex?: number }) {
  return (
    <View style={[styles.stat, { flex }]}>
      <View style={[styles.statPill, { backgroundColor: bg }]}>
        <Text style={styles.statValue}>{valor}</Text>
      </View>
      <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const ROXO = "#6E4FC9";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F5FD" },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  brand: { fontSize: 28, fontWeight: "800", color: "#7B57D1", letterSpacing: -0.5 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#E4DBFA", alignItems: "center", justifyContent: "center" },
  avatarText: { color: ROXO, fontSize: 18, fontWeight: "800" },

  hello: { fontSize: 28, fontWeight: "800", color: "#2A1458", marginBottom: 16 },

  statsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  stat: { backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#E7E2F3", paddingVertical: 10, paddingHorizontal: 6, alignItems: "center" },
  statPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginBottom: 4 },
  statValue: { fontSize: 17, fontWeight: "800", color: "#1F1640" },
  statLabel: { fontSize: 11, color: "#3D3655" },

  joinButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: ROXO, borderRadius: 14, minHeight: 50, marginBottom: 12, shadowColor: ROXO, shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  joinPlus: { color: "#FFFFFF", fontSize: 22, fontWeight: "700", marginTop: -2 },
  joinText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },

  search: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#CFCBDA", borderRadius: 12, paddingHorizontal: 12, minHeight: 46, marginBottom: 14 },
  searchIcon: { fontSize: 20, color: "#8A8799", marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: "#1F1640", paddingVertical: 8 },

  toast: { backgroundColor: "#E0F3E5", borderRadius: 10, padding: 10, marginBottom: 12 },
  toastText: { color: "#25703F", fontWeight: "700", fontSize: 13 },

  card: { backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#E7E2F3", marginBottom: 12, overflow: "hidden", shadowColor: "#2A1458", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  cardBar: { height: 5 },
  cardBody: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  badge: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  badgeText: { fontSize: 20, fontWeight: "800" },
  cardTitle: { fontSize: 17, fontWeight: "800", color: "#111018" },
  cardSub: { fontSize: 12.5, color: "#3D3655", marginTop: 3 },
  chevron: { fontSize: 26, color: "#2A2438", marginLeft: 4 },
  empty: { textAlign: "center", color: "#8A8799", marginTop: 20 },

  overlay: { flex: 1, backgroundColor: "rgba(30, 20, 60, 0.45)", justifyContent: "center", padding: 24 },
  modal: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 22 },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#2A1458" },
  modalSub: { fontSize: 13, color: "#6B6680", marginTop: 6, marginBottom: 16 },
  codeInput: { borderWidth: 1.5, borderColor: "#D9D2EE", borderRadius: 12, minHeight: 52, paddingHorizontal: 14, fontSize: 18, fontWeight: "700", letterSpacing: 2, color: "#1F1640", textAlign: "center" },
  errorText: { color: "#B91C1C", fontSize: 12, marginTop: 8 },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 18 },
  cancelButton: { flex: 1, minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: "#D9D2EE", alignItems: "center", justifyContent: "center" },
  cancelText: { color: "#4B4560", fontWeight: "700", fontSize: 14 },
  confirmButton: { flex: 1, minHeight: 48, borderRadius: 12, backgroundColor: ROXO, alignItems: "center", justifyContent: "center" },
  confirmText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
});
