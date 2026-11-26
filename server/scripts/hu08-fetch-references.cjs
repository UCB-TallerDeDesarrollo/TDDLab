const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const folder = path.join(root, 'docs/hu08/evidence/references');
fs.mkdirSync(folder, { recursive: true });
async function get(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'TDDLab-HU08-validation' } });
  return { status: response.status, text: await response.text() };
}
(async () => {
  const results = [];
  for (const repo of ['Luiscuac/TotalizadorVentasIngSoftware', 'HenryRiveraM/fizzbuzz', 'RashLop/TennisPlay']) {
    const item = { repository: `https://github.com/${repo}`, files: [] };
    try {
      const meta = await get(`https://api.github.com/repos/${repo}`);
      item.repositoryStatus = meta.status;
      if (meta.status !== 200) { results.push(item); continue; }
      const branch = JSON.parse(meta.text).default_branch;
      item.branch = branch;
      const head = await get(`https://api.github.com/repos/${repo}/commits/${encodeURIComponent(branch)}`);
      const ref = head.status === 200 ? JSON.parse(head.text).sha : branch;
      item.ref = ref;
      for (const name of ['commit-history.json', 'tdd_log.json']) {
        const url = `https://raw.githubusercontent.com/${repo}/${ref}/script/${name}`;
        const file = await get(url);
        const info = { url, status: file.status };
        if (file.status === 200) {
          const parsed = JSON.parse(file.text);
          info.records = Array.isArray(parsed) ? parsed.length : null;
          info.sha256 = crypto.createHash('sha256').update(file.text).digest('hex');
          info.localFile = `${repo.replace('/', '-')}-${name}`;
          fs.writeFileSync(path.join(folder, info.localFile), file.text);
        }
        item.files.push(info);
      }
    } catch (error) { item.error = error.message; }
    results.push(item);
  }
  fs.writeFileSync(path.join(folder, 'reference-check.json'), JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2));
  console.log(JSON.stringify(results, null, 2));
})();
