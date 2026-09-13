import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const collectHtml = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? collectHtml(path) : entry.name.endsWith('.html') ? [path] : [];
  }));
  return nested.flat();
};

const hasPositiveAttribute = (tag, attribute) =>
  Number(tag.match(new RegExp(`\\b${attribute}=["']?(\\d+)`, 'i'))?.[1]) > 0;

const files = await collectHtml('.');
const invalid = [];

for (const file of files) {
  const html = await readFile(file, 'utf8');
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    if (/\bloading=["']lazy["']/i.test(tag) &&
        (!hasPositiveAttribute(tag, 'width') || !hasPositiveAttribute(tag, 'height'))) {
      invalid.push(`${file}: ${tag}`);
    }
  }
}

if (invalid.length) {
  console.error('Lazy images require positive width and height attributes:\n' + invalid.join('\n'));
  process.exit(1);
}

console.log(`Checked ${files.length} HTML pages: every lazy image has width and height.`);
