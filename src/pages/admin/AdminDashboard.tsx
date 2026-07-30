import { useEffect, useState } from 'react';
import { Users, FileText, HelpCircle, ClipboardList, TrendingUp, Award, Activity } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { SkeletonCard } from '@/components/Loading';
import {
  fetchAllExams, fetchAllResults, fetchStudentProfiles, fetchAllProfiles,
} from '@/lib/queries';
import type { Exam, Result, Profile } from '@/types';
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts';

export function AdminDashboard() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAllExams(), fetchAllResults(), fetchStudentProfiles(), fetchAllProfiles()])
      .then(([e, r, s, p]) => {
        setExams(e);
        setResults(r);
        setStudents(s);
        setAllProfiles(p);
      })
      .finally(() => setLoading(false));
  }, []);

  const publishedExams = exams.filter((e) => e.status === 'published');
  const passCount = results.filter((r) => r.status === 'pass').length;
  const failCount = results.length - passCount;
  const avgScore = results.length > 0
    ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length * 10) / 10
    : 0;
  const activeStudents = students.filter((s) => s.status).length;

  const pieData = [
    { name: 'Pass', value: passCount, color: '#22c55e' },
    { name: 'Fail', value: failCount, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  // Exam score distribution
  const barData = publishedExams.map((exam) => {
    const examResults = results.filter((r) => r.exam_id === exam.id);
    const avg = examResults.length > 0
      ? Math.round(examResults.reduce((s, r) => s + r.percentage, 0) / examResults.length * 10) / 10
      : 0;
    return { name: exam.title.length > 15 ? exam.title.slice(0, 15) + '…' : exam.title, avgScore: avg };
  });

  // Recent activity
  const recentResults = [...results]
    .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of your examination platform.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Students" value={students.length} hint={`${activeStudents} active`} color="primary" />
          <StatCard icon={FileText} label="Total Exams" value={exams.length} hint={`${publishedExams.length} published`} color="accent" />
          <StatCard icon={ClipboardList} label="Exam Attempts" value={results.length} color="warning" />
          <StatCard icon={TrendingUp} label="Average Score" value={`${avgScore}%`} color={avgScore >= 50 ? 'success' : 'error'} />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pass/Fail pie */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Pass vs Fail</h3>
          <p className="text-sm text-slate-400 mb-4">Distribution across all attempts</p>
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
            <div className="h-[260px] flex items-center justify-center text-slate-400 text-sm">No results yet.</div>
          )}
        </div>

        {/* Exam averages bar */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Average Score by Exam</h3>
          <p className="text-sm text-slate-400 mb-4">Performance across published exams</p>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(148 163 184 / 0.2)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="rgb(148 163 184 / 0.6)" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="rgb(148 163 184 / 0.6)" />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgb(226 232 240)', fontSize: 12 }} />
                <Bar dataKey="avgScore" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-slate-400 text-sm">No published exams yet.</div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-slate-400" /> Recent Activity</h3>
        {recentResults.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">No recent activity.</p>
        ) : (
          <div className="space-y-2">
            {recentResults.map((r) => {
              const student = allProfiles.find((p) => p.id === r.student_id);
              const exam = exams.find((e) => e.id === r.exam_id);
              return (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                      {student?.full_name?.charAt(0) ?? '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{student?.full_name ?? 'Unknown'}</p>
                      <p className="text-xs text-slate-400">completed {exam?.title ?? 'an exam'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{r.percentage}%</span>
                    <span className={`badge ${r.status === 'pass' ? 'bg-success-100 dark:bg-success-700/30 text-success-700 dark:text-success-300' : 'bg-error-100 dark:bg-error-700/30 text-error-700 dark:text-error-300'}`}>{r.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
