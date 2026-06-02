import path from 'node:path';
import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';

config({ path: path.resolve(__dirname, '../../.env') });

const schemaPath = path.resolve(__dirname, 'prisma');

export default defineConfig({
  schema: schemaPath,
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://root:root@localhost:5432/cms?schema=public',
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
  earlyAccess: true,
});
