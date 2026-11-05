import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
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

type AuthTab = "login" | "register";
type Role = "aluno" | "professor";

// No navegador do computador, localhost funciona. Para Expo Go no celular,
// configure EXPO_PUBLIC_API_URL com o IPv4 do computador na mesma rede Wi-Fi.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export default function IndexScreen() {
  const [authTab, setAuthTab] = useState<AuthTab>("login");
  const [role, setRole] = useState<Role>("aluno");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [schoolName, setSchoolName] = useState("Colégio Múltiplo");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);

  function changeTab(tab: AuthTab) {
    setAuthTab(tab);
    setMessage("");
  }

  function fillDemo() {
    setEmail(role === "aluno" ? "aluno@quizflow.com" : "professor@quizflow.com");
    setPassword("123456");
    setMessage("Dados preenchidos. Para entrar, essa conta precisa estar cadastrada no banco de dados.");
    setMessageIsError(false);
  }

  async function handleSubmit() {
    setMessage("");
    setMessageIsError(false);

    if (authTab === "register" && !name.trim()) {
      setMessage("Informe seu nome para continuar.");
      setMessageIsError(true);
      return;
    }
    if (!email.trim() || !password) {
      setMessage("Preencha o e-mail e a senha.");
      setMessageIsError(true);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMessage("Digite um endereço de e-mail válido.");
      setMessageIsError(true);
      return;
    }
    if (password.length < 6) {
      setMessage("A senha deve ter pelo menos 6 caracteres.");
      setMessageIsError(true);
      return;
    }
    if (authTab === "register" && password !== confirmPassword) {
      setMessage("As senhas não coincidem.");
      setMessageIsError(true);
      return;
    }
    if (authTab === "register" && !agreeTerms) {
      setMessage("Aceite os termos para criar sua conta.");
      setMessageIsError(true);
      return;
    }
    if (authTab === "register" && role === "professor" && !schoolName.trim()) {
      setMessage("Informe a instituição de ensino.");
      setMessageIsError(true);
      return;
    }

    setLoading(true);
    try {
      const endpoint = authTab === "register" ? "/api/auth/register" : "/api/auth/login";
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        schoolName: role === "professor" ? schoolName.trim() : null,
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Não foi possível concluir a operação.");
      }

      if (authTab === "register") {
        setMessage(data.message || "Cadastro realizado com sucesso! Agora entre com seu e-mail e senha.");
        setAuthTab("login");
        setPassword("");
        setConfirmPassword("");
        setAgreeTerms(false);
      } else {
        if (data.token) setAuthToken(data.token);
        setMessage(`Login realizado com sucesso! Bem-vindo(a), ${data.user?.name || name || "ao QuizFlow"}.`);
        setMessageIsError(false);
      }
    } catch (error) {
      const messageText = error instanceof Error ? error.message : "Não foi possível conectar ao servidor.";
      if (messageText.includes("Network request failed") || messageText.includes("Failed to fetch")) {
        setMessage(`Não foi possível conectar à API em ${API_BASE_URL}. Confira se o backend está iniciado e se o endereço da API está correto.`);
      } else {
        setMessage(messageText);
      }
      setMessageIsError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F8FF" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.page}>
            <View style={styles.brandRow}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>Q</Text>
              </View>
              <Text style={styles.brandName}>Quiz<Text style={styles.brandAccent}>Flow</Text></Text>
            </View>

            <View style={styles.hero}>
              <View style={styles.eyebrow}>
                <View style={styles.eyebrowDot} />
                <Text style={styles.eyebrowText}>APRENDER PODE SER DIVERTIDO</Text>
              </View>
              <Text style={styles.heroTitle}>
                Seu próximo{`\n`}desafio começa <Text style={styles.heroHighlight}>aqui.</Text>
              </Text>
              <Text style={styles.heroSubtitle}>
                Entre na sua conta e continue sua jornada de aprendizado com quizzes e desafios.
              </Text>
              <View style={styles.decorRow}>
                <View style={[styles.decorShape, styles.decorBlue]}>
                  <Text style={styles.decorEmoji}>✦</Text>
                </View>
                <View style={[styles.decorShape, styles.decorGreen]}>
                  <Text style={styles.decorEmoji}>✓</Text>
                </View>
                <View style={[styles.decorShape, styles.decorYellow]}>
                  <Text style={styles.decorEmoji}>?</Text>
                </View>
                <Text style={styles.decorCaption}>Aprenda. Jogue. Evolua.</Text>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeading}>
                <Text style={styles.cardTitle}>
                  {authTab === "login" ? "Boas-vindas de volta!" : "Crie sua conta"}
                </Text>
                <Text style={styles.cardSubtitle}>
                  {authTab === "login"
                    ? "Preencha seus dados para acessar."
                    : "É rápido e fácil começar a aprender."}
                </Text>
              </View>

              <View style={styles.tabs}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => changeTab("login")}
                  style={[styles.tab, authTab === "login" && styles.activeTab]}
                >
                  <Text style={[styles.tabText, authTab === "login" && styles.activeTabText]}>
                    Entrar
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => changeTab("register")}
                  style={[styles.tab, authTab === "register" && styles.activeTab]}
                >
                  <Text style={[styles.tabText, authTab === "register" && styles.activeTabText]}>
                    Cadastrar
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.fieldLabel}>QUERO ACESSAR COMO</Text>
              <View style={styles.roleRow}>
                <Pressable
                  onPress={() => setRole("aluno")}
                  style={[styles.roleButton, role === "aluno" && styles.roleButtonActive]}
                >
                  <Text style={styles.roleIcon}>🎓</Text>
                  <View style={styles.roleCopy}>
                    <Text style={[styles.roleTitle, role === "aluno" && styles.roleTitleActive]}>Aluno</Text>
                    <Text style={styles.roleDescription}>Responder quizzes</Text>
                  </View>
                  <View style={[styles.radio, role === "aluno" && styles.radioActive]}>
                    {role === "aluno" && <View style={styles.radioInner} />}
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => setRole("professor")}
                  style={[styles.roleButton, role === "professor" && styles.roleButtonActive]}
                >
                  <Text style={styles.roleIcon}>📚</Text>
                  <View style={styles.roleCopy}>
                    <Text style={[styles.roleTitle, role === "professor" && styles.roleTitleActive]}>Professor</Text>
                    <Text style={styles.roleDescription}>Criar atividades</Text>
                  </View>
                  <View style={[styles.radio, role === "professor" && styles.radioActive]}>
                    {role === "professor" && <View style={styles.radioInner} />}
                  </View>
                </Pressable>
              </View>

              {authTab === "register" && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>NOME COMPLETO</Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Como podemos chamar você?"
                    placeholderTextColor="#9AA6B8"
                    style={styles.input}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
              )}

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>E-MAIL</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="voce@exemplo.com"
                  placeholderTextColor="#9AA6B8"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="emailAddress"
                  returnKeyType="next"
                />
              </View>

              {authTab === "register" && role === "professor" && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>ESCOLA / INSTITUIÇÃO</Text>
                  <TextInput
                    value={schoolName}
                    onChangeText={setSchoolName}
                    placeholder="Nome da instituição de ensino"
                    placeholderTextColor="#9AA6B8"
                    style={styles.input}
                    autoCapitalize="words"
                  />
                </View>
              )}

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>SENHA</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Digite sua senha"
                    placeholderTextColor="#9AA6B8"
                    style={styles.passwordInput}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    textContentType={authTab === "login" ? "password" : "newPassword"}
                    returnKeyType={authTab === "register" ? "next" : "done"}
                  />
                  <Pressable onPress={() => setShowPassword((current) => !current)} hitSlop={8}>
                    <Text style={styles.showPassword}>{showPassword ? "Ocultar" : "Mostrar"}</Text>
                  </Pressable>
                </View>
              </View>

              {authTab === "register" && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>CONFIRMAR SENHA</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Digite a senha novamente"
                      placeholderTextColor="#9AA6B8"
                      style={styles.passwordInput}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      textContentType="newPassword"
                      returnKeyType="done"
                    />
                    <Pressable onPress={() => setShowConfirmPassword((current) => !current)} hitSlop={8}>
                      <Text style={styles.showPassword}>{showConfirmPassword ? "Ocultar" : "Mostrar"}</Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {authTab === "login" ? (
                <View style={styles.optionsRow}>
                  <Pressable onPress={() => setRememberMe((current) => !current)} style={styles.rememberRow}>
                    <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                      {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.rememberText}>Lembrar de mim</Text>
                  </Pressable>
                  <Pressable onPress={() => {
                    setMessage("A recuperação de senha será disponibilizada após a integração com o backend.");
                    setMessageIsError(false);
                  }}>
                    <Text style={styles.linkText}>Esqueci a senha</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable onPress={() => setAgreeTerms((current) => !current)} style={styles.rememberRow}>
                  <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
                    {agreeTerms && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.termsText}>Li e aceito os termos de uso e a política de privacidade.</Text>
                </Pressable>
              )}

              {!!message && (
                <View style={[styles.messageBox, messageIsError ? styles.errorBox : styles.successBox]}>
                  <Text style={[styles.messageText, messageIsError ? styles.errorText : styles.successText]}>
                    {message}
                  </Text>
                </View>
              )}

              {!!authToken && authTab === "login" && (
                <Text style={styles.sessionHint}>Sessão autenticada pelo backend.</Text>
              )}

              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && styles.submitPressed,
                  loading && styles.submitDisabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitText}>
                    {authTab === "login" ? "Entrar na plataforma  →" : "Criar minha conta  →"}
                  </Text>
                )}
              </Pressable>

              {authTab === "login" && (
                <Pressable onPress={fillDemo} style={styles.demoButton}>
                  <Text style={styles.demoButtonText}>Preencher dados de demonstração</Text>
                </Pressable>
              )}

              <View style={styles.footerRow}>
                <Text style={styles.footerText}>
                  {authTab === "login" ? "Ainda não tem uma conta? " : "Já tem uma conta? "}
                </Text>
                <Pressable onPress={() => changeTab(authTab === "login" ? "register" : "login")}>
                  <Text style={styles.footerLink}>
                    {authTab === "login" ? "Cadastre-se" : "Faça login"}
                  </Text>
                </Pressable>
              </View>
            </View>

            <Text style={styles.bottomNote}>QUIZFLOW  •  APRENDIZADO EM MOVIMENTO</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F8FF" },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  page: { width: "100%", maxWidth: 560, alignSelf: "center", paddingHorizontal: 22, paddingTop: 18, paddingBottom: 28 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 28 },
  logo: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center", shadowColor: "#2563EB", shadowOpacity: 0.22, shadowRadius: 9, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  logoText: { color: "#FFFFFF", fontSize: 25, fontWeight: "900" },
  brandName: { color: "#172B4D", fontSize: 24, fontWeight: "800", letterSpacing: -0.8 },
  brandAccent: { color: "#2563EB" },
  hero: { marginBottom: 22 },
  eyebrow: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 },
  eyebrowDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#22C55E" },
  eyebrowText: { color: "#4B6587", fontSize: 10, fontWeight: "800", letterSpacing: 1.3 },
  heroTitle: { color: "#172B4D", fontSize: 34, lineHeight: 40, fontWeight: "800", letterSpacing: -1.2 },
  heroHighlight: { color: "#2563EB" },
  heroSubtitle: { color: "#64748B", fontSize: 14, lineHeight: 21, marginTop: 10, maxWidth: 430 },
  decorRow: { flexDirection: "row", alignItems: "center", marginTop: 17, gap: 8 },
  decorShape: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  decorBlue: { backgroundColor: "#DBEAFE" },
  decorGreen: { backgroundColor: "#DCFCE7" },
  decorYellow: { backgroundColor: "#FEF3C7" },
  decorEmoji: { fontSize: 16, fontWeight: "800", color: "#1D4ED8" },
  decorCaption: { marginLeft: 3, fontSize: 12, color: "#718096", fontWeight: "600" },
  card: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 22, borderWidth: 1, borderColor: "#E4EBF5", shadowColor: "#17365D", shadowOpacity: 0.07, shadowRadius: 22, shadowOffset: { width: 0, height: 9 }, elevation: 3 },
  cardHeading: { marginBottom: 20 },
  cardTitle: { color: "#172B4D", fontSize: 23, fontWeight: "800", letterSpacing: -0.5 },
  cardSubtitle: { color: "#7A8799", fontSize: 13, marginTop: 6, lineHeight: 19 },
  tabs: { flexDirection: "row", padding: 4, backgroundColor: "#F1F5FB", borderRadius: 13, marginBottom: 22 },
  tab: { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  activeTab: { backgroundColor: "#FFFFFF", shadowColor: "#1E293B", shadowOpacity: 0.08, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  tabText: { color: "#7A8799", fontSize: 14, fontWeight: "700" },
  activeTabText: { color: "#2563EB" },
  fieldLabel: { color: "#52647D", fontSize: 10, fontWeight: "800", letterSpacing: 1, marginBottom: 9 },
  roleRow: { gap: 10, marginBottom: 20 },
  roleButton: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 14, padding: 12, backgroundColor: "#FFFFFF" },
  roleButtonActive: { borderColor: "#7AA7FF", backgroundColor: "#F5F8FF" },
  roleIcon: { fontSize: 22, marginRight: 11 },
  roleCopy: { flex: 1 },
  roleTitle: { color: "#334155", fontSize: 13, fontWeight: "800" },
  roleTitleActive: { color: "#1D4ED8" },
  roleDescription: { color: "#8995A6", fontSize: 11, marginTop: 3 },
  radio: { width: 19, height: 19, borderRadius: 10, borderWidth: 1.5, borderColor: "#CBD5E1", alignItems: "center", justifyContent: "center" },
  radioActive: { borderColor: "#2563EB" },
  radioInner: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#2563EB" },
  fieldGroup: { marginBottom: 16 },
  input: { minHeight: 49, borderWidth: 1, borderColor: "#DDE5F0", borderRadius: 12, paddingHorizontal: 14, color: "#1E293B", fontSize: 14, backgroundColor: "#FFFFFF" },
  passwordContainer: { minHeight: 49, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#DDE5F0", borderRadius: 12, paddingHorizontal: 14, backgroundColor: "#FFFFFF" },
  passwordInput: { flex: 1, minHeight: 47, color: "#1E293B", fontSize: 14, paddingVertical: 8 },
  showPassword: { color: "#2563EB", fontSize: 12, fontWeight: "700", marginLeft: 8 },
  optionsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginTop: 1, marginBottom: 20 },
  rememberRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  checkbox: { width: 17, height: 17, borderRadius: 5, borderWidth: 1.4, borderColor: "#C6D2E2", alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  checkboxActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  checkmark: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" },
  rememberText: { color: "#64748B", fontSize: 12 },
  linkText: { color: "#2563EB", fontSize: 12, fontWeight: "700" },
  termsText: { flex: 1, color: "#64748B", fontSize: 12, lineHeight: 18 },
  messageBox: { borderRadius: 10, padding: 11, marginBottom: 14 },
  errorBox: { backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA" },
  successBox: { backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: "#BFDBFE" },
  messageText: { fontSize: 12, lineHeight: 18 },
  sessionHint: { color: "#15803D", fontSize: 11, fontWeight: "700", marginBottom: 10 },
  errorText: { color: "#B91C1C" },
  successText: { color: "#1D4ED8" },
  submitButton: { minHeight: 51, borderRadius: 13, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center", paddingHorizontal: 16, shadowColor: "#2563EB", shadowOpacity: 0.22, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  submitPressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  submitDisabled: { opacity: 0.65 },
  submitText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  demoButton: { alignItems: "center", paddingVertical: 13, marginTop: 4 },
  demoButtonText: { color: "#64748B", fontSize: 12, fontWeight: "700", textDecorationLine: "underline" },
  footerRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", marginTop: 14 },
  footerText: { color: "#7A8799", fontSize: 12 },
  footerLink: { color: "#2563EB", fontSize: 12, fontWeight: "800" },
  bottomNote: { textAlign: "center", marginTop: 22, color: "#9AA8BA", fontSize: 9, fontWeight: "800", letterSpacing: 1.4 },
});
