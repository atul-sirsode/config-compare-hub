export type DiffStatus = 'match' | 'mismatch' | 'missing_source' | 'missing_dest';

export type ConfigNode = {
  key: string;
  sourceValue: string;
  destValue: string;
  status: DiffStatus;
};

function flatten(obj: any, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const val = obj[key];
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(result, flatten(val, fullKey));
    } else {
      result[fullKey] = JSON.stringify(val);
    }
  }
  return result;
}

export function diffConfigs(source: any, dest: any): ConfigNode[] {
  const flatSource = flatten(source);
  const flatDest = flatten(dest);
  const allKeys = new Set([...Object.keys(flatSource), ...Object.keys(flatDest)]);
  
  const nodes: ConfigNode[] = [];
  for (const key of Array.from(allKeys).sort()) {
    const inSource = key in flatSource;
    const inDest = key in flatDest;
    
    let status: DiffStatus;
    if (!inSource) status = 'missing_source';
    else if (!inDest) status = 'missing_dest';
    else if (flatSource[key] === flatDest[key]) status = 'match';
    else status = 'mismatch';

    nodes.push({
      key,
      sourceValue: inSource ? flatSource[key] : '—',
      destValue: inDest ? flatDest[key] : '—',
      status,
    });
  }
  return nodes;
}

export type FilterType = 'all' | 'mismatch' | 'match' | 'missing';

export function filterNodes(nodes: ConfigNode[], filter: FilterType, search: string): ConfigNode[] {
  let filtered = nodes;
  if (filter === 'mismatch') filtered = nodes.filter(n => n.status === 'mismatch');
  else if (filter === 'match') filtered = nodes.filter(n => n.status === 'match');
  else if (filter === 'missing') filtered = nodes.filter(n => n.status === 'missing_source' || n.status === 'missing_dest');
  
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(n => n.key.toLowerCase().includes(q) || n.sourceValue.toLowerCase().includes(q) || n.destValue.toLowerCase().includes(q));
  }
  return filtered;
}
