import yaml from 'js-yaml';

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
  mode: 'local' | 'api',
  selection: { source: string; dest: string },
  apiUrls: { source: string; dest: string }
): Promise<{ sourceJson: any; destJson: any }> {
  if (mode === 'api') {
    const [sourceJson, destJson] = await Promise.all([
      fetchWithFallback(apiUrls.source, false, 'G4'),
      fetchWithFallback(apiUrls.dest, false, 'Prod'),
    ]);
    return { sourceJson, destJson };
  }

  const FILE_MAP: Record<string, string> = {
    G4: '/data/plp-md-web-G4.yml',
    Prod: '/data/plp-md-web-Production.yml',
  };

  const [sourceJson, destJson] = await Promise.all([
    fetchWithFallback(FILE_MAP[selection.source] || '', true, 'G4'),
    fetchWithFallback(FILE_MAP[selection.dest] || '', true, 'Prod'),
  ]);
  return { sourceJson, destJson };
}
