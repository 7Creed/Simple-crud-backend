export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  role: 'admin' | 'user';
}

export interface DatabaseSchema {
  users: UserRecord[];
}
