import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, Clock, TrendingUp, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StatCard } from '@/components/StatCard';
import { SkeletonCard } from '@/components/Loading';
import { fetchPublishedExams, fetchStudentResults } from '@/lib/queries';
import type { Exam, Result } from '@/types';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

export function StudentDashboard() {
  const { profile } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    Promise.all([fetchPublishedExams(), fetchStudentResults(profile.id)])
      .then(([e, r]) => {
        setExams(e);
        setResults(r);
      })
      .finally(() => setLoading(false));
  }, [profile]);

  if (!profile) return null;

  const completedExamIds = new Set(results.map((r) => r.exam_id));
  const pendingExams = exams.filter((e) => !completedExamIds.has(e.id));
  const avgScore = results.length > 0
    ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length * 10) / 10
    : 0;
  const highest = results.length > 0 ? Math.max(...results.map((r) => r.percentage)) : 0;
  const passCount = results.filter((r) => r.status === 'pass').length;
  const passRate = results.length > 0 ? Math.round((passCount / results.length) * 100) : 0;

  const chartData = [...results]
    .sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime())
    .map((r) => ({
      name: new Date(r.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: r.percentage,
    }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Track your exams, results, and performance.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={BookOpen} label="Available Exams" value={pendingExams.length} color="primary" />
          <StatCard icon={Award} label="Completed Exams" value={results.length} color="success" />
          <StatCard icon={TrendingUp} label="Average Score" value={`${avgScore}%`} color="accent" />
          <StatCard icon={CheckCircle2} label="Pass Rate" value={`${passRate}%`} color={passRate >= 50 ? 'success' : 'warning'} />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Performance chart */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Performance Trend</h3>
          <p className="text-sm text-slate-400 mb-4">Your score percentage over time</p>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(148 163 184 / 0.2)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="rgb(148 163 184 / 0.6)" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="rgb(148 163 184 / 0.6)" />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgb(226 232 240)', fontSize: 12 }} />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-slate-400 text-sm">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No results yet. Take an exam to see your trend.
              </div>
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">At a glance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500">Highest score</span>
              <span className="font-bold text-success-600 dark:text-success-500">{highest}%</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500">Exams passed</span>
              <span className="font-bold text-slate-900 dark:text-white">{passCount}/{results.length}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500">Pending exams</span>
              <span className="font-bold text-primary-600 dark:text-primary-400">{pendingExams.length}</span>
            </div>
            <Link to="/exams" className="btn-primary w-full mt-2">
              View available exams <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent results */}
      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Recent Results</h3>
        {results.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">You haven't taken any exams yet.</p>
        ) : (
          <div className="space-y-2">
            {results.slice(0, 5).map((r) => {
              const exam = exams.find((e) => e.id === r.exam_id);
              return (
                <Link
                  key={r.id}
                  to={`/results/${r.exam_id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${r.status === 'pass' ? 'bg-success-100 dark:bg-success-700/30 text-success-600 dark:text-success-400' : 'bg-error-100 dark:bg-error-700/30 text-error-600 dark:text-error-400'}`}>
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white text-sm">{exam?.title ?? 'Exam'}</p>
                      <p className="text-xs text-slate-400">{new Date(r.submitted_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white">{r.percentage}%</p>
                    <p className={`text-xs font-medium ${r.status === 'pass' ? 'text-success-600' : 'text-error-600'}`}>{r.grade}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
