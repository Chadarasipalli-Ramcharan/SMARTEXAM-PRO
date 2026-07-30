export type Role = 'admin' | 'student';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  phone: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export type ExamStatus = 'draft' | 'published';

export interface Exam {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
  instructions: string | null;
  start_date: string | null;
  end_date: string | null;
  created_by: string;
  status: ExamStatus;
  created_at: string;
  updated_at: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard';
export type OptionKey = 'A' | 'B' | 'C' | 'D';

export interface Question {
  id: string;
  exam_id: string;
  question: string;
  options: Record<OptionKey, string>;
  correct_option: OptionKey;
  marks: number;
  difficulty: Difficulty;
  explanation: string | null;
  created_at: string;
}

export interface AnswerEntry {
  questionId: string;
  selected: OptionKey | null;
  correct: OptionKey;
  marks: number;
}

export type Grade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
export type ResultStatus = 'pass' | 'fail';

export interface Result {
  id: string;
  student_id: string;
  exam_id: string;
  answers: AnswerEntry[];
  obtained_marks: number;
  total_marks: number;
  percentage: number;
  grade: Grade;
  status: ResultStatus;
  submitted_at: string;
}

export interface ExamWithCounts extends Exam {
  question_count?: number;
}

export interface ResultWithDetails extends Result {
  exam?: Pick<Exam, 'id' | 'title' | 'subject' | 'total_marks'>;
  student?: Pick<Profile, 'id' | 'full_name' | 'email'>;
}

export function computeGrade(percentage: number): Grade {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
}
