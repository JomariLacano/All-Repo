import path from 'path';
import { JsonFileStore } from './JsonFileStore';
import { AdminFile, RequestsFile } from '../types';

const DATA_DIR = path.resolve(__dirname, '../../data');

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateRequestsFile(data: unknown): data is RequestsFile {
  if (!isPlainObject(data)) return false;
  if (typeof data.lastReferenceSeq !== 'number') return false;
  if (!Array.isArray(data.requests)) return false;
  return true;
}

function validateAdminFile(data: unknown): data is AdminFile {
  if (!isPlainObject(data)) return false;
  return 'admin' in data;
}

export const requestsStore = new JsonFileStore<RequestsFile>({
  filePath: path.join(DATA_DIR, 'requests.json'),
  defaultValue: { lastReferenceSeq: 0, requests: [] },
  validate: validateRequestsFile,
});

export const adminStore = new JsonFileStore<AdminFile>({
  filePath: path.join(DATA_DIR, 'admin.json'),
  defaultValue: { admin: null },
  validate: validateAdminFile,
});
