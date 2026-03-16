import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightLeft, RefreshCw, CheckCircle2, AlertCircle, Search, Filter, Download } from 'lucide-react';
import { diffConfigs, filterNodes, type ConfigNode, type FilterType } from '@/lib/configDiff';
import { fetchConfigs } from '@/services/configService';

export default function Index() {
  const [loading, setLoading] = useState(false);
  const [diffData, setDiffData] = useState<ConfigNode[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [apiUrls, setApiUrls] = useState({ source: '', dest: '' });

  const sourceLabel = useMemo(() => {
    if (!apiUrls.source) return 'Source';
    try { const parts = new URL(apiUrls.source).pathname.split('/').filter(Boolean); return parts[parts.length - 2] || 'Source'; } catch { const parts = apiUrls.source.split('/').filter(Boolean); return parts[parts.length - 2] || 'Source'; }
  }, [apiUrls.source]);

  const destLabel = useMemo(() => {
    if (!apiUrls.dest) return 'Destination';
    try { const parts = new URL(apiUrls.dest).pathname.split('/').filter(Boolean); return parts[parts.length - 2] || 'Destination'; } catch { const parts = apiUrls.dest.split('/').filter(Boolean); return parts[parts.length - 2] || 'Destination'; }
  }, [apiUrls.dest]);

  const filtered = useMemo(() => filterNodes(diffData, filter, search), [diffData, filter, search]);

  const stats = useMemo(() => ({
    total: diffData.length,
    match: diffData.filter(n => n.status === 'match').length,
    mismatch: diffData.filter(n => n.status === 'mismatch').length,
    missing: diffData.filter(n => n.status === 'missing_source' || n.status === 'missing_dest').length,
  }), [diffData]);

  const handleCompare = async () => {
    setLoading(true);
    try {
      const mode = (apiUrls.source && apiUrls.dest) ? 'api' : 'local';
      const { sourceJson, destJson } = await fetchConfigs(mode, { source: 'G4', dest: 'Prod' }, apiUrls);
      setDiffData(diffConfigs(sourceJson, destJson));
    } catch (err) {
      console.error('Compare failed:', err);
    }
    setLoading(false);
  };

  const exportCsv = () => {
    const rows = ['Key,Source,Destination,Status', ...filtered.map(n =>
      `"${n.key}","${n.sourceValue}","${n.destValue}","${n.status}"`)].join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'config-diff.csv'; a.click();
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-added/30">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-added rounded-lg flex items-center justify-center shadow-[0_0_15px_hsl(142_70%_45%/0.2)]">
              <ArrowRightLeft className="w-5 h-5 text-primary-foreground stroke-[2.5px]" />
            </div>
            <h1 className="text-secondary-foreground font-semibold tracking-tight">
              Equivalence <span className="text-muted-foreground font-normal">v1.0</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <input
              placeholder="Source config URL (leave empty for mock G4)"
              value={apiUrls.source}
              onChange={e => setApiUrls({ ...apiUrls, source: e.target.value })}
              className="bg-surface border border-border rounded-md px-3 py-1.5 text-sm text-secondary-foreground placeholder:text-muted-foreground w-64 focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <input
              placeholder="Dest config URL (leave empty for mock Prod)"
              value={apiUrls.dest}
              onChange={e => setApiUrls({ ...apiUrls, dest: e.target.value })}
              className="bg-surface border border-border rounded-md px-3 py-1.5 text-sm text-secondary-foreground placeholder:text-muted-foreground w-64 focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              onClick={handleCompare}
              disabled={loading}
              className="bg-secondary-foreground hover:bg-foreground text-background px-4 py-1.5 rounded-md text-sm font-medium transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Compare'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Stats + Filters */}
        {diffData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <StatBadge label="Total" count={stats.total} active={filter === 'all'} onClick={() => setFilter('all')} />
              <StatBadge label="Match" count={stats.match} color="text-added" active={filter === 'match'} onClick={() => setFilter('match')} />
              <StatBadge label="Mismatch" count={stats.mismatch} color="text-modified" active={filter === 'mismatch'} onClick={() => setFilter('mismatch')} />
              <StatBadge label="Missing" count={stats.missing} color="text-removed" active={filter === 'missing'} onClick={() => setFilter('missing')} />
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="Search keys or values..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-surface border border-border rounded-md pl-9 pr-3 py-1.5 text-sm text-secondary-foreground placeholder:text-muted-foreground w-64 focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <button onClick={exportCsv} className="p-2 rounded-md border border-border bg-surface text-muted-foreground hover:text-foreground transition-colors" title="Export CSV">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Diff Table */}
        <div className="rounded-xl border border-border bg-surface/30 overflow-hidden">
          <div className="grid grid-cols-[1.2fr_1.5fr_1.5fr] border-b border-border bg-surface/50 text-[11px] uppercase tracking-widest font-bold text-muted-foreground">
            <div className="px-6 py-3">Property Key</div>
            <div className="px-6 py-3 border-l border-border flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-added" />
              {sourceLabel}
            </div>
            <div className="px-6 py-3 border-l border-border flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-modified" />
              {destLabel}
            </div>
          </div>

          <div className="divide-y divide-border/50 max-h-[calc(100vh-220px)] overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {filtered.length > 0 ? (
                filtered.map((node, i) => <DiffRow key={node.key} node={node} index={i} />)
              ) : (
                <EmptyState hasData={diffData.length > 0} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

function DiffRow({ node, index }: { node: ConfigNode; index: number }) {
  const isMismatch = node.status !== 'match';

  const destCellClass =
    node.status === 'mismatch' ? 'bg-removed/10 text-removed' :
    node.status === 'missing_dest' ? 'bg-muted/20 text-muted-foreground italic' :
    'text-foreground';

  const srcCellClass =
    node.status === 'missing_source' ? 'text-muted-foreground italic' : 'text-foreground';

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.01, 0.5) }}
      className={`grid grid-cols-[1.2fr_1.5fr_1.5fr] group transition-colors ${isMismatch ? 'bg-modified/[0.02]' : 'hover:bg-muted/30'}`}
    >
      <div className="px-6 py-3 flex items-start gap-2 min-w-0">
        <code className="text-sm font-mono text-secondary-foreground break-all">{node.key}</code>
      </div>
      <div className={`px-6 py-3 border-l border-border/50 font-mono text-sm break-all ${srcCellClass}`}>
        {node.sourceValue}
      </div>
      <div className={`px-6 py-3 border-l border-border/50 font-mono text-sm break-all flex justify-between items-start gap-2 ${destCellClass}`}>
        <span className="break-all">{node.destValue}</span>
        {node.status === 'match' ? (
          <CheckCircle2 className="w-4 h-4 text-added/50 shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-4 h-4 text-removed shrink-0 mt-0.5" />
        )}
      </div>
    </motion.div>
  );
}




function StatBadge({ label, count, color = 'text-foreground' }: { label: string; count: number; color?: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border rounded-md">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold font-mono ${color}`}>{count}</span>
    </div>
  );
}

function EmptyState({ hasData }: { hasData: boolean }) {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
      <div className="w-12 h-12 rounded-full border border-dashed border-muted flex items-center justify-center mb-4">
        {hasData ? <Filter className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
      </div>
      <p className="text-sm">
        {hasData ? 'No results match your filter.' : 'Select environments and click Compare to begin audit.'}
      </p>
    </div>
  );
}
