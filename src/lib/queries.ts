import { supabase } from '@/lib/supabase';
import type { Exam, Question, Result, Profile, AnswerEntry, Grade } from '@/types';
import { computeGrade } from '@/types';

export async function fetchPublishedExams(): Promise<Exam[]> {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Exam[];
}

export async function fetchAllExams(): Promise<Exam[]> {
  const { data, error } = await supabase.from('exams').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Exam[];
}

export async function fetchExam(id: string): Promise<Exam | null> {
  const { data, error } = await supabase.from('exams').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Exam | null;
}

export async function fetchQuestionsForExam(examId: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('exam_id', examId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as Question[];
}

export async function fetchQuestionCount(examId: string): Promise<number> {
  const { count, error } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('exam_id', examId);
  if (error) throw error;
  return count ?? 0;
}

export async function fetchStudentResults(studentId: string): Promise<Result[]> {
  const { data, error } = await supabase
    .from('results')
    .select('*')
    .eq('student_id', studentId)
    .order('submitted_at', { ascending: false });
  if (error) throw error;
  return data as Result[];
}

export async function fetchAllResults(): Promise<Result[]> {
  const { data, error } = await supabase.from('results').select('*').order('submitted_at', { ascending: false });
  if (error) throw error;
  return data as Result[];
}

export async function fetchResult(studentId: string, examId: string): Promise<Result | null> {
  const { data, error } = await supabase
    .from('results')
    .select('*')
    .eq('student_id', studentId)
    .eq('exam_id', examId)
    .maybeSingle();
  if (error) throw error;
  return data as Result | null;
}

export async function fetchAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Profile[];
}

export async function fetchStudentProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase.from('profiles').select('*').eq('role', 'student').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Profile[];
}

export interface ScoreResult {
  answers: AnswerEntry[];
  obtained: number;
  total: number;
  percentage: number;
  grade: Grade;
  status: 'pass' | 'fail';
}

export function calculateScore(
  questions: Question[],
  selected: Record<string, string | null>,
  passingMarks: number
): ScoreResult {
  const answers: AnswerEntry[] = questions.map((q) => ({
    questionId: q.id,
    selected: (selected[q.id] ?? null) as AnswerEntry['selected'],
    correct: q.correct_option,
    marks: q.marks,
  }));
  const obtained = answers.reduce((sum, a) => sum + (a.selected === a.correct ? a.marks : 0), 0);
  const total = questions.reduce((sum, q) => sum + q.marks, 0);
  const percentage = total > 0 ? Math.round((obtained / total) * 10000) / 100 : 0;
  const grade = computeGrade(percentage);
  const status: 'pass' | 'fail' = obtained >= passingMarks ? 'pass' : 'fail';
  return { answers, obtained, total, percentage, grade, status };
}

export async function submitExamResult(
  studentId: string,
  examId: string,
  score: ScoreResult
): Promise<Result> {
  const payload = {
    student_id: studentId,
    exam_id: examId,
    answers: score.answers,
    obtained_marks: score.obtained,
    total_marks: score.total,
    percentage: score.percentage,
    grade: score.grade,
    status: score.status,
  };
  const { data, error } = await supabase
    .from('results')
    .upsert(payload, { onConflict: 'student_id,exam_id' })
    .select()
    .single();
  if (error) throw error;
  return data as Result;
}

// re-export for convenience
export { computeGrade };
