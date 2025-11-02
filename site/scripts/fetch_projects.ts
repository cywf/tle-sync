#!/usr/bin/env tsx
import { Octokit } from '@octokit/rest';
import { promises as fs } from 'fs';
import path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'cywf';
const REPO = 'tle-sync';

async function fetchProjects() {
  if (!GITHUB_TOKEN) {
    console.error('GITHUB_TOKEN not set');
    process.exit(1);
  }

  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  console.log('Fetching project/issues data...');

  try {
    // Fallback: Get issues and group by labels
    const { data: issues } = await octokit.issues.listForRepo({
      owner: OWNER,
      repo: REPO,
      state: 'open',
      per_page: 100,
    });

    const todo: any[] = [];
    const doing: any[] = [];
    const done: any[] = [];

    for (const issue of issues) {
      const labels = issue.labels.map((l: any) => (typeof l === 'string' ? l : l.name));
      const item = {
        title: issue.title,
        number: issue.number,
        url: issue.html_url,
        labels,
      };

      if (labels.includes('status:doing') || labels.includes('in-progress')) {
        doing.push(item);
      } else if (labels.includes('status:done') || labels.includes('completed')) {
        done.push(item);
      } else {
        todo.push(item);
      }
    }

    const projectData = { todo, doing, done };

    const outputFile = path.join(process.cwd(), 'public', 'data', 'projects.json');
    await fs.mkdir(path.dirname(outputFile), { recursive: true });
    await fs.writeFile(outputFile, JSON.stringify(projectData, null, 2));

    console.log(`Project data written to: ${outputFile}`);
    console.log(`Todo: ${todo.length}, Doing: ${doing.length}, Done: ${done.length}`);
  } catch (err) {
    console.error('Error fetching project data:', err);
    // Write empty data as fallback
    const projectData = { todo: [], doing: [], done: [] };
    const outputFile = path.join(process.cwd(), 'public', 'data', 'projects.json');
    await fs.mkdir(path.dirname(outputFile), { recursive: true });
    await fs.writeFile(outputFile, JSON.stringify(projectData, null, 2));
  }
}

fetchProjects();
