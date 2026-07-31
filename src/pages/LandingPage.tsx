import { Link } from 'react-router-dom';
import {
  GraduationCap, Clock, BarChart3, ShieldCheck, Users, FileText, Award,
  CheckCircle2, ArrowRight, BookOpen, Zap, HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function LandingPage() {
  const { session } = useAuth();

  const features = [
    { icon: FileText, title: 'Exam Management', desc: 'Create, schedule, and publish timed exams with custom instructions and passing marks.' },
    { icon: HelpCircle, title: 'Question Bank', desc: 'Build rich multiple-choice question banks with difficulty levels and explanations.' },
    { icon: Zap, title: 'Auto Evaluation', desc: 'Instant scoring with percentage, grade, and pass/fail status the moment a student submits.' },
    { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Real-time insights: pass rates, score trends, top performers, and participation metrics.' },
    { icon: ShieldCheck, title: 'Secure Access', desc: 'Role-based authentication keeps admin tools locked away from student accounts.' },
    { icon: Clock, title: 'Live Timer', desc: 'Countdown timer with auto-submit ensures exams end exactly when they should.' },
  ];

  const stats = [
    { value: '5', label: 'Demo Exams' },
    { value: '44', label: 'Questions' },
    { value: '6', label: 'Users' },
    { value: '100%', label: 'Auto-Scored' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Nav */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">SmartExam <span className="text-primary-600 dark:text-primary-400">Pro</span></span>
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <Link to="/dashboard" className="btn-primary text-sm">Go to Dashboard <ArrowRight className="w-4 h-4" /></Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50 via-white to-white dark:from-primary-950/30 dark:via-slate-950 dark:to-slate-950" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-accent-200/30 dark:bg-accent-800/10 rounded-full blur-3xl" />
        <div className="absolute top-40 left-10 w-96 h-96 bg-primary-200/20 dark:bg-primary-800/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
              <Award className="w-4 h-4" />
              AI-Ready Examination Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              The modern way to run
              <span className="block bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">online examinations</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              SmartExam Pro digitizes the entire exam lifecycle — from question banks and timed tests to instant scoring and real-time analytics. Built for institutions that value accuracy and speed.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/register" className="btn-primary text-base px-6 py-3 w-full sm:w-auto">
                Start for Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/login" className="btn-secondary text-base px-6 py-3 w-full sm:w-auto">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white">{s.value}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Everything you need to assess</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">A complete toolkit for administrators and students, wrapped in a clean, responsive interface.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 p-10 lg:p-16 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white">Ready to digitize your exams?</h2>
            <p className="mt-3 text-primary-100 max-w-xl mx-auto">Join SmartExam Pro and transform how your institution creates, delivers, and evaluates examinations.</p>
            <Link to="/register" className="mt-6 inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-lg hover:bg-primary-50 transition shadow-lg">
              Create your account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary-600" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">SmartExam Pro</span>
          </div>
          <p className="text-sm text-slate-400">Built for modern educational institutions.</p>
        </div>
      </footer>
    </div>
  );
}
