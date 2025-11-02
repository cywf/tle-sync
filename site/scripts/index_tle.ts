#!/usr/bin/env tsx
import { promises as fs } from 'fs';
import path from 'path';

interface TLEEntry {
  path: string;
  name: string;
  size: number;
  epoch?: string;
  line1?: string;
  line2?: string;
  type?: 'LEO' | 'GEO' | null;
}

async function walkDirectory(dir: string, baseDir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkDirectory(fullPath, baseDir)));
    } else if (entry.isFile() && (entry.name.endsWith('.tle') || entry.name.endsWith('.txt'))) {
      files.push(fullPath);
    }
  }

  return files;
}

function parseTLEEpoch(line1: string): string | undefined {
  try {
    // TLE Line 1 format: column 18-32 contains epoch (YYDDDddddd)
    const epochStr = line1.substring(18, 32).trim();
    if (!epochStr) return undefined;

    const year = parseInt(epochStr.substring(0, 2));
    const dayOfYear = parseFloat(epochStr.substring(2));

    // Convert 2-digit year to 4-digit (assumes 1957-2056 range)
    const fullYear = year < 57 ? 2000 + year : 1900 + year;

    // Calculate date from day of year
    const date = new Date(fullYear, 0);
    date.setDate(dayOfYear);

    return date.toISOString();
  } catch (e) {
    return undefined;
  }
}

function determineType(filePath: string): 'LEO' | 'GEO' | null {
  const lowerPath = filePath.toLowerCase();
  if (lowerPath.includes('/leo/') || lowerPath.includes('\\leo\\')) {
    return 'LEO';
  } else if (lowerPath.includes('/geo/') || lowerPath.includes('\\geo\\')) {
    return 'GEO';
  }
  return null;
}

async function indexTLE() {
  const publicDir = path.join(process.cwd(), 'public', 'tle');
  const outputFile = path.join(process.cwd(), 'public', 'data', 'tle_catalog.json');

  console.log('Indexing TLE files from:', publicDir);

  try {
    const files = await walkDirectory(publicDir, publicDir);
    console.log(`Found ${files.length} TLE files`);

    const catalog: TLEEntry[] = [];

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const lines = content.split('\n').filter((l) => l.trim().length > 0);

        const stats = await fs.stat(file);
        const relativePath = file.replace(path.join(process.cwd(), 'public'), '');
        const name = path.basename(file);

        const entry: TLEEntry = {
          path: relativePath.replace(/\\/g, '/'),
          name,
          size: stats.size,
          type: determineType(file),
        };

        // Parse TLE lines if available
        if (lines.length >= 2) {
          entry.line1 = lines[0].substring(0, 90);
          entry.line2 = lines[1].substring(0, 90);
          entry.epoch = parseTLEEpoch(lines[0]);
        }

        catalog.push(entry);
      } catch (err) {
        console.error(`Error processing file ${file}:`, err);
      }
    }

    // Ensure output directory exists
    await fs.mkdir(path.dirname(outputFile), { recursive: true });

    // Write catalog
    await fs.writeFile(outputFile, JSON.stringify(catalog, null, 2));
    console.log(`TLE catalog written to: ${outputFile}`);
    console.log(`Total entries: ${catalog.length}`);
  } catch (err) {
    console.error('Error indexing TLE files:', err);
    process.exit(1);
  }
}

indexTLE();
