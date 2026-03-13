import fs from 'node:fs';
import path from 'node:path';
import { JSONFilePreset } from 'lowdb/node';
import { env } from '../config/env';
import { DatabaseSchema } from '../types';

let dbInstance: Awaited<
  ReturnType<typeof JSONFilePreset<DatabaseSchema>>
> | null = null;

export const getDb = async () => {
  if (!dbInstance) {
    const dbDir = path.dirname(env.dbFilePath);
    fs.mkdirSync(dbDir, { recursive: true });

    dbInstance = await JSONFilePreset<DatabaseSchema>(env.dbFilePath, {
      users: [],
    });
  }

  return dbInstance;
};
