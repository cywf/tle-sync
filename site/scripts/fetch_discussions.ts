#!/usr/bin/env tsx
import { Octokit } from '@octokit/rest';
import { promises as fs } from 'fs';
import path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'cywf';
const REPO = 'tle-sync';

async function fetchDiscussions() {
  if (!GITHUB_TOKEN) {
    console.error('GITHUB_TOKEN not set');
    process.exit(1);
  }

  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  console.log('Fetching discussions...');

  try {
    // GraphQL query for discussions
    const query = `
      query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          discussions(first: 25, orderBy: {field: CREATED_AT, direction: DESC}) {
            nodes {
              title
              url
              createdAt
              author {
                login
              }
              category {
                name
              }
              comments {
                totalCount
              }
            }
          }
        }
      }
    `;

    const response: any = await octokit.graphql(query, {
      owner: OWNER,
      repo: REPO,
    });

    const discussions = response.repository.discussions.nodes.map((d: any) => ({
      title: d.title,
      url: d.url,
      createdAt: d.createdAt,
      author: d.author?.login || 'Unknown',
      category: d.category?.name,
      comments: d.comments.totalCount,
    }));

    const outputFile = path.join(process.cwd(), 'public', 'data', 'discussions.json');
    await fs.mkdir(path.dirname(outputFile), { recursive: true });
    await fs.writeFile(outputFile, JSON.stringify(discussions, null, 2));

    console.log(`Fetched ${discussions.length} discussions`);
    console.log('Discussions written to:', outputFile);
  } catch (err) {
    console.error('Error fetching discussions:', err);
    // Write empty array as fallback
    const outputFile = path.join(process.cwd(), 'public', 'data', 'discussions.json');
    await fs.mkdir(path.dirname(outputFile), { recursive: true });
    await fs.writeFile(outputFile, JSON.stringify([], null, 2));
  }
}

fetchDiscussions();
