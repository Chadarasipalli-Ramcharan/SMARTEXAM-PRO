import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, Phone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export function RegisterPage() {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validate(): string | null {
    if (fullName.trim().length < 3 || fullName.trim().length > 50) return 'Full name must be 3–50 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password))
      return 'Password must be at least 8 chars with upper, lower, number, and special character.';
    if (password !== confirm) return 'Passwords do not match.';
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName.trim(), 'student');
    setLoading(false);
    if (error) {
      setError(error);
      toast('Registration failed', 'error');
      return;
    }
    toast('Account created! Welcome to SmartExam Pro.', 'success');
    navigate('/dashboard');
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent-600 via-accent-700 to-primary-700 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />
        <div className="relative flex flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-2.5 w-fit">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="font-bold text-lg">SmartExam Pro</span>
          </Link>
          <div>
            <h1 className="text-4xl font-extrabold leading-tight">Join thousands of students taking exams online.</h1>
            <p className="mt-4 text-accent-100 text-lg max-w-md">Create your student account to access timed exams, instant results, and performance analytics.</p>
          </div>
          <p className="text-sm text-accent-100">Already have an account? <Link to="/login" className="font-semibold underline">Sign in</Link></p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">SmartExam Pro</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create your account</h2>
          <p className="mt-2 text-sm text-slate-500">Register as a student to start taking exams.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-error-50 dark:bg-error-700/20 border border-error-200 dark:border-error-800 px-4 py-3 text-sm text-error-700 dark:text-error-300">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div>
              <label className="label">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="label">Phone <span className="text-slate-400 font-normal">(optional)</span></label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input pl-10 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-slate-400">Min 8 chars with upper, lower, number, and special character.</p>
            </div>
            <div>
              <label className="label">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showPassword ? 'text' : 'password'} required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" className="input pl-10" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3">
              {loading ? 'Creating account…' : <>Create account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
