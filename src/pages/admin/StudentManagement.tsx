import { useEffect, useState } from 'react';
import { Users, UserPlus, Trash2, Mail, Shield } from 'lucide-react';
import { fetchStudentProfiles } from '@/lib/queries';
import type { Profile } from '@/types';
import { DataTable } from '@/components/DataTable';
import { SkeletonRow } from '@/components/Loading';
import { ConfirmDialog } from '@/components/Modal';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';

export function StudentManagement() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchStudentProfiles();
      setStudents(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    // Delete profile row; auth user remains but is inaccessible without profile
    const { error } = await supabase.from('profiles').delete().eq('id', deleteTarget.id);
    if (error) {
      toast('Failed to delete student', 'error');
      return;
    }
    toast('Student removed', 'success');
    setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id));
  }

  const columns = [
    {
      key: 'full_name',
      label: 'Student',
      render: (s: Profile) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {s.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{s.full_name}</p>
            <p className="text-xs text-slate-400">{s.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'email', label: 'Email', render: (s: Profile) => <span className="text-slate-500 hidden md:table-cell">{s.email}</span> },
    {
      key: 'phone',
      label: 'Phone',
      render: (s: Profile) => <span className="text-slate-500">{s.phone ?? '—'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (s: Profile) => (
        <span className={`badge ${s.status ? 'bg-success-100 dark:bg-success-700/30 text-success-700 dark:text-success-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
          {s.status ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (s: Profile) => <span className="text-slate-500 text-xs">{new Date(s.created_at).toLocaleDateString()}</span>,
    },
    {
      key: 'actions',
      label: '',
      render: (s: Profile) => (
        <button
          onClick={() => setDeleteTarget(s)}
          className="p-2 rounded-lg text-slate-400 hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-700/20 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Management</h1>
          <p className="text-sm text-slate-500 mt-1">View and manage student accounts.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Users className="w-4 h-4" />
          {students.length} students
        </div>
      </div>

      {loading ? (
        <div className="card p-6 divide-y divide-slate-100 dark:divide-slate-800">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : students.length === 0 ? (
        <div className="card p-12 text-center">
          <UserPlus className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">No students registered yet.</p>
          <p className="text-xs text-slate-400 mt-1">Students appear here after they register.</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={students}
          searchKeys={['full_name', 'email', 'phone']}
          pageSize={8}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove student?"
        message={`This will remove ${deleteTarget?.full_name} and all their results. This cannot be undone.`}
        confirmText="Remove"
        danger
      />
    </div>
  );
}
