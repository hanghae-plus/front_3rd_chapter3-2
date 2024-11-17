import fs from 'fs/promises';
import path from 'path';

export default async function globalSetup() {
  const dbPath = path.resolve('./src/__mocks__/response/test.events.json');
  const initialDataPath = path.resolve('./src/__mocks__/response/events.json');

  // JSON 파일 초기화
  const initialData = await fs.readFile(initialDataPath, 'utf-8');
  await fs.writeFile(dbPath, initialData);

  console.log('Test data initialized');
}
