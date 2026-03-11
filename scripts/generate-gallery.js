#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const LAYOUTS_DIR = path.join(__dirname, "..", "layouts");
const OUTPUT_FILE = path.join(__dirname, "..", "gallery.json");

function main() {
  const entries = fs.readdirSync(LAYOUTS_DIR, { withFileTypes: true });
  const layouts = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const dirName = entry.name;
    const dirPath = path.join(LAYOUTS_DIR, dirName);
    const metadataPath = path.join(dirPath, "metadata.json");
    const layoutPath = path.join(dirPath, "layout.json");

    if (!fs.existsSync(metadataPath) || !fs.existsSync(layoutPath)) {
      console.warn(`Skipping ${dirName}: missing metadata.json or layout.json`);
      continue;
    }

    const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
    const layout = JSON.parse(fs.readFileSync(layoutPath, "utf8"));

    const previewPath = path.join(dirPath, "preview.png");
    const hasPreview = fs.existsSync(previewPath);

    const entry_data = {
      id: dirName,
      name: metadata.name,
      author: metadata.author,
      description: metadata.description,
      tags: metadata.tags || [],
      cols: layout.cols,
      rows: layout.rows,
      furnitureCount: Array.isArray(layout.furniture) ? layout.furniture.length : 0,
      screenshot: hasPreview ? `layouts/${dirName}/preview.png` : null,
      layout: `layouts/${dirName}/layout.json`,
      createdAt: metadata.createdAt || null,
    };
    if (metadata.issueNumber) entry_data.issueNumber = metadata.issueNumber;
    if (typeof metadata.votes === "number") entry_data.votes = metadata.votes;
    layouts.push(entry_data);
  }

  layouts.sort((a, b) => a.id.localeCompare(b.id));

  const gallery = {
    version: 1,
    updatedAt: new Date().toISOString(),
    layouts,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(gallery, null, 2) + "\n");
  console.log(`Generated gallery.json with ${layouts.length} layout(s)`);
}

main();
