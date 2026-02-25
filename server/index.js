const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the frontend static HTML pages from the repository root
const repoRoot = path.join(__dirname, '..');
app.use(express.static(repoRoot, { extensions: ['html', 'htm'] }));

// Serve the client-side helper from server/public
app.use('/', express.static(path.join(__dirname, 'public')));

// Simple newsletter endpoint — appends emails to a local JSON file
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const newsletterFile = path.join(dataDir, 'newsletter.json');
if (!fs.existsSync(newsletterFile)) fs.writeFileSync(newsletterFile, '[]');

app.post('/api/newsletter', (req, res) => {
  const email = req.body.email || (req.body && req.body.email);
  if (!email) return res.status(400).json({ ok: false, error: 'email required' });
  try {
    const current = JSON.parse(fs.readFileSync(newsletterFile, 'utf8')) || [];
    current.push({ email, ts: new Date().toISOString() });
    fs.writeFileSync(newsletterFile, JSON.stringify(current, null, 2));
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'write error' });
  }
});

// File upload endpoint (resume upload stub)
const upload = multer({ dest: path.join(dataDir, 'uploads') });
app.post('/api/upload-resume', upload.single('resume'), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, error: 'file required' });
  return res.json({ ok: true, filename: req.file.filename, originalname: req.file.originalname });
});

app.get('/api/health', (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// Fallback: serve index.html if route not found (for simple SPA flows)
app.use((req, res, next) => {
  const indexPath = path.join(repoRoot, 'index.html');
  if (fs.existsSync(indexPath)) return res.sendFile(indexPath);
  return res.status(404).send('Not Found');
});

app.listen(PORT, () => console.log(`Hydra backend listening on http://localhost:${PORT}`));
