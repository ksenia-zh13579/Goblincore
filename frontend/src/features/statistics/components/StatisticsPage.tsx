import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
} from 'chart.js';
import { transactionsApi, Transaction } from '../../transactions/api/transactionsApi';
import { useAuth } from '../../../app/providers/AuthProvider';
import { Input } from '../../../shared/ui/Input';
import { Breadcrumbs } from '../../navigation/components/Breadcrumbs';

ChartJS.register(ArcElement, Tooltip, Legend);

export function StatisticsPage() {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [income, setIncome] = useState<Transaction[]>([]);
  const [expense, setExpense] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user) return;
    const params = { start_date: startDate || undefined, end_date: endDate || undefined };
    transactionsApi.list('income', user.user_id, params).then((r) => setIncome(r.data));
    transactionsApi.list('expense', user.user_id, params).then((r) => setExpense(r.data));
  }, [user, startDate, endDate]);

  const sum = (arr: Transaction[]) => arr.reduce((s, t) => s + Number(t.amount), 0);
  const totalIncome = sum(income);
  const totalExpense = sum(expense);
  const balance = totalIncome - totalExpense;

  const groupByCategory = (arr: Transaction[]) =>
    arr.reduce<Record<string, number>>((acc, t) => {
      acc[t.category_name] = (acc[t.category_name] || 0) + Number(t.amount);
      return acc;
    }, {});

  const makeChart = (data: Transaction[], palette: string[]) => {
    const grouped = groupByCategory(data);
    return {
      labels: Object.keys(grouped),
      datasets: [{
        data: Object.values(grouped),
        backgroundColor: palette,
        borderWidth: 1,
      }],
    };
  };

  return (
    <section className="page">
      <Breadcrumbs items={[{ to: '/', label: 'Главная' }, { label: 'Статистика' }]} />
      <h1>Статистика</h1>

      <div className="toolbar">
        <Input label="С" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input label="По" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <span className="stat-card__label">Доходы за период</span>
          <span className="stat-card__value stat-card__value--income">{totalIncome.toLocaleString('ru-RU')} ₽</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Расходы за период</span>
          <span className="stat-card__value stat-card__value--expense">{totalExpense.toLocaleString('ru-RU')} ₽</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Текущий остаток</span>
          <span className={`stat-card__value ${balance >= 0 ? 'stat-card__value--income' : 'stat-card__value--expense'}`}>
            {balance.toLocaleString('ru-RU')} ₽
          </span>
        </div>
      </div>

      <div className="charts">
        <div className="chart-block">
          <h2>Доходы по категориям</h2>
          {income.length ? (
            <Doughnut data={makeChart(income, ['#7bd389', '#57b894', '#3f9c82', '#2a826e', '#1e6958'])} />
          ) : <p className="muted">Нет данных за период</p>}
        </div>
        <div className="chart-block">
          <h2>Расходы по категориям</h2>
          {expense.length ? (
            <Doughnut data={makeChart(expense, ['#e76f51', '#f4a261', '#e9c46a', '#d67b5a', '#b85c42'])} />
          ) : <p className="muted">Нет данных за период</p>}
        </div>
      </div>
    </section>
  );
}