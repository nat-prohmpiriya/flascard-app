import { Timestamp } from 'firebase/firestore';

export interface TypingSnippet {
  id: string;
  userId: string;
  language: string;
  languageName: string;
  title: string;
  description?: string;
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
  description?: string;
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
  description?: string;
  code: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isPublic: boolean;
}

// Normalize line endings: CRLF → LF, CR → LF
function normalizeCode(code: string): string {
  return code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

export function toTypingSnippet(id: string, doc: TypingSnippetDocument): TypingSnippet {
  return {
    id,
    ...doc,
    code: normalizeCode(doc.code),
    createdAt: doc.createdAt.toDate(),
    updatedAt: doc.updatedAt.toDate(),
  };
}

// Predefined languages for dropdown
export const SUPPORTED_LANGUAGES = [
  // Text (non-code)
  { id: 'thai-text', name: 'Thai Text', color: '#E91E63', isCode: false },
  { id: 'english-text', name: 'English Text', color: '#9C27B0', isCode: false },
  // Programming languages
  { id: 'go', name: 'Go', color: '#00ADD8', isCode: true },
  { id: 'react', name: 'React', color: '#61DAFB', isCode: true },
  { id: 'nextjs', name: 'Next.js', color: '#000000', isCode: true },
  { id: 'javascript', name: 'JavaScript', color: '#F7DF1E', isCode: true },
  { id: 'typescript', name: 'TypeScript', color: '#3178C6', isCode: true },
  { id: 'python', name: 'Python', color: '#3776AB', isCode: true },
  { id: 'fastapi', name: 'FastAPI', color: '#009688', isCode: true },
  { id: 'rust', name: 'Rust', color: '#DEA584', isCode: true },
  { id: 'java', name: 'Java', color: '#ED8B00', isCode: true },
  { id: 'csharp', name: 'C#', color: '#512BD4', isCode: true },
  { id: 'cpp', name: 'C++', color: '#00599C', isCode: true },
  { id: 'php', name: 'PHP', color: '#777BB4', isCode: true },
  { id: 'ruby', name: 'Ruby', color: '#CC342D', isCode: true },
  { id: 'swift', name: 'Swift', color: '#F05138', isCode: true },
  { id: 'kotlin', name: 'Kotlin', color: '#7F52FF', isCode: true },
  { id: 'sql', name: 'SQL', color: '#4479A1', isCode: true },
  { id: 'html', name: 'HTML', color: '#E34F26', isCode: true },
  { id: 'css', name: 'CSS', color: '#1572B6', isCode: true },
  { id: 'shell', name: 'Shell/Bash', color: '#4EAA25', isCode: true },
  { id: 'docker', name: 'Docker', color: '#2496ED', isCode: true },
  { id: 'kubernetes', name: 'Kubernetes', color: '#326CE5', isCode: true },
  { id: 'nginx', name: 'Nginx', color: '#009639', isCode: true },
  { id: 'redis', name: 'Redis', color: '#DC382D', isCode: true },
  { id: 'graphql', name: 'GraphQL', color: '#E10098', isCode: true },
  { id: 'grpc', name: 'gRPC', color: '#244C5A', isCode: true },
  { id: 'mongodb', name: 'MongoDB', color: '#47A248', isCode: true },
  { id: 'nestjs', name: 'NestJS', color: '#E0234E', isCode: true },
  { id: 'svelte', name: 'Svelte', color: '#FF3E00', isCode: true },
  { id: 'other', name: 'Other', color: '#6B7280', isCode: true },
] as const;

export function getLanguageById(id: string) {
  return SUPPORTED_LANGUAGES.find((lang) => lang.id === id);
}
