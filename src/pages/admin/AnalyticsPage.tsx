import { useEffect, useState, useMemo } from 'react';
import { TrendingUp, Award, Users, Activity } from 'lucide-react';
import { fetchAllResults, fetchAllExams, fetchAllProfiles } from '@/lib/queries';
import type { Result, Exam, Profile } from '@/types';
import { StatCard } from '@/components/StatCard';
import { SkeletonCard } from '@/components/Loading';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';

export function AnalyticsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAllResults(), fetchAllExams(), fetchAllProfiles()])
      .then(([r, e, p]) => {
        setResults(r);
        setExams(e);
        setProfiles(p);
      })
      .finally(() => setLoading(false));
  }, []);

  const passCount = results.filter((r) => r.status === 'pass').length;
  const failCount = results.length - passCount;
  const avgScore = results.length > 0
    ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length * 10) / 10
    : 0;
  const passRate = results.length > 0 ? Math.round((passCount / results.length) * 100) : 0;

  // Monthly activity
  const monthlyData = useMemo(() => {
    const months: Record<string, { name: string; attempts: number; avgScore: number[] }> = {};
    results.forEach((r) => {
      const d = new Date(r.submitted_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const name = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (!months[key]) months[key] = { name, attempts: 0, avgScore: [] };
      months[key].attempts += 1;
      months[key].avgScore.push(r.percentage);
    });
    return Object.values(months)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((m) => ({
        name: m.name,
        attempts: m.attempts,
        avgScore: m.avgScore.length > 0 ? Math.round(m.avgScore.reduce((s, v) => s + v, 0) / m.avgScore.length) : 0,
      }));
  }, [results]);

  // Top/low performers
  const studentStats = useMemo(() => {
    const map: Record<string, { profile: Profile; avg: number; count: number; pass: number }> = {};
    results.forEach((r) => {
      const p = profiles.find((x) => x.id === r.student_id);
      if (!p) return;
      if (!map[p.id]) map[p.id] = { profile: p, avg: 0, count: 0, pass: 0 };
      map[p.id].avg += r.percentage;
      map[p.id].count += 1;
      if (r.status === 'pass') map[p.id].pass += 1;
    });
    const list = Object.values(map).map((s) => ({
      ...s,
      avg: s.count > 0 ? Math.round((s.avg / s.count) * 10) / 10 : 0,
    }));
    return {
      top: [...list].sort((a, b) => b.avg - a.avg).slice(0, 5),
      low: [...list].sort((a, b) => a.avg - b.avg).slice(0, 5),
    };
  }, [results, profiles]);

  // Question accuracy (per exam)
  const examAccuracy = useMemo(() => {
    return exams.filter((e) => e.status === 'published').map((exam) => {
      const examResults = results.filter((r) => r.exam_id === exam.id);
      let totalQ = 0;
      let correctQ = 0;
      examResults.forEach((r) => {
        (r.answers ?? []).forEach((a) => {
          totalQ += 1;
          if (a.selected === a.correct) correctQ += 1;
        });
      });
      return {
        name: exam.title.length > 15 ? exam.title.slice(0, 15) + '…' : exam.title,
        accuracy: totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 0,
      };
    });
  }, [exams, results]);

  const pieData = [
    { name: 'Pass', value: passCount, color: '#22c55e' },
    { name: 'Fail', value: failCount, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Insights into exam performance and participation.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Activity} label="Total Attempts" value={results.length} color="primary" />
            <StatCard icon={TrendingUp} label="Average Score" value={`${avgScore}%`} color="accent" />
            <StatCard icon={Award} label="Pass Rate" value={`${passRate}%`} color={passRate >= 50 ? 'success' : 'warning'} />
            <StatCard icon={Users} label="Active Students" value={profiles.filter((p) => p.role === 'student').length} color="primary" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Monthly activity */}
            <div className="card p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Monthly Activity</h3>
              <p className="text-sm text-slate-400 mb-4">Attempts and average score over time</p>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(148 163 184 / 0.2)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="rgb(148 163 184 / 0.6)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="rgb(148 163 184 / 0.6)" />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgb(226 232 240)', fontSize: 12 }} />
                    <Legend />
                    <Line type="monotone" dataKey="attempts" name="Attempts" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="avgScore" name="Avg Score %" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[260px] flex items-center justify-center text-slate-400 text-sm">No data yet.</div>
              )}
            </div>

            {/* Pass vs Fail */}
            <div className="card p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Pass vs Fail</h3>
              <p className="text-sm text-slate-400 mb-4">Overall result distribution</p>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} label>
                      {pieData.map((d) => <Cell key={d.name} fill={d.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgb(226 232 240)', fontSize: 12 }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[260px] flex items-center justify-center text-slate-400 text-sm">No data yet.</div>
              )}
            </div>

            {/* Question accuracy */}
            <div className="card p-6 lg:col-span-2">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Question Accuracy by Exam</h3>
              <p className="text-sm text-slate-400 mb-4">Percentage of correct answers per exam</p>
              {examAccuracy.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={examAccuracy} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(148 163 184 / 0.2)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="rgb(148 163 184 / 0.6)" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="rgb(148 163 184 / 0.6)" />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgb(226 232 240)', fontSize: 12 }} />
                    <Bar dataKey="accuracy" name="Accuracy %" fill="#22c55e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[260px] flex items-center justify-center text-slate-400 text-sm">No data yet.</div>
              )}
            </div>
          </div>

          {/* Top & low performers */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-success-500" /> Top Performers
              </h3>
              {studentStats.top.length > 0 ? (
                <div className="space-y-2">
                  {studentStats.top.map((s, i) => (
                    <div key={s.profile.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-warning-100 dark:bg-warning-700/30 text-warning-700 dark:text-warning-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-sm">{s.profile.full_name}</p>
                          <p className="text-xs text-slate-400">{s.count} exams · {s.pass} passed</p>
                        </div>
                      </div>
                      <span className="font-bold text-success-600 dark:text-success-400">{s.avg}%</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-slate-400 text-center py-8">No data yet.</p>}
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-error-500" /> Needs Attention
              </h3>
              {studentStats.low.length > 0 ? (
                <div className="space-y-2">
                  {studentStats.low.map((s) => (
                    <div key={s.profile.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-error-100 dark:bg-error-700/30 text-error-600 dark:text-error-400 flex items-center justify-center">
                          <TrendingUp className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-sm">{s.profile.full_name}</p>
                          <p className="text-xs text-slate-400">{s.count} exams · {s.pass} passed</p>
                        </div>
                      </div>
                      <span className={`font-bold ${s.avg >= 50 ? 'text-warning-600 dark:text-warning-400' : 'text-error-600 dark:text-error-400'}`}>{s.avg}%</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-slate-400 text-center py-8">No data yet.</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
