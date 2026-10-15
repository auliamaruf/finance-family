export interface Recommendation {
  id: string;
  type: 'positive' | 'neutral' | 'attention';
  title: string;
  description: string;
  metric?: string;
  action?: string;
}

export interface FinancialHealthResult {
  score: number; // 0 - 100
  status: string;
  badgeVariant: 'healthy' | 'moderate' | 'warning' | 'critical';
  summary: string;
  recommendations: Recommendation[];
}

export function generateFinancialHealth({
  totalIncome,
  totalExpense,
  needsAmount,
  wantsAmount,
  savingsAmount,
  totalLiquidSavings,
  topExpenseCategory,
  husbandExpense,
  wifeExpense,
  dayOfMonth,
  daysInMonth,
}: {
  totalIncome: number;
  totalExpense: number;
  needsAmount: number;
  wantsAmount: number;
  savingsAmount: number;
  totalLiquidSavings: number;
  topExpenseCategory?: { name: string; amount: number; percentage: number };
  husbandExpense: number;
  wifeExpense: number;
  dayOfMonth: number;
  daysInMonth: number;
}): FinancialHealthResult {
  const recommendations: Recommendation[] = [];
  let score = 75;

  const netCashFlow = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netCashFlow / totalIncome) * 100 : 0;

  // 1. Arus Kas & Saving Rate
  if (totalIncome === 0 && totalExpense > 0) {
    score -= 30;
    recommendations.push({
      id: 'no-income',
      type: 'attention',
      title: 'Pemasukan bulan ini belum dicatat',
      description: 'Catat penerimaan gaji atau pendapatan usaha agar kalkulasi rasio tabungan dan arus kas menjadi akurat.',
    });
  } else if (netCashFlow < 0) {
    score -= 35;
    recommendations.push({
      id: 'deficit-cashflow',
      type: 'attention',
      title: 'Pengeluaran melampaui pemasukan',
      description: `Arus kas saat ini mengalami defisit sebesar Rp ${Math.abs(netCashFlow).toLocaleString('id-ID')}. Batasi pengeluaran non-esensial hingga akhir bulan.`,
      metric: `-Rp ${Math.abs(netCashFlow).toLocaleString('id-ID')}`,
    });
  } else if (savingsRate >= 20) {
    score += 15;
    recommendations.push({
      id: 'healthy-savings',
      type: 'positive',
      title: 'Rasio tabungan berada di batas ideal',
      description: `Keluarga berhasil menyisihkan ${savingsRate.toFixed(1)}% dari pemasukan ke kas atau tabungan (target rekomendasi minimal 20%).`,
      metric: `${savingsRate.toFixed(1)}% Saving Rate`,
    });
  } else if (savingsRate >= 10) {
    recommendations.push({
      id: 'moderate-savings',
      type: 'neutral',
      title: 'Rasio tabungan cukup stabil',
      description: `Rasio tabungan saat ini ${savingsRate.toFixed(1)}%. Sisihkan porsi tambahan dari pos gaya hidup untuk memperkuat cadangan kas.`,
      metric: `${savingsRate.toFixed(1)}%`,
    });
  } else {
    score -= 15;
    recommendations.push({
      id: 'low-savings',
      type: 'attention',
      title: 'Margin tabungan di bawah 10%',
      description: `Sisa dana yang tersimpan hanya ${savingsRate.toFixed(1)}% dari pemasukan. Pertimbangkan penyesuaian pos belanja fleksibel.`,
      metric: `${savingsRate.toFixed(1)}%`,
    });
  }

  // 2. Evaluasi 50/30/20
  if (totalIncome > 0) {
    const needsPct = (needsAmount / totalIncome) * 100;
    const wantsPct = (wantsAmount / totalIncome) * 100;

    if (wantsPct > 35) {
      score -= 10;
      recommendations.push({
        id: 'high-wants',
        type: 'attention',
        title: 'Pos gaya hidup melampaui 35%',
        description: `Pengeluaran keinginan (makan luar, belanja non-pokok, hiburan) mencapai ${wantsPct.toFixed(1)}% dari pemasukan. Alokasi ideal adalah 30%.`,
        metric: `${wantsPct.toFixed(1)}% (Target: 30%)`,
      });
    }

    if (needsPct <= 55 && needsPct > 0) {
      recommendations.push({
        id: 'controlled-needs',
        type: 'positive',
        title: 'Beban kebutuhan pokok terkendali',
        description: `Pos primer (sembako, tagihan, cicilan) menyerap ${needsPct.toFixed(1)}% dari pendapatan bulanan, berada dalam rentang wajar.`,
      });
    }
  }

  // 3. Proyeksi Akhir Bulan
  if (dayOfMonth > 5 && totalExpense > 0 && totalIncome > 0) {
    const dailyAverage = totalExpense / dayOfMonth;
    const projectedExpense = dailyAverage * daysInMonth;
    if (projectedExpense > totalIncome) {
      score -= 10;
      recommendations.push({
        id: 'projected-overspend',
        type: 'attention',
        title: 'Proyeksi pengeluaran mendekati batas atas',
        description: `Rata-rata belanja harian adalah Rp ${Math.round(dailyAverage).toLocaleString('id-ID')}. Jika tren ini berlanjut, estimasi total pengeluaran mencapai Rp ${Math.round(projectedExpense).toLocaleString('id-ID')}.`,
        metric: `Proyeksi: Rp ${Math.round(projectedExpense).toLocaleString('id-ID')}`,
      });
    }
  }

  // 4. Cadangan Likuid / Dana Darurat
  if (totalExpense > 0) {
    const emergencyCoverageMonths = totalLiquidSavings / totalExpense;
    if (emergencyCoverageMonths >= 3) {
      recommendations.push({
        id: 'good-emergency-fund',
        type: 'positive',
        title: 'Cadangan kas likuid memadai',
        description: `Saldo likuid di rekening dan dompet saat ini setara dengan estimasi ${emergencyCoverageMonths.toFixed(1)} bulan pengeluaran rutin.`,
        metric: `${emergencyCoverageMonths.toFixed(1)} Bulan`,
      });
    } else if (emergencyCoverageMonths < 1) {
      recommendations.push({
        id: 'low-emergency-fund',
        type: 'attention',
        title: 'Cadangan kas di bawah 1 bulan pengeluaran',
        description: 'Prioritaskan pengalokasian dana ke rekening tabungan hingga mencapai batas aman minimal 3 bulan biaya hidup.',
      });
    }
  }

  const finalScore = Math.max(10, Math.min(100, score));

  let badgeVariant: 'healthy' | 'moderate' | 'warning' | 'critical' = 'healthy';
  let status = 'Kondisi Finansial Stabil';
  let summary = 'Arus kas dan struktur pengeluaran keluarga berada dalam batas aman dan terencana.';

  if (finalScore >= 80) {
    badgeVariant = 'healthy';
    status = 'Arus Kas Sangat Sehat';
    summary = 'Keluarga mempertahankan rasio tabungan yang kuat dan struktur pengeluaran yang terukur rapi.';
  } else if (finalScore >= 65) {
    badgeVariant = 'moderate';
    status = 'Keuangan Terkendali';
    summary = 'Pos pengeluaran utama stabil. Ruang tabungan masih dapat dioptimalkan dengan menjaga pos gaya hidup.';
  } else if (finalScore >= 50) {
    badgeVariant = 'warning';
    status = 'Perlu Penyesuaian Anggaran';
    summary = 'Pengeluaran mendekati kapasitas pemasukan bulanan. Disarankan menahan belanja diskresioner.';
  } else {
    badgeVariant = 'critical';
    status = 'Arus Kas Defisit';
    summary = 'Pengeluaran saat ini melampaui pendapatan. Segera tinjau kembali pos pengeluaran sekunder.';
  }

  return {
    score: finalScore,
    status,
    badgeVariant,
    summary,
    recommendations,
  };
}
