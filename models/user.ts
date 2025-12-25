import { Timestamp } from 'firebase/firestore';
import { User, UserSettings, UserRole } from '@/types';

export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: 'system',
  dailyGoal: 20,
  notifications: true,
  streak: 0,
  lastStudyDate: null,
};

export interface UserDocument {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  isBanned?: boolean;
  createdAt: Timestamp;
  settings: UserSettings;
}

export function toUser(doc: UserDocument): User {
  return {
    ...doc,
    createdAt: doc.createdAt.toDate(),
  };
}

export function toUserDocument(user: User): UserDocument {
  return {
    ...user,
    createdAt: Timestamp.fromDate(user.createdAt),
  };
}
