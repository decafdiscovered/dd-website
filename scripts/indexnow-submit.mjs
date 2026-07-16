import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

// Treat empty / whitespace-only env vars as "unset". GitHub Actions passes
// `vars.SITE_URL` through as an empty string when the repository variable is
// missing, which would otherwise satisfy `??` and blow up in `new URL('')`.
function envOr(name, fallback) {
  const value = process.env[name];
  if (value === undefined || value === null) return fallback;
  const trimmed = value.trim();
  return trimmed === '' ? fallback : trimmed;
}

const SITE = envOr('SITE_URL', 'https://decafdiscovered.co.uk');
const INDEXNOW_ENDPOINT = envOr('INDEXNOW_ENDPOINT', 'https://api.indexnow.org/indexnow');
const DIST_DIR = envOr('INDEXNOW_DIST_DIR', 'dist');
const PUBLIC_DIR = envOr('INDEXNOW_PUBLIC_DIR', 'public');

let siteUrl;
try {
  siteUrl = new URL(SITE);
} catch {
  throw new Error(
    `Invalid SITE_URL "${SITE}". Set the SITE_URL environment variable to an absolute URL, e.g. https://decafdiscovered.co.uk`,
  );
}

function ensureSlash(url) {
  return url.endsWith('/') ? url : `${url}/`;
}

async function findIndexNowKey() {
  if (process.env.INDEXNOW_KEY) return process.env.INDEXNOW_KEY.trim();

  const entries = await readdir(PUBLIC_DIR, { withFileTypes: true });
  const keyFile = entries.find((entry) => {
    if (!entry.isFile() || !entry.name.endsWith('.txt')) return false;
    const stem = entry.name.slice(0, -4);
    return /^[a-z0-9]{32}$/i.test(stem);
  });

  if (!keyFile) {
    throw new Error(
      'No IndexNow key found. Set INDEXNOW_KEY or add public/<your-32-char-key>.txt.',
    );
  }

  const filePath = path.join(PUBLIC_DIR, keyFile.name);
  const content = (await readFile(filePath, 'utf8')).trim();
  const stem = keyFile.name.slice(0, -4);

  if (content !== stem) {
    throw new Error(
      `IndexNow key file mismatch in ${filePath}: filename and file contents differ.`,
    );
  }

  return content;
}

async function collectSectionUrls(section) {
  const sectionDir = path.join(DIST_DIR, section);
  const urls = [];

  let entries = [];
  try {
    entries = await readdir(sectionDir, { withFileTypes: true });
  } catch {
    return urls;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const htmlPath = path.join(sectionDir, entry.name, 'index.html');
    try {
      await readFile(htmlPath);
      urls.push(new URL(`/${section}/${entry.name}/`, siteUrl).toString());
    } catch {
      // Skip folders that are not rendered pages.
    }
  }

  return urls;
}

async function main() {
  const key = await findIndexNowKey();
  const keyLocation = new URL(`/${key}.txt`, siteUrl).toString();

  const [reviewUrls, guideUrls] = await Promise.all([
    collectSectionUrls('reviews'),
    collectSectionUrls('guides'),
  ]);

  const urlList = [...reviewUrls, ...guideUrls].sort();

  if (urlList.length === 0) {
    console.log('No built review/guide URLs found in dist. Run npm run build first.');
    return;
  }

  const payload = {
    host: siteUrl.host,
    key,
    keyLocation,
    urlList,
  };

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`IndexNow submission failed (${response.status}): ${body}`);
  }

  console.log(`IndexNow submitted ${urlList.length} URL(s) to ${INDEXNOW_ENDPOINT}.`);
  console.log(`Host: ${siteUrl.host}`);
  console.log(`Key location: ${keyLocation}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
