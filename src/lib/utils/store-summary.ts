import { Transaction, DailySummary, ChartDataPoint } from '@/types';
export function localDate(date = new Date()): string {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}
export const INITIAL_BALANCE = 0;
export function dailySummary(transactions: Transaction[], date: string): DailySummary {
  let openingBalance = INITIAL_BALANCE, totalIncome = 0, totalExpense = 0;
  for (const t of transactions) {
    if (t.date < date) openingBalance += t.type === 'pemasukan' ? t.amount : -t.amount;
    if (t.date === date) {
      if (t.type === 'pemasukan') totalIncome += t.amount;
      else totalExpense += t.amount;
    }
  }
  return { openingBalance, totalIncome, totalExpense, closingBalance: openingBalance + totalIncome - totalExpense };
}
export function monthlyChart(transactions: Transaction[], date: string): ChartDataPoint[] {
  const days = new Map<string, ChartDataPoint>();
  for (const t of transactions) {
    if (!t.date.startsWith(date.slice(0, 7))) continue;
    const point = days.get(t.date) || { date: t.date, pemasukan: 0, pengeluaran: 0 };
    point[t.type] += t.amount;
    days.set(t.date, point);
  }
  return Array.from(days.values()).sort((a, b) => a.date.localeCompare(b.date));
}

