import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Cores extraídas do layout
const COLORS = {
  bg: '#F6F7FB',
  card: '#FFFFFF',
  border: '#ECEEF5',
  primary: '#5856D6',
  primaryLight: '#EEF0FF',
  barMuted: '#C5C4F6',
  textMain: '#181A2A',
  textMuted: '#6E7191',
  green: '#10B981',
  greenBg: '#DCFCE7',
  cyan: '#2596BE',
  cyanBg: '#E0F2FE',
  amber: '#D97706',
  amberBg: '#FEF3C7',
};

const DESEMPENHO_SEMANAL = [
  { dia: 'Seg', valor: 48, destaque: false },
  { dia: 'Ter', valor: 62, destaque: false },
  { dia: 'Qua', valor: 44, destaque: false },
  { dia: 'Qui', valor: 74, destaque: false },
  { dia: 'Sex', valor: 60, destaque: false },
  { dia: 'Sáb', valor: 82, destaque: false },
  { dia: 'Dom', valor: 92, destaque: true },
];

const TURMAS_RESUMO = [
  { id: '1', nome: 'Matemática • 2º A', alunos: 32, taxa: 88, cor: COLORS.primary, bg: COLORS.primaryLight, icone: 'calculator-outline' as const },
  { id: '2', nome: 'Português • 1º B', alunos: 28, taxa: 76, cor: COLORS.cyan, bg: COLORS.cyanBg, icone: 'text-outline' as const },
  { id: '3', nome: 'Ciências • 3º A', alunos: 26, taxa: 93, cor: COLORS.green, bg: COLORS.greenBg, icone: 'flask-outline' as const },
];

const ATIVIDADES_RECENTES = [
  { id: '1', titulo: 'Desafio das frações', turma: 'Matemática • 2º A', feito: 29, total: 32, status: 'Em andamento' },
  { id: '2', titulo: 'Interpretação de texto', turma: 'Português • 1º B', feito: 28, total: 28, status: 'Concluída' },
  { id: '3', titulo: 'Sistema solar', turma: 'Ciências • 3º A', feito: 21, total: 26, status: 'Em andamento' },
];

interface Props {
  nomeProfessor?: string;
  onNovaAtividade?: () => void;
  onVerTurmas?: () => void;
  onVerAtividades?: () => void;
}

export default function ProfessorInicioScreen({
  nomeProfessor = 'professor',
  onNovaAtividade,
  onVerTurmas,
  onVerAtividades,
}: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Bom dia, {nomeProfessor}!</Text>
            <Text style={styles.subtitle}>
              Resumo do que está acontecendo nas suas turmas hoje.
            </Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>PR</Text>
          </View>
        </View>

        {/* Botão Principal */}
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={onNovaAtividade}
        >
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={styles.primaryButtonText}>Nova atividade</Text>
        </TouchableOpacity>

        {/* Grid 2x2 de KPIs */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <View style={[styles.iconBox, { backgroundColor: COLORS.primaryLight }]}>
                <Ionicons name="grid-outline" size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.kpiLabel}>Turmas ativas</Text>
            </View>
            <Text style={styles.kpiValue}>8</Text>
            <Text style={[styles.kpiTrend, { color: COLORS.primary }]}>↑ 2 neste semestre</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <View style={[styles.iconBox, { backgroundColor: COLORS.cyanBg }]}>
                <Ionicons name="people-outline" size={16} color={COLORS.cyan} />
              </View>
              <Text style={styles.kpiLabel}>Alunos</Text>
            </View>
            <Text style={styles.kpiValue}>246</Text>
            <Text style={[styles.kpiTrend, { color: COLORS.cyan }]}>↑ 12 novos alunos</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <View style={[styles.iconBox, { backgroundColor: COLORS.primaryLight }]}>
                <Ionicons name="sparkles-outline" size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.kpiLabel}>Publicadas</Text>
            </View>
            <Text style={styles.kpiValue}>32</Text>
            <Text style={[styles.kpiTrend, { color: COLORS.primary }]}>6 aguardando</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <View style={[styles.iconBox, { backgroundColor: COLORS.greenBg }]}>
                <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.green} />
              </View>
              <Text style={styles.kpiLabel}>Conclusão</Text>
            </View>
            <Text style={styles.kpiValue}>86%</Text>
            <Text style={[styles.kpiTrend, { color: COLORS.green }]}>↑ 8% este mês</Text>
          </View>
        </View>

        {/* Card: Desempenho Geral */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Desempenho geral</Text>
              <Text style={styles.sectionSubtitle}>Aproveitamento médio (7 dias)</Text>
            </View>
            <View style={styles.trendBadge}>
              <Text style={styles.trendBadgeText}>↑ 12,4%</Text>
            </View>
          </View>

          <View style={styles.chartContainer}>
            {DESEMPENHO_SEMANAL.map((item) => (
              <View key={item.dia} style={styles.barColumn}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${item.valor}%`,
                        backgroundColor: item.destaque ? COLORS.primary : COLORS.barMuted,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{item.dia}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Card: Suas Turmas */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Suas turmas</Text>
              <Text style={styles.sectionSubtitle}>Visão rápida de participação</Text>
            </View>
            <TouchableOpacity onPress={onVerTurmas}>
              <Text style={styles.linkText}>Ver todas →</Text>
            </TouchableOpacity>
          </View>

          {TURMAS_RESUMO.map((turma) => (
            <View key={turma.id} style={styles.turmaItem}>
              <View style={styles.turmaTop}>
                <View style={[styles.turmaIcon, { backgroundColor: turma.bg }]}>
                  <Ionicons name={turma.icone} size={18} color={turma.cor} />
                </View>
                <View style={styles.turmaInfo}>
                  <Text style={styles.turmaNome}>{turma.nome}</Text>
                  <Text style={styles.turmaAlunos}>{turma.alunos} alunos</Text>
                </View>
                <Text style={[styles.turmaTaxa, { color: turma.cor }]}>{turma.taxa}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${turma.taxa}%`, backgroundColor: turma.cor },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Card: Atividades Recentes (Adaptado de Tabela para Lista Mobile) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Atividades recentes</Text>
              <Text style={styles.sectionSubtitle}>Acompanhe a participação</Text>
            </View>
            <TouchableOpacity onPress={onVerAtividades}>
              <Text style={styles.linkText}>Ver todas →</Text>
            </TouchableOpacity>
          </View>

          {ATIVIDADES_RECENTES.map((atv, index) => {
            const concluida = atv.status === 'Concluída';
            return (
              <View
                key={atv.id}
                style={[
                  styles.atividadeRow,
                  index < ATIVIDADES_RECENTES.length - 1 && styles.atividadeDivider,
                ]}
              >
                <View style={styles.atividadeTop}>
                  <Text style={styles.atividadeTitulo}>{atv.titulo}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: concluida ? COLORS.primaryLight : COLORS.greenBg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: concluida ? COLORS.primary : COLORS.green },
                      ]}
                    >
                      {atv.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.atividadeBottom}>
                  <Text style={styles.atividadeMeta}>{atv.turma}</Text>
                  <Text style={styles.atividadeMeta}>
                    {atv.feito} de {atv.total} alunos
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  headerText: {
    flex: 1,
    paddingRight: 12,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
    flexShrink: 1,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  kpiTrend: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  trendBadge: {
    backgroundColor: COLORS.greenBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendBadgeText: {
    color: COLORS.green,
    fontSize: 12,
    fontWeight: '700',
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 130,
    paddingTop: 10,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 18,
    height: 100,
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
  },
  barLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 8,
  },
  turmaItem: {
    marginBottom: 14,
  },
  turmaTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  turmaIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  turmaInfo: {
    flex: 1,
  },
  turmaNome: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  turmaAlunos: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  turmaTaxa: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#EEF0F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  atividadeRow: {
    paddingVertical: 12,
  },
  atividadeDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  atividadeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  atividadeTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMain,
    flex: 1,
    paddingRight: 8,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  atividadeBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  atividadeMeta: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});