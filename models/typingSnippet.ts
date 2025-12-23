import { Timestamp } from 'firebase/firestore';

export interface TypingSnippet {
  id: string;
  userId: string;
  language: string;
  languageName: string;
  title: string;
  code: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isPreset: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TypingSnippetDocument {
  userId: string;
  language: string;
  languageName: string;
  title: string;
  code: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isPreset: boolean;
  isPublic: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TypingSnippetFormData {
  language: string;
  languageName: string;
  title: string;
  code: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isPublic: boolean;
}

export function toTypingSnippet(id: string, doc: TypingSnippetDocument): TypingSnippet {
  return {
    id,
    ...doc,
    createdAt: doc.createdAt.toDate(),
    updatedAt: doc.updatedAt.toDate(),
  };
}

// Predefined languages for dropdown
export const SUPPORTED_LANGUAGES = [
  { id: 'go', name: 'Go', color: '#00ADD8' },
  { id: 'react', name: 'React', color: '#61DAFB' },
  { id: 'nextjs', name: 'Next.js', color: '#000000' },
  { id: 'javascript', name: 'JavaScript', color: '#F7DF1E' },
  { id: 'typescript', name: 'TypeScript', color: '#3178C6' },
  { id: 'python', name: 'Python', color: '#3776AB' },
  { id: 'fastapi', name: 'FastAPI', color: '#009688' },
  { id: 'rust', name: 'Rust', color: '#DEA584' },
  { id: 'java', name: 'Java', color: '#ED8B00' },
  { id: 'csharp', name: 'C#', color: '#512BD4' },
  { id: 'cpp', name: 'C++', color: '#00599C' },
  { id: 'php', name: 'PHP', color: '#777BB4' },
  { id: 'ruby', name: 'Ruby', color: '#CC342D' },
  { id: 'swift', name: 'Swift', color: '#F05138' },
  { id: 'kotlin', name: 'Kotlin', color: '#7F52FF' },
  { id: 'sql', name: 'SQL', color: '#4479A1' },
  { id: 'html', name: 'HTML', color: '#E34F26' },
  { id: 'css', name: 'CSS', color: '#1572B6' },
  { id: 'shell', name: 'Shell/Bash', color: '#4EAA25' },
  { id: 'docker', name: 'Docker', color: '#2496ED' },
  { id: 'other', name: 'Other', color: '#6B7280' },
] as const;

export function getLanguageById(id: string) {
  return SUPPORTED_LANGUAGES.find((lang) => lang.id === id);
}
