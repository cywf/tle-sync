#!/usr/bin/env tsx
import { Octokit } from '@octokit/rest';
import { promises as fs } from 'fs';
import path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'cywf';
const REPO = 'tle-sync';

async function fetchRepoData() {
  if (!GITHUB_TOKEN) {
    console.error('GITHUB_TOKEN not set');
    process.exit(1);
  }

  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  console.log('Fetching repository data...');

  try {
    // Get repository info
    const { data: repo } = await octokit.repos.get({
      owner: OWNER,
      repo: REPO,
    });

    // Get languages
    const { data: languages } = await octokit.repos.listLanguages({
      owner: OWNER,
      repo: REPO,
    });

    // Get commit activity (last 12 weeks)
    const { data: commitActivity } = await octokit.repos.getCommitActivityStats({
      owner: OWNER,
      repo: REPO,
    });

    const commits = commitActivity
      ? commitActivity.slice(-12).map((week: any) => ({
          week: new Date(week.week * 1000).toLocaleDateString(),
          commits: week.total,
        }))
      : [];

    const stats = {
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      watchers: repo.subscribers_count,
      open_issues: repo.open_issues_count,
      default_branch: repo.default_branch,
      languages,
      commits,
      updated_at: new Date().toISOString(),
    };

    const outputFile = path.join(process.cwd(), 'public', 'data', 'stats.json');
    await fs.mkdir(path.dirname(outputFile), { recursive: true });
    await fs.writeFile(outputFile, JSON.stringify(stats, null, 2));

    console.log('Repository stats written to:', outputFile);
  } catch (err) {
    console.error('Error fetching repository data:', err);
    process.exit(1);
  }
}

fetchRepoData();
