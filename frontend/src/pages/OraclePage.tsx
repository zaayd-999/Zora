import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  MenuItem,
  Paper,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Code2,
  ChevronRight,
  Cpu,
  Database,
  Gauge,
  HardDrive,
  Layers,
  LayoutDashboard,
  LockKeyhole,
  Network,
  Plus,
  RefreshCw,
  Server,
  Settings,
  ShieldCheck,
  Table2,
  Users,
  Archive,
  CalendarClock,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import AdministrationPage from '@/pages/AdministrationPage';
import { getDashboard, type DashboardOverview } from '@/graphql/dashboard';
import { listServers, type Server as OracleServer } from '@/graphql/servers';

const metricCards: {
  label: string;
  icon: LucideIcon;
  value: (dashboard: DashboardOverview | null) => string;
  detail: (dashboard: DashboardOverview | null) => string;
}[] = [
  {
    label: 'Database status',
    icon: Database,
    value: (dashboard) => dashboard?.databaseStatus ?? '—',
    detail: (dashboard) => dashboard?.databaseName ?? 'Open mode unavailable',
  },
  {
    label: 'Instance status',
    icon: Activity,
    value: (dashboard) => dashboard?.instanceStatus ?? '—',
    detail: () => 'Oracle instance state',
  },
  {
    label: 'Container database',
    icon: Boxes,
    value: (dashboard) => dashboard?.containerDatabase == null ? '—' : dashboard.containerDatabase ? 'Yes' : 'No',
    detail: () => 'CDB configuration',
  },
  {
    label: 'Pluggable databases',
    icon: Layers,
    value: (dashboard) => dashboard?.pluggableDatabases?.toLocaleString() ?? '—',
    detail: () => 'PDB count',
  },
  {
    label: 'Active sessions',
    icon: Users,
    value: (dashboard) => dashboard?.activeSessions?.toLocaleString() ?? '—',
    detail: () => 'Active user sessions',
  },
  {
    label: 'Tablespace usage',
    icon: HardDrive,
    value: (dashboard) => dashboard?.tablespaceUsedMb == null || dashboard.tablespaceAllocatedMb == null
      ? '—'
      : `${formatMb(dashboard.tablespaceUsedMb)} / ${formatMb(dashboard.tablespaceAllocatedMb)}`,
    detail: () => 'Used / allocated (MB)',
  },
  {
    label: 'Server CPU',
    icon: Cpu,
    value: (dashboard) => dashboard?.cpuPercent == null ? '—' : `${dashboard.cpuPercent.toFixed(1)}%`,
    detail: () => 'Host CPU utilization',
  },
  {
    label: 'SGA memory',
    icon: Gauge,
    value: (dashboard) => dashboard?.sgaAllocatedMb == null ? '—' : `${formatMb(dashboard.sgaAllocatedMb)} MB`,
    detail: () => 'Oracle SGA allocation',
  },
];

function formatMb(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

function DashboardPage() {
  const [range, setRange] = useState('1h');
  const [servers, setServers] = useState<OracleServer[]>([]);
  const [selectedServerId, setSelectedServerId] = useState('');
  const [dashboard, setDashboard] = useState<DashboardOverview | null>(null);
  const [serversLoading, setServersLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [serversError, setServersError] = useState<string | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    let current = true;
    listServers()
      .then((items) => {
        if (!current) return;
        setServers(items);
        setSelectedServerId((selected) =>
          items.some((server) => server.id === selected) ? selected : items[0]?.id ?? '',
        );
      })
      .catch((error: unknown) => {
        if (current) setServersError(error instanceof Error ? error.message : 'Could not load Oracle servers.');
      })
      .finally(() => {
        if (current) setServersLoading(false);
      });
    return () => {
      current = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedServerId) {
      setDashboard(null);
      setDashboardError(null);
      return;
    }

    let current = true;
    setDashboardLoading(true);
    setDashboard(null);
    setDashboardError(null);
    getDashboard(selectedServerId, range)
      .then((data) => {
        if (current) setDashboard(data);
      })
      .catch((error: unknown) => {
        if (current) {
          setDashboard(null);
          setDashboardError(error instanceof Error ? error.message : 'Could not load Oracle dashboard data.');
        }
      })
      .finally(() => {
        if (current) setDashboardLoading(false);
      });
    return () => {
      current = false;
    };
  }, [selectedServerId, range, refreshCounter]);

  const selectedServer = servers.find((server) => server.id === selectedServerId);
  const connectionLabel = dashboard
    ? 'Connected'
    : dashboardLoading
      ? 'Connecting'
      : dashboardError
        ? 'Connection failed'
        : selectedServer
          ? 'Not connected'
          : 'No server configured';
  const cpuSamples = dashboard?.cpuSamples ?? [];
  const cpuPoints = cpuSamples.map((sample, index) => {
    const x = cpuSamples.length === 1 ? 417.5 : 45 + (index / (cpuSamples.length - 1)) * 745;
    const y = 120 - (Math.max(0, Math.min(100, sample.cpuPercent)) / 100) * 102;
    return `${x},${y}`;
  }).join(' ');

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        color: '#252525',
        px: { xs: 2, md: 3 },
        py: 2.5,
      }}
    >
      <Box sx={{ maxWidth: 1420, mx: 'auto' }}>
        <Box
          component="header"
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            mb: 2.5,
          }}
        >
          <Box>
            <Typography component="h1" sx={{ fontSize: 24, fontWeight: 600 }}>
              Oracle Infrastructure
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: 13, mt: 0.5 }}>
              A real-time view of your database infrastructure and operations.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.25 }}>
            <Box
              role="group"
              aria-label="Chart time range"
              sx={{
                display: 'flex',
                p: 0.5,
                bgcolor: 'white',
                border: '1px solid #e7e3dd',
                borderRadius: 1.5,
              }}
            >
              {['1h', '24h', '7d'].map((option) => (
                <Button
                  key={option}
                  size="small"
                  aria-pressed={range === option}
                  onClick={() => setRange(option)}
                  sx={{
                    minWidth: 38,
                    px: 1,
                    py: 0.5,
                    color: range === option ? '#bd4937' : '#687080',
                    bgcolor: range === option ? '#fff0eb' : 'transparent',
                    fontSize: 11,
                    textTransform: 'none',
                    '&:hover': { bgcolor: range === option ? '#fff0eb' : '#f7f7f7' },
                  }}
                >
                  {option}
                </Button>
              ))}
            </Box>
            <Tooltip title="Refresh dashboard data from the selected Oracle server.">
              <span>
                <Button
                  disabled={!selectedServerId || dashboardLoading}
                  onClick={() => setRefreshCounter((count) => count + 1)}
                  variant="outlined"
                  startIcon={<RefreshCw size={15} />}
                  sx={{
                    bgcolor: 'white',
                    borderColor: '#e7e3dd',
                    color: '#4a4a4a',
                    fontSize: 12,
                    textTransform: 'none',
                  }}
                >
                  Refresh
                </Button>
              </span>
            </Tooltip>
            <Button
              href="#/"
              variant="contained"
              startIcon={<Plus size={16} />}
              sx={{
                bgcolor: '#c94735',
                color: 'white',
                fontSize: 12,
                textTransform: 'none',
                '&:hover': { bgcolor: '#a93d30' },
              }}
            >
              Add Server
            </Button>
          </Box>
        </Box>

        <Paper
          variant="outlined"
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1.5,
            p: 1.5,
            mb: 2.5,
            borderColor: '#e8e5df',
            borderRadius: 2,
          }}
        >
          <Box
            aria-hidden="true"
            sx={{
              width: 44,
              height: 44,
              display: 'grid',
              placeItems: 'center',
              color: '#c94735',
              bgcolor: '#fff3ef',
              border: '1px solid #f6ded7',
              borderRadius: 1.5,
            }}
          >
            <Database size={20} />
          </Box>
          <TextField
            select
            size="small"
            label="Oracle server"
            value={selectedServerId}
            onChange={(event) => setSelectedServerId(event.target.value)}
            disabled={serversLoading || servers.length === 0}
            sx={{ minWidth: { xs: '100%', sm: 230 } }}
          >
            {servers.map((server) => (
              <MenuItem key={server.id} value={server.id}>
                {server.name}
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ minWidth: 140 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
              {dashboard?.databaseName ?? selectedServer?.name ?? 'Oracle database'}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: 10 }}>
              {selectedServer
                ? `${selectedServer.host}:${selectedServer.port ?? 1521}${selectedServer.serviceName ? ` / ${selectedServer.serviceName}` : ''}`
                : serversLoading ? 'Loading configured servers…' : 'Add an Oracle server to begin.'}
            </Typography>
          </Box>
          <Chip
            label={connectionLabel}
            size="small"
            sx={{
              color: dashboard ? '#28734f' : '#9b4a3d',
              bgcolor: dashboard ? '#edf8f1' : '#fff3ef',
              border: `1px solid ${dashboard ? '#d0ead9' : '#f6ded7'}`,
              fontSize: 10,
            }}
          />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              ml: { xs: 0, md: 'auto' },
              color: '#687080',
              fontSize: 12,
            }}
          >
            <Server size={14} aria-hidden="true" />
            <span>{selectedServer ? 'Oracle JDBC connection' : 'No server selected'}</span>
          </Box>
        </Paper>

        {serversError && <Alert severity="error" sx={{ mb: 1.5 }}>{serversError}</Alert>}
        {dashboardError && <Alert severity="error" sx={{ mb: 1.5 }}>{dashboardError}</Alert>}
        {dashboard?.metricErrors.map(({ metric, message }) => (
          <Alert key={metric} severity="warning" sx={{ mb: 1 }}>
            {metric}: {message}
          </Alert>
        ))}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 1.5,
            mb: 1.5,
          }}
        >
          {metricCards.map(({ label, detail, value, icon: Icon }) => (
            <Paper
              key={label}
              variant="outlined"
              sx={{
                minHeight: 108,
                p: 1.75,
                borderColor: '#e8e5df',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#85858b' }}>
                <Typography color="text.secondary" sx={{ fontSize: 11 }}>
                  {label}
                </Typography>
                <Icon size={15} aria-hidden="true" />
              </Box>
              <Typography sx={{ mt: 1.1, fontSize: 21, lineHeight: 1.2, color: dashboard ? '#252525' : '#7f8389' }}>
                {value(dashboard)}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.7, fontSize: 10 }}>
                {detail(dashboard)}
              </Typography>
            </Paper>
          ))}
        </Box>

        <Paper
          component="section"
          aria-labelledby="cpu-chart-title"
          variant="outlined"
          sx={{ mb: 1.5, borderColor: '#e8e5df', borderRadius: 2, overflow: 'hidden' }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1.5,
              borderBottom: '1px solid #eeeae4',
            }}
          >
            <Typography id="cpu-chart-title" component="h2" sx={{ fontSize: 13, fontWeight: 600 }}>
              CPU utilization
            </Typography>
            <Chip
              size="small"
              label={dashboard?.cpuPercent == null ? 'No telemetry' : `${dashboard.cpuPercent.toFixed(1)}% current`}
              sx={{ bgcolor: '#f7f6f3', color: '#777', fontSize: 10 }}
            />
          </Box>
          <Box sx={{ position: 'relative', minHeight: 185, px: { xs: 1, sm: 3 }, py: 1.5 }}>
            <svg
              role="img"
              aria-label={`CPU utilization chart for the last ${range}${cpuSamples.length === 0 ? '; no telemetry is available' : ''}`}
              viewBox="0 0 800 150"
              preserveAspectRatio="none"
              style={{ display: 'block', width: '100%', height: 145 }}
            >
              {[18, 52, 86, 120].map((y) => (
                <line
                  key={y}
                  x1="45"
                  y1={y}
                  x2="790"
                  y2={y}
                  stroke="#e9e5df"
                  strokeDasharray="4 6"
                />
              ))}
              <text x="5" y="21" fill="#85858b" fontSize="10">100%</text>
              <text x="12" y="55" fill="#85858b" fontSize="10">75%</text>
              <text x="12" y="89" fill="#85858b" fontSize="10">50%</text>
              <text x="12" y="123" fill="#85858b" fontSize="10">25%</text>
              {cpuSamples.length > 0 && (
                <polyline points={cpuPoints} fill="none" stroke="#c94735" strokeWidth="2" />
              )}
            </svg>
            {cpuSamples.length === 0 && <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pt: 2,
                pointerEvents: 'none',
              }}
            >
              <Typography color="text.secondary" sx={{ px: 2, textAlign: 'center', fontSize: 12 }}>
                {dashboardLoading
                  ? 'Loading CPU history…'
                  : range === '1h'
                    ? 'CPU history is unavailable for this Oracle account.'
                    : 'Oracle live metric history covers the last hour; longer history is unavailable.'}
              </Typography>
            </Box>}
          </Box>
        </Paper>

        <Paper
          component="section"
          aria-labelledby="tablespace-health-title"
          variant="outlined"
          sx={{ borderColor: '#e8e5df', borderRadius: 2, overflow: 'hidden' }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1.5,
              borderBottom: '1px solid #eeeae4',
            }}
          >
            <Typography
              id="tablespace-health-title"
              component="h2"
              sx={{ fontSize: 13, fontWeight: 600 }}
            >
              Tablespace health
            </Typography>
            <Button
              href="#/oracle/tables"
              endIcon={<ArrowUpRight size={14} />}
              sx={{ color: '#687080', fontSize: 11, textTransform: 'none' }}
            >
              View all
            </Button>
          </Box>
          <Box
            sx={{
              minHeight: 145,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 1.5,
              px: 2,
              py: 2,
            }}
            aria-label="Tablespace usage"
          >
            {dashboardLoading && [1, 2, 3].map((row) => (
              <Box
                key={row}
                aria-hidden="true"
                sx={{ display: 'grid', gridTemplateColumns: '62px 1fr 42px', gap: 1.5, alignItems: 'center' }}
              >
                <Skeleton animation={false} variant="text" width={48} height={18} />
                <Skeleton animation={false} variant="rounded" height={5} />
                <Skeleton animation={false} variant="text" width={32} height={18} />
              </Box>
            ))}
            {!dashboardLoading && dashboard?.tablespaces.map((tablespace) => (
              <Box
                key={tablespace.name}
                sx={{ display: 'grid', gridTemplateColumns: '90px 1fr 48px', gap: 1.5, alignItems: 'center' }}
              >
                <Typography noWrap sx={{ fontSize: 10 }}>{tablespace.name}</Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.max(0, Math.min(100, tablespace.usagePercent ?? 0))}
                  sx={{
                    height: 6,
                    borderRadius: 4,
                    bgcolor: '#eeeae4',
                    '& .MuiLinearProgress-bar': { bgcolor: (tablespace.usagePercent ?? 0) >= 90 ? '#c94735' : '#d58a46' },
                  }}
                />
                <Typography sx={{ textAlign: 'right', fontSize: 10 }}>
                  {tablespace.usagePercent == null ? '—' : `${tablespace.usagePercent.toFixed(0)}%`}
                </Typography>
              </Box>
            ))}
            {!dashboardLoading && (!dashboard || dashboard.tablespaces.length === 0) && (
              <Typography color="text.secondary" sx={{ textAlign: 'center', fontSize: 11 }}>
                {dashboardError ? 'Tablespace data is unavailable.' : 'No tablespace data returned.'}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              px: 2,
              py: 1.25,
              borderTop: '1px solid #eeeae4',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#687080' }}>
              <HardDrive size={14} aria-hidden="true" />
              <Typography sx={{ fontSize: 11 }}>Total allocated</Typography>
              <Typography sx={{ color: '#333', fontSize: 11 }}>
                {dashboard?.tablespaceAllocatedMb == null ? '—' : `${formatMb(dashboard.tablespaceAllocatedMb)} MB`}
              </Typography>
            </Box>
            <Typography color="text.secondary" sx={{ fontSize: 10 }}>
              {dashboard?.tablespaceUsedMb == null
                ? 'Storage data unavailable'
                : `${formatMb(dashboard.tablespaceUsedMb)} MB used`}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

function TablesPage() {
  return (
    <Box component="main" sx={{ flex: 1, minWidth: 0, p: { xs: 3, lg: 6 }, color: '#202124' }}>
      <Typography color="text.secondary" sx={{ fontSize: 13, mb: 1 }}>
        Oracle workspace / Tables
      </Typography>
      <Typography component="h1" sx={{ fontSize: 30, fontWeight: 600, mb: 1 }}>
        Tables
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Browse and manage tables in your Oracle schema.
      </Typography>
      <Button
        href="#/oracle/settings"
        startIcon={<Plus size={18} />}
        variant="contained"
        sx={{
          mb: 3,
          bgcolor: '#d96220',
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': { bgcolor: '#b94e17' },
        }}
      >
        Create table
      </Button>
      <Paper variant="outlined" sx={{ p: 5, textAlign: 'center', borderRadius: 2 }}>
        <Table2 size={32} color="#888" />
        <Typography component="h2" sx={{ fontSize: 20, fontWeight: 600, mt: 2 }}>
          Table listing is not connected yet
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Connect the table query to your backend to display your schema&apos;s tables here.
        </Typography>
        <Button href="#/oracle" sx={{ mt: 2, color: '#c75115', textTransform: 'none' }}>
          Back to dashboard
        </Button>
      </Paper>
    </Box>
  );
}

function SqlEditorPage() {
  return (
    <Box component="main" sx={{ flex: 1, minWidth: 0, p: { xs: 3, lg: 6 }, color: '#202124' }}>
      <Typography color="text.secondary" sx={{ fontSize: 13, mb: 1 }}>
        Oracle workspace / SQL &amp; PL/SQL Console
      </Typography>
      <Typography component="h1" sx={{ fontSize: 30, fontWeight: 600, mb: 1 }}>
        SQL &amp; PL/SQL Console
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Write and run queries against your Oracle database.
      </Typography>
      <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            px: 2,
            py: 1.5,
            borderBottom: '1px solid #eeeae4',
          }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Query</Typography>
          <Tooltip title="Connect an Oracle backend before running queries.">
            <span>
              <Button
                disabled
                endIcon={<ArrowRight size={15} />}
                variant="contained"
                sx={{ bgcolor: '#c94735', textTransform: 'none' }}
              >
                Run query
              </Button>
            </span>
          </Tooltip>
        </Box>
        <TextField
          fullWidth
          multiline
          minRows={12}
          placeholder="-- Enter an Oracle SQL query"
          aria-label="SQL query editor"
          sx={{
            '& .MuiInputBase-root': {
              alignItems: 'flex-start',
              fontFamily: 'monospace',
              fontSize: 13,
              bgcolor: '#fff',
            },
          }}
        />
        <Alert severity="info" sx={{ borderRadius: 0 }}>
          Query execution is unavailable until an Oracle backend connection is configured.
        </Alert>
      </Paper>
    </Box>
  );
}

function UnavailableSectionPage({ title }: { title: string }) {
  return (
    <Box component="main" sx={{ flex: 1, minWidth: 0, p: { xs: 3, lg: 6 }, color: '#202124' }}>
      <Typography color="text.secondary" sx={{ fontSize: 13, mb: 1 }}>
        Oracle workspace / {title}
      </Typography>
      <Typography component="h1" sx={{ fontSize: 30, fontWeight: 600, mb: 1 }}>
        {title}
      </Typography>
      <Paper variant="outlined" sx={{ mt: 4, p: 5, textAlign: 'center', borderRadius: 2 }}>
        <Database size={32} color="#888" aria-hidden="true" />
        <Typography component="h2" sx={{ fontSize: 18, fontWeight: 600, mt: 2 }}>
          This section is not connected yet
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Connect an Oracle backend to view and manage {title.toLowerCase()}.
        </Typography>
      </Paper>
    </Box>
  );
}

const navigationGroups: {
  label: string;
  items: { label: string; href: string; icon: LucideIcon; activeView: string }[];
}[] = [
  {
    label: 'OVERVIEW',
    items: [
      { label: 'Dashboard', href: '#/oracle/overview', icon: LayoutDashboard, activeView: 'overview' },
    ],
  },
  {
    label: 'DATABASE MANAGEMENT',
    items: [
      { label: 'Databases & PDBs', href: '#/oracle/databases', icon: Database, activeView: 'databases' },
      { label: 'Users & Roles', href: '#/oracle/users', icon: Users, activeView: 'users' },
      { label: 'Schema Objects', href: '#/oracle/tables', icon: Table2, activeView: 'tables' },
      { label: 'Tablespaces & Storage', href: '#/oracle/storage', icon: HardDrive, activeView: 'storage' },
      { label: 'Performance', href: '#/oracle/performance', icon: Gauge, activeView: 'performance' },
      { label: 'Security & Auditing', href: '#/oracle/security', icon: ShieldCheck, activeView: 'security' },
      { label: 'Backup & Recovery', href: '#/oracle/backup', icon: Archive, activeView: 'backup' },
      { label: 'Sessions & Locks', href: '#/oracle/sessions', icon: LockKeyhole, activeView: 'sessions' },
      { label: 'Connectivity', href: '#/oracle/connectivity', icon: Network, activeView: 'connectivity' },
      { label: 'SQL & PL/SQL Console', href: '#/oracle/sql', icon: Code2, activeView: 'sql' },
      { label: 'Jobs & Scheduler', href: '#/oracle/jobs', icon: CalendarClock, activeView: 'jobs' },
      { label: 'Administration Settings', href: '#/oracle/settings', icon: Settings, activeView: 'settings' },
    ],
  },
];

export default function OraclePage({
  tables = false,
  sqlEditor = false,
  view,
}: {
  tables?: boolean;
  sqlEditor?: boolean;
  view?: string;
}) {
  const activeView = view ?? (sqlEditor ? 'sql' : tables ? 'tables' : 'overview');

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          minHeight: '100vh',
          bgcolor: '#f6f5f2',
        }}
      >
        <Box
          component="aside"
          sx={{
            width: { xs: '100%', md: 248 },
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            p: 2,
            bgcolor: '#fff',
            borderRight: { xs: 'none', md: '1px solid #e8e5df' },
            borderBottom: { xs: '1px solid #e8e5df', md: 'none' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 1.25, py: 1.5, mb: 2 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                display: 'grid',
                placeItems: 'center',
                color: '#c94735',
                bgcolor: '#fff3ef',
                border: '1px solid #f6ded7',
                borderRadius: 1.5,
              }}
            >
              <Database size={18} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 700 }}>OraNexus</Typography>
              <Typography color="text.secondary" sx={{ fontSize: 10 }}>
                ORACLE DATABASE MANAGEMENT
              </Typography>
            </Box>
          </Box>
          <Box component="nav" aria-label="Oracle workspace navigation">
            {navigationGroups.map(({ label: groupLabel, items }) => (
              <Box key={groupLabel} sx={{ mb: 2 }}>
                <Typography
                  sx={{
                    px: 1.5,
                    mb: 0.75,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: 1,
                    color: '#8a8a8a',
                  }}
                >
                  {groupLabel}
                </Typography>
                {items.map(({ label, href, icon: Icon, activeView: itemView }) => {
                  const active = activeView === itemView;
                  return (
                    <Button
                      key={itemView}
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      startIcon={<Icon size={17} />}
                      endIcon={<ChevronRight size={15} />}
                      fullWidth
                      sx={{
                        justifyContent: 'space-between',
                        px: 1.5,
                        py: 0.95,
                        mb: 0.35,
                        color: active ? '#bd4937' : '#62656c',
                        bgcolor: active ? '#fff0eb' : 'transparent',
                        fontSize: 11.5,
                        fontWeight: active ? 600 : 400,
                        textTransform: 'none',
                        '& .MuiButton-startIcon': { mr: 1.1 },
                        '& .MuiButton-endIcon': { ml: 'auto' },
                        '&:hover': { bgcolor: active ? '#fff0eb' : '#f7f6f3' },
                      }}
                    >
                      {label}
                    </Button>
                  );
                })}
              </Box>
            ))}
          </Box>
          <Paper
            variant="outlined"
            sx={{ mt: { xs: 1.5, md: 'auto' }, p: 1.5, borderColor: '#eeeae4', borderRadius: 1.5 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Database size={14} color="#888" />
              <Typography sx={{ fontSize: 11, fontWeight: 600 }}>Database connection</Typography>
            </Box>
            <Typography color="text.secondary" sx={{ fontSize: 10 }}>
              Not connected
            </Typography>
          </Paper>
        </Box>
        {activeView === 'tables' ? (
          <TablesPage />
        ) : activeView === 'sql' ? (
          <SqlEditorPage />
        ) : activeView === 'overview' ? (
          <DashboardPage />
        ) : activeView === 'users' ? (
          <AdministrationPage initialTab="user" />
        ) : activeView === 'settings' ? (
          <AdministrationPage />
        ) : (
          <UnavailableSectionPage
            title={navigationGroups.flatMap((group) => group.items).find((item) => item.activeView === activeView)?.label ?? 'Dashboard'}
          />
        )}
      </Box>
    </>
  );
}
