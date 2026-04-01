import yaml from 'js-yaml';
import type { AppSelection } from './gitlabService';

const FALLBACK_FILES: Record<string, string> = {
  G4: '/data/plp-md-web-G4.yml',
  Prod: '/data/plp-md-web-Production.yml',
};

function parseContent(text: string, isYaml: boolean): any {
  if (isYaml) return yaml.load(text) as any;
  const cleaned = text.replace(/,\s*([}\]])/g, '$1');
  return JSON.parse(cleaned);
}

async function fetchWithFallback(url: string, isYaml: boolean, fallbackKey?: string): Promise<any> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    return parseContent(text, isYaml);
  } catch (err) {
    console.warn(`Fetch failed for ${url}, using fallback:`, err);
    if (fallbackKey && FALLBACK_FILES[fallbackKey]) {
      const text = await fetch(FALLBACK_FILES[fallbackKey]).then(r => r.text());
      return yaml.load(text) as any;
    }
    return {};
  }
}

export async function fetchConfigs(
  env: string,
  source: AppSelection | null,
  dest: AppSelection | null,
): Promise<{ sourceJson: any; destJson: any }> {
  // TODO: When real GitLab API is ready, build URLs from env + project + file
  // For now, use fallback local files
  const sourceUrl = source
    ? `/data/${source.fileName}`
    : '';
  const destUrl = dest
    ? `/data/${dest.fileName}`
    : '';

  const [sourceJson, destJson] = await Promise.all([
    fetchWithFallback(sourceUrl || '', true, 'G4'),
    fetchWithFallback(destUrl || '', true, 'Prod'),
  ]);

  return { sourceJson, destJson };
}
