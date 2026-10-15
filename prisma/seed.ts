import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data for Family Finance App...');

  // 1. Users: Suami & Istri
  await prisma.user.upsert({
    where: { id: 'user-husband' },
    update: {},
    create: {
      id: 'user-husband',
      name: 'Suami',
      role: 'HUSBAND',
      avatar: '👨',
    },
  });

  await prisma.user.upsert({
    where: { id: 'user-wife' },
    update: {},
    create: {
      id: 'user-wife',
      name: 'Istri',
      role: 'WIFE',
      avatar: '👩',
    },
  });

  // 2. Accounts (Dompet & Rekening)
  const accountsData = [
    {
      id: 'acc-bca-joint',
      name: 'BCA Utama (Rekening Bersama)',
      type: 'BANK',
      owner: 'JOINT',
      balance: 14500000,
      accountNumber: '8830192811',
      color: '#2563EB',
      icon: 'Building2',
      isDefault: true,
    },
    {
      id: 'acc-mandiri-tabungan',
      name: 'Mandiri Tabungan & Investasi',
      type: 'BANK',
      owner: 'JOINT',
      balance: 32000000,
      accountNumber: '137001928472',
      color: '#D97706',
      icon: 'Landmark',
      isDefault: false,
    },
    {
      id: 'acc-cash-husband',
      name: 'Dompet Tunai Suami',
      type: 'CASH',
      owner: 'HUSBAND',
      balance: 450000,
      color: '#059669',
      icon: 'Wallet',
      isDefault: false,
    },
    {
      id: 'acc-cash-wife',
      name: 'Dompet Tunai Istri',
      type: 'CASH',
      owner: 'WIFE',
      balance: 600000,
      color: '#DB2777',
      icon: 'Wallet',
      isDefault: false,
    },
    {
      id: 'acc-gopay-husband',
      name: 'GoPay Suami',
      type: 'EWALLET',
      owner: 'HUSBAND',
      balance: 285000,
      color: '#0284C7',
      icon: 'Smartphone',
      isDefault: false,
    },
    {
      id: 'acc-shopeepay-wife',
      name: 'ShopeePay Istri',
      type: 'EWALLET',
      owner: 'WIFE',
      balance: 410000,
      color: '#EA580C',
      icon: 'ShoppingBag',
      isDefault: false,
    },
  ];

  for (const acc of accountsData) {
    await prisma.account.upsert({
      where: { id: acc.id },
      update: {},
      create: acc,
    });
  }

  // 3. Categories (Indonesian household expenses & incomes)
  const categoriesData = [
    // EXPENSE - NEEDS (50%)
    { id: 'cat-groceries', name: 'Belanja Pasar & Supermarket', type: 'EXPENSE', budgetRule: 'NEEDS', icon: 'ShoppingCart', color: '#10B981', isDefault: true },
    { id: 'cat-housing', name: 'Sewa / Cicilan Rumah & IPL', type: 'EXPENSE', budgetRule: 'NEEDS', icon: 'Home', color: '#3B82F6', isDefault: true },
    { id: 'cat-utilities', name: 'Listrik, Air & WiFi Internet', type: 'EXPENSE', budgetRule: 'NEEDS', icon: 'Zap', color: '#F59E0B', isDefault: true },
    { id: 'cat-transport', name: 'Bensin, Tol, Servis & Transport', type: 'EXPENSE', budgetRule: 'NEEDS', icon: 'Car', color: '#6366F1', isDefault: true },
    { id: 'cat-kids', name: 'Kebutuhan Anak & Sekolah', type: 'EXPENSE', budgetRule: 'NEEDS', icon: 'Baby', color: '#EC4899', isDefault: true },
    { id: 'cat-health', name: 'Kesehatan, Obat & Asuransi', type: 'EXPENSE', budgetRule: 'NEEDS', icon: 'HeartPulse', color: '#EF4444', isDefault: true },

    // EXPENSE - WANTS (30%)
    { id: 'cat-dining', name: 'Makan di Luar, Kopi & Cafe', type: 'EXPENSE', budgetRule: 'WANTS', icon: 'Utensils', color: '#F97316', isDefault: true },
    { id: 'cat-shopping', name: 'Belanja Online, Pakaian & Hobi', type: 'EXPENSE', budgetRule: 'WANTS', icon: 'Tag', color: '#8B5CF6', isDefault: true },
    { id: 'cat-entertainment', name: 'Hiburan, Liburan & Rekreasi', type: 'EXPENSE', budgetRule: 'WANTS', icon: 'Film', color: '#06B6D4', isDefault: true },
    { id: 'cat-personal', name: 'Perawatan Diri / Skincare / Salon', type: 'EXPENSE', budgetRule: 'WANTS', icon: 'Sparkles', color: '#D946EF', isDefault: true },

    // EXPENSE - SAVINGS & DEBT (20%)
    { id: 'cat-emergency', name: 'Tabungan Dana Darurat', type: 'EXPENSE', budgetRule: 'SAVINGS', icon: 'ShieldCheck', color: '#14B8A6', isDefault: true },
    { id: 'cat-investment', name: 'Investasi (Reksadana, Emas, Saham)', type: 'EXPENSE', budgetRule: 'SAVINGS', icon: 'TrendingUp', color: '#059669', isDefault: true },

    // INCOME
    { id: 'cat-inc-salary-husband', name: 'Gaji Bulanan Suami', type: 'INCOME', budgetRule: 'OTHER', icon: 'Briefcase', color: '#2563EB', isDefault: true },
    { id: 'cat-inc-salary-wife', name: 'Gaji / Penghasilan Istri', type: 'INCOME', budgetRule: 'OTHER', icon: 'Briefcase', color: '#DB2777', isDefault: true },
    { id: 'cat-inc-freelance', name: 'Bonus & Side Job / Freelance', type: 'INCOME', budgetRule: 'OTHER', icon: 'Coins', color: '#10B981', isDefault: true },
    { id: 'cat-inc-dividend', name: 'Hasil Investasi & Usaha', type: 'INCOME', budgetRule: 'OTHER', icon: 'PieChart', color: '#F59E0B', isDefault: true },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: cat,
    });
  }

  // 4. Sample Budgets for Current Month
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const monthlyBudgets = [
    { categoryId: 'cat-groceries', amount: 3500000 },
    { categoryId: 'cat-housing', amount: 4000000 },
    { categoryId: 'cat-utilities', amount: 1200000 },
    { categoryId: 'cat-transport', amount: 1500000 },
    { categoryId: 'cat-kids', amount: 1000000 },
    { categoryId: 'cat-health', amount: 800000 },
    { categoryId: 'cat-dining', amount: 2000000 },
    { categoryId: 'cat-shopping', amount: 1500000 },
    { categoryId: 'cat-entertainment', amount: 1000000 },
    { categoryId: 'cat-emergency', amount: 2000000 },
    { categoryId: 'cat-investment', amount: 3000000 },
  ];

  for (const b of monthlyBudgets) {
    await prisma.budget.upsert({
      where: {
        categoryId_month_year: {
          categoryId: b.categoryId,
          month: currentMonth,
          year: currentYear,
        },
      },
      update: {},
      create: {
        month: currentMonth,
        year: currentYear,
        categoryId: b.categoryId,
        amount: b.amount,
      },
    });
  }

  // 5. Sample Transactions for Current Month (Real-world examples)
  const sampleTransactions = [
    // Incomes
    {
      date: new Date(currentYear, currentMonth - 1, 1),
      type: 'INCOME',
      amount: 15000000,
      title: 'Gaji Bulanan Suami',
      performedBy: 'HUSBAND',
      categoryId: 'cat-inc-salary-husband',
      accountId: 'acc-bca-joint',
    },
    {
      date: new Date(currentYear, currentMonth - 1, 1),
      type: 'INCOME',
      amount: 8500000,
      title: 'Gaji / Hasil Bisnis Istri',
      performedBy: 'WIFE',
      categoryId: 'cat-inc-salary-wife',
      accountId: 'acc-bca-joint',
    },
    {
      date: new Date(currentYear, currentMonth - 1, 8),
      type: 'INCOME',
      amount: 1500000,
      title: 'Bonus Project Freelance',
      performedBy: 'HUSBAND',
      categoryId: 'cat-inc-freelance',
      accountId: 'acc-mandiri-tabungan',
    },

    // Expenses - Joint / Needs
    {
      date: new Date(currentYear, currentMonth - 1, 2),
      type: 'EXPENSE',
      amount: 3800000,
      title: 'Cicilan Rumah & Kas Lingkungan',
      performedBy: 'JOINT',
      categoryId: 'cat-housing',
      accountId: 'acc-bca-joint',
    },
    {
      date: new Date(currentYear, currentMonth - 1, 3),
      type: 'EXPENSE',
      amount: 850000,
      title: 'Token Listrik PLN & Tagihan Air PDAM',
      performedBy: 'WIFE',
      categoryId: 'cat-utilities',
      accountId: 'acc-bca-joint',
    },
    {
      date: new Date(currentYear, currentMonth - 1, 3),
      type: 'EXPENSE',
      amount: 385000,
      title: 'WiFi IndiHome Bulanan',
      performedBy: 'HUSBAND',
      categoryId: 'cat-utilities',
      accountId: 'acc-bca-joint',
    },
    {
      date: new Date(currentYear, currentMonth - 1, 4),
      type: 'EXPENSE',
      amount: 1250000,
      title: 'Belanja Bulanan Sayur & Sembako di Superindo',
      performedBy: 'WIFE',
      categoryId: 'cat-groceries',
      accountId: 'acc-bca-joint',
    },
    {
      date: new Date(currentYear, currentMonth - 1, 6),
      type: 'EXPENSE',
      amount: 350000,
      title: 'Isi Bensin Pertamax & Topup Tol Flazz',
      performedBy: 'HUSBAND',
      categoryId: 'cat-transport',
      accountId: 'acc-bca-joint',
    },
    {
      date: new Date(currentYear, currentMonth - 1, 7),
      type: 'EXPENSE',
      amount: 620000,
      title: 'Belanja Mingguan Pasar Tradisional',
      performedBy: 'WIFE',
      categoryId: 'cat-groceries',
      accountId: 'acc-cash-wife',
    },
    {
      date: new Date(currentYear, currentMonth - 1, 9),
      type: 'EXPENSE',
      amount: 450000,
      title: 'Susu Formula & Popok Anak',
      performedBy: 'WIFE',
      categoryId: 'cat-kids',
      accountId: 'acc-shopeepay-wife',
    },
    {
      date: new Date(currentYear, currentMonth - 1, 10),
      type: 'EXPENSE',
      amount: 320000,
      title: 'Vitamin & Obat Flu Keluarga di Apotek',
      performedBy: 'JOINT',
      categoryId: 'cat-health',
      accountId: 'acc-bca-joint',
    },

    // Expenses - Wants
    {
      date: new Date(currentYear, currentMonth - 1, 5),
      type: 'EXPENSE',
      amount: 275000,
      title: 'Makan Malam Weekend bersama Istri',
      performedBy: 'HUSBAND',
      categoryId: 'cat-dining',
      accountId: 'acc-bca-joint',
    },
    {
      date: new Date(currentYear, currentMonth - 1, 8),
      type: 'EXPENSE',
      amount: 85000,
      title: 'Kopi Kenangan bareng Rekan Kerja',
      performedBy: 'HUSBAND',
      categoryId: 'cat-dining',
      accountId: 'acc-gopay-husband',
    },
    {
      date: new Date(currentYear, currentMonth - 1, 10),
      type: 'EXPENSE',
      amount: 340000,
      title: 'Beli Baju & Keperluan Pribadi Istri di Shopee',
      performedBy: 'WIFE',
      categoryId: 'cat-shopping',
      accountId: 'acc-shopeepay-wife',
    },
    {
      date: new Date(currentYear, currentMonth - 1, 11),
      type: 'EXPENSE',
      amount: 190000,
      title: 'Tiket Bioskop XXI & Popcorn',
      performedBy: 'JOINT',
      categoryId: 'cat-entertainment',
      accountId: 'acc-bca-joint',
    },

    // Savings & Investment
    {
      date: new Date(currentYear, currentMonth - 1, 2),
      type: 'EXPENSE',
      amount: 2000000,
      title: 'Alokasi Tabungan Dana Darurat',
      performedBy: 'JOINT',
      categoryId: 'cat-emergency',
      accountId: 'acc-bca-joint',
    },
    {
      date: new Date(currentYear, currentMonth - 1, 2),
      type: 'EXPENSE',
      amount: 2500000,
      title: 'Investasi Reksadana & Emas (Bibit)',
      performedBy: 'JOINT',
      categoryId: 'cat-investment',
      accountId: 'acc-bca-joint',
    },
  ];

  for (const tx of sampleTransactions) {
    await prisma.transaction.create({
      data: tx,
    });
  }

  // 6. Financial Goals
  await prisma.financialGoal.create({
    data: {
      title: 'Dana Darurat Keluarga (Target 6 Bulan Pengeluaran)',
      targetAmount: 60000000,
      currentAmount: 32000000,
      owner: 'JOINT',
      notes: 'Disimpan di Reksadana Pasar Uang & Deposito Mandiri',
    },
  });

  await prisma.financialGoal.create({
    data: {
      title: 'Liburan Akhir Tahun ke Bali',
      targetAmount: 12000000,
      currentAmount: 7500000,
      owner: 'JOINT',
      deadline: new Date(currentYear, 11, 25),
      notes: 'Tiket pesawat dan hotel',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
