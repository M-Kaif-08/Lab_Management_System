import fs from 'fs';
import path from 'path';
import { env } from '../config/env.js';

export class StorageService {
  private static baseDir = path.resolve(env.STORAGE_PATH);

  static init() {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  static getFilePath(filename: string): string {
    return path.join(this.baseDir, filename);
  }

  static async saveFile(filename: string, data: Buffer): Promise<string> {
    this.init();
    const filePath = this.getFilePath(filename);
    await fs.promises.writeFile(filePath, data);
    return filePath;
  }
}
