import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateFinancialHealth } from '@/lib/recommendations';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const now = new Date();
    const month = parseInt(searchParams.get('month') || String(now.getMonth() + 1), 10);
    const year = parseInt(searchParams.get('year') || String(now.getFullYear()), 10);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    const daysInMonth = endDate.getDate();

    // 1. Fetch Transactions for the selected month
    const transactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
        account: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // 2. Fetch All Accounts for liquid balances
    const accounts = await prisma.account.findMany();
    const totalLiquidSavings = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    // 3. Compute Aggregates
    let totalIncome = 0;
    let totalExpense = 0;
    let husbandExpense = 0;
    let wifeExpense = 0;
    let jointExpense = 0;
    let husbandIncome = 0;
    let wifeIncome = 0;
    let jointIncome = 0;

    let needsAmount = 0;
    let wantsAmount = 0;
    let savingsAmount = 0;

    const categoryMap: Record<
      string,
      { id: string; name: string; color: string; icon: string; budgetRule: string; amount: number; count: number }
    > = {};

    // Grouping by day for the chart
    const dailyMap: Record<number, { income: number; expense: number }> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      dailyMap[d] = { income: 0, expense: 0 };
    }

    transactions.forEach((tx) => {
      const day = new Date(tx.date).getDate();

      if (tx.type === 'INCOME') {
        totalIncome += tx.amount;
        if (tx.performedBy === 'HUSBAND') husbandIncome += tx.amount;
        else if (tx.performedBy === 'WIFE') wifeIncome += tx.amount;
        else jointIncome += tx.amount;

        if (dailyMap[day]) dailyMap[day].income += tx.amount;
      } else if (tx.type === 'EXPENSE') {
        totalExpense += tx.amount;
        if (tx.performedBy === 'HUSBAND') husbandExpense += tx.amount;
        else if (tx.performedBy === 'WIFE') wifeExpense += tx.amount;
        else jointExpense += tx.amount;

        if (dailyMap[day]) dailyMap[day].expense += tx.amount;

        // Categorize into 50/30/20
        const rule = tx.category?.budgetRule || 'OTHER';
        if (rule === 'NEEDS') needsAmount += tx.amount;
        else if (rule === 'WANTS') wantsAmount += tx.amount;
        else if (rule === 'SAVINGS') savingsAmount += tx.amount;

        // Category breakdown
        const catId = tx.category?.id || 'uncategorized';
        const catName = tx.category?.name || 'Tanpa Kategori';
        const catColor = tx.category?.color || '#9CA3AF';
        const catIcon = tx.category?.icon || 'Tag';

        if (!categoryMap[catId]) {
          categoryMap[catId] = {
            id: catId,
            name: catName,
            color: catColor,
            icon: catIcon,
            budgetRule: rule,
            amount: 0,
            count: 0,
          };
        }
        categoryMap[catId].amount += tx.amount;
        categoryMap[catId].count += 1;
      }
    });

    const netCashFlow = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (netCashFlow / totalIncome) * 100 : 0;

    // Sort category breakdown descending
    const categoryBreakdown = Object.values(categoryMap)
      .map((cat) => ({
        ...cat,
        percentage: totalExpense > 0 ? (cat.amount / totalExpense) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const topExpenseCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : undefined;

    // Daily trend array
    const dailyTrend = Object.keys(dailyMap).map((dStr) => {
      const d = parseInt(dStr, 10);
      return {
        day: d,
        date: `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        label: `${d}`,
        income: dailyMap[d].income,
        expense: dailyMap[d].expense,
      };
    });

    // 4. Monthly Trend (last 6 months)
    const monthlyComparison = [];
    for (let i = 5; i >= 0; i--) {
      const mDate = new Date(year, month - 1 - i, 1);
      const mYear = mDate.getFullYear();
      const mMonth = mDate.getMonth() + 1;
      const mStart = new Date(mYear, mMonth - 1, 1);
      const mEnd = new Date(mYear, mMonth, 0, 23, 59, 59, 999);

      const mTx = await prisma.transaction.findMany({
        where: {
          date: { gte: mStart, lte: mEnd },
        },
        select: { type: true, amount: true },
      });

      let mInc = 0;
      let mExp = 0;
      mTx.forEach((t) => {
        if (t.type === 'INCOME') mInc += t.amount;
        else if (t.type === 'EXPENSE') mExp += t.amount;
      });

      const monthName = mDate.toLocaleDateString('id-ID', { month: 'short' });
      monthlyComparison.push({
        month: mMonth,
        year: mYear,
        label: `${monthName} ${mYear}`,
        income: mInc,
        expense: mExp,
        net: mInc - mExp,
      });
    }

    // 5. Budgets for this month
    const budgets = await prisma.budget.findMany({
      where: { month, year },
      include: { category: true },
    });

    const budgetStatus = budgets.map((b) => {
      const spent = categoryMap[b.categoryId]?.amount || 0;
      const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0;
      return {
        id: b.id,
        categoryId: b.categoryId,
        categoryName: b.category.name,
        categoryColor: b.category.color,
        categoryIcon: b.category.icon,
        budgetRule: b.category.budgetRule,
        budgetAmount: b.amount,
        spentAmount: spent,
        remainingAmount: b.amount - spent,
        percentageUsed: pct,
        isOverBudget: spent > b.amount,
      };
    });

    // 6. Calculate Financial Health & Recommendations
    const currentDay = now.getMonth() + 1 === month && now.getFullYear() === year ? now.getDate() : daysInMonth;
    const health = generateFinancialHealth({
      totalIncome,
      totalExpense,
      needsAmount,
      wantsAmount,
      savingsAmount,
      totalLiquidSavings,
      topExpenseCategory,
      husbandExpense,
      wifeExpense,
      dayOfMonth: currentDay,
      daysInMonth,
    });

    // 7. Recent Transactions (last 10)
    const recentTransactions = transactions.slice(0, 10);

    return NextResponse.json({
      success: true,
      data: {
        period: {
          month,
          year,
          startDate,
          endDate,
          daysInMonth,
        },
        summary: {
          totalIncome,
          totalExpense,
          netCashFlow,
          savingsRate,
          needsAmount,
          wantsAmount,
          savingsAmount,
          totalLiquidSavings,
        },
        attribution: {
          husbandExpense,
          wifeExpense,
          jointExpense,
          husbandIncome,
          wifeIncome,
          jointIncome,
          husbandExpensePct: totalExpense > 0 ? (husbandExpense / totalExpense) * 100 : 0,
          wifeExpensePct: totalExpense > 0 ? (wifeExpense / totalExpense) * 100 : 0,
          jointExpensePct: totalExpense > 0 ? (jointExpense / totalExpense) * 100 : 0,
        },
        rule50_30_20: {
          needs: {
            amount: needsAmount,
            pct: totalIncome > 0 ? (needsAmount / totalIncome) * 100 : 0,
            targetPct: 50,
          },
          wants: {
            amount: wantsAmount,
            pct: totalIncome > 0 ? (wantsAmount / totalIncome) * 100 : 0,
            targetPct: 30,
          },
          savings: {
            amount: savingsAmount,
            pct: totalIncome > 0 ? (savingsAmount / totalIncome) * 100 : 0,
            targetPct: 20,
          },
        },
        categoryBreakdown,
        dailyTrend,
        monthlyComparison,
        budgetStatus,
        health,
        recentTransactions,
        accounts,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data dashboard' },
      { status: 500 }
    );
  }
}
