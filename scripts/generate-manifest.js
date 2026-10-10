#!/usr/bin/env node
/**
 * Recursively scans all folders in logos/ and generates an up-to-date manifest.json.
 * Future-proof: Supports any newly added category folder or SVG file automatically.
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const logosDir = path.join(rootDir, 'logos');
const manifestPath = path.join(rootDir, 'manifest.json');

// Existing manifest metadata lookup
let existingMap = new Map();
if (fs.existsSync(manifestPath)) {
  try {
    const existing = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    for (const item of existing) {
      if (item.shortname) existingMap.set(item.shortname.toLowerCase(), item);
      if (item.name) existingMap.set(item.name.toLowerCase(), item);
    }
  } catch (_) {}
}

function scanSvgs(dir, baseDir = dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(scanSvgs(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith('.svg')) {
      const relPath = path.relative(baseDir, fullPath);
      results.push(relPath);
    }
  }
  return results;
}

const allFiles = scanSvgs(logosDir);
console.log(`[manifest] Found ${allFiles.length} SVG files across all category folders.`);

// Group files by base brand slug
const brandGroups = new Map();

for (const relFile of allFiles) {
  // e.g. "google/google-icon.svg" -> category: "google", file: "google-icon.svg"
  const parts = relFile.split(path.sep);
  const category = parts.length > 1 ? parts[0] : 'general';
  const fileName = parts[parts.length - 1];
  const stem = fileName.replace(/\.svg$/i, '');
  
  // Clean brand slug (strip -icon, -logo, _icon)
  const brandSlug = stem
    .replace(/[-_](icon|logo|symbol|mark|wordmark|tile|color|dark|light|white|black|digital)$/i, '')
    .toLowerCase();

  const key = `${category}:${brandSlug}`;

  if (!brandGroups.has(key)) {
    brandGroups.set(key, {
      category,
      brandSlug,
      files: []
    });
  }
  brandGroups.get(key).files.push(relFile.replace(/\\/g, '/'));
}

const manifest = [];

for (const [, group] of brandGroups.entries()) {
  const { category, brandSlug, files } = group;
  files.sort();

  // Try to find existing name / url metadata
  const existing = existingMap.get(brandSlug) || existingMap.get(brandSlug.replace(/-/g, ' '));
  
  const displayName = existing && existing.name 
    ? existing.name 
    : brandSlug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

  manifest.push({
    name: displayName,
    shortname: brandSlug,
    category: category,
    url: existing ? (existing.url || '') : '',
    files: files
  });
}

manifest.sort((a, b) => a.shortname.localeCompare(b.shortname));

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`[manifest] Successfully generated ${manifestPath} with ${manifest.length} brands.`);
