import fs from 'fs/promises';
import path from 'path';

const dbPath = path.resolve('./src/__mocks__/response/test.events.json');

export async function readData() {
  const data = await fs.readFile(dbPath, 'utf-8');
  return JSON.parse(data);
}

export async function writeData(data) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}
