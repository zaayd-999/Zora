import { Box, Button, Chip, Paper, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert } from '@mui/material';
import { ArrowLeft, Database, House, Table2, Server, Cable, User, ShieldCheck, Plus } from 'lucide-react';
import { useState } from 'react';

export default function OraclePage({ tables = false }: { tables?: boolean }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState([{ name: 'id', type: 'NUMBER' }]);
  const validName = (name: string) => /^[A-Za-z][A-Za-z0-9_]{0,29}$/.test(name);
  const valid = validName(tableName) && columns.every(column => validName(column.name)) && new Set(columns.map(column => column.name.toUpperCase())).size === columns.length;
  const sql = valid ? `CREATE TABLE ${tableName.toUpperCase()} (\n${columns.map(column => `  ${column.name.toUpperCase()} ${column.type}`).join(',\n')}\n);` : '';
  const details = [
    { label: 'DATABASE NAME', icon: Database },
    { label: 'ORACLE VERSION', icon: Server },
    { label: 'SERVICE NAME', icon: Cable },
    { label: 'CURRENT SCHEMA', icon: User },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fcfcfc', color: '#202124' }}>
      <Box component="header" sx={{ minHeight: 64, px: 3, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, borderBottom: '1px solid #e5e7eb', bgcolor: 'white' }}>
        <Database size={24} color="#d96220" />
        <Typography sx={{ fontWeight: 700 }}>ZOra</Typography>
        <Typography color="text.secondary">/</Typography>
        <Typography>Oracle workspace</Typography>
        <Chip label="Oracle 19c project" size="small" variant="outlined" />
        <Button href="#/" startIcon={<ArrowLeft size={16} />} sx={{ ml: 'auto', color: 'text.secondary', textTransform: 'none' }}>Servers</Button>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: 'calc(100vh - 64px)' }}>
        <Box component="nav" aria-label="Oracle navigation" sx={{ width: { xs: '100%', md: 232 }, flexShrink: 0, p: 2, borderRight: '1px solid #e5e7eb', bgcolor: 'white' }}>
          <Typography sx={{ px: 1.5, mb: 2, fontSize: 11, letterSpacing: 1.5, color: 'text.secondary' }}>WORKSPACE</Typography>
          {[{ label: 'Project overview', href: '#/oracle', icon: House, active: !tables }, { label: 'Tables', href: '#/oracle/tables', icon: Table2, active: tables }].map(({ label, href, icon: Icon, active }) => (
            <Button key={label} href={href} aria-current={active ? 'page' : undefined} startIcon={<Icon size={19} />} fullWidth sx={{ justifyContent: 'flex-start', px: 1.5, py: 1.2, mb: 0.5, textTransform: 'none', color: active ? '#c75115' : '#666', bgcolor: active ? '#fff1e8' : 'transparent', fontWeight: active ? 600 : 400 }}>{label}</Button>
          ))}
        </Box>
        <Box component="main" sx={{ flex: 1, minWidth: 0, p: { xs: 3, lg: 6 }, maxWidth: 1500 }}>
          <Typography color="text.secondary" sx={{ fontSize: 13, mb: 1 }}>Oracle workspace / {tables ? 'Tables' : 'Overview'}</Typography>
          <Typography component="h1" sx={{ fontSize: 30, fontWeight: 600, mb: 1 }}>{tables ? 'Tables' : 'Project overview'}</Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>{tables ? 'Browse and manage tables in your Oracle schema.' : 'Your Oracle database, at a glance.'}</Typography>
          <Button onClick={() => setCreateOpen(true)} startIcon={<Plus size={18} />} variant="contained" sx={{ mb: 3, bgcolor: '#d96220', textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: '#b94e17' } }}>Create table</Button>
          {tables ? (
            <Paper variant="outlined" sx={{ p: 5, textAlign: 'center', borderRadius: 2 }}>
              <Table2 size={32} color="#888" />
              <Typography 
              component="h2" 
              sx={{ fontSize: 20, fontWeight: 600, mt: 2 }}
              >Table listing is not connected yet</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>Connect the table query to your backend to display your schema's tables here.</Typography>
              <Button href="#/oracle" sx={{ mt: 2, color: '#c75115', textTransform: 'none' }}>Back to overview</Button>
            </Paper>
          ) : (
            <>
              <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <ShieldCheck size={25} color="#888" />
                <Box sx={{ flex: 1 }}><Typography sx={{ fontWeight: 600 }}>Database connection</Typography><Typography color="text.secondary" sx={{ fontSize: 14 }}>Instance information will appear after the backend connection is configured.</Typography></Box>
                <Chip label="Not checked" size="small" variant="outlined" />
              </Paper>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.1fr 1fr' }, gap: 4 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                  {details.map(({ label, icon: Icon }) => (
                    <Paper key={label} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                      <Icon size={22} color="#d96220" />
                      <Typography sx={{ fontSize: 11, letterSpacing: 1.2, color: 'text.secondary', mt: 2, mb: 1 }}>{label}</Typography>
                      <Typography sx={{ fontSize: 18 }}>Unavailable</Typography>
                    </Paper>
                  ))}
                </Box>
                <Paper variant="outlined" sx={{ minHeight: 290, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, backgroundImage: 'radial-gradient(#ddd 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, width: '100%', maxWidth: 320 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Database size={30} color="#d96220" /><Box><Typography sx={{ fontWeight: 600 }}>Primary database</Typography><Typography color="text.secondary" sx={{ fontSize: 13 }}>Oracle instance</Typography></Box></Box>
                    <Typography sx={{ mt: 3, pt: 2, borderTop: '1px solid #eee', color: 'text.secondary', fontSize: 13 }}>Waiting for instance information</Typography>
                  </Paper>
                </Paper>
              </Box>
              <Button href="#/oracle/tables" startIcon={<Table2 size={18} />} variant="contained" sx={{ mt: 4, bgcolor: '#d96220', textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: '#b94e17' } }}>Browse tables</Button>
            </>
          )}
        </Box>
      </Box>
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm" aria-labelledby="create-table-title">
        <DialogTitle id="create-table-title">Create a table</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>Prepare a table definition here. Creating it in Oracle requires a backend mutation that is not connected yet.</Alert>
          <TextField autoFocus fullWidth label="Table name" value={tableName} onChange={event => setTableName(event.target.value)} error={tableName.length > 0 && !validName(tableName)} helperText="Start with a letter; use letters, numbers or underscores (up to 30 characters)." />
          <Typography sx={{ mt: 3, mb: 2, fontWeight: 600 }}>Columns</Typography>
          {columns.map((column, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <TextField label="Column name" value={column.name} error={column.name.length > 0 && !validName(column.name)} onChange={event => setColumns(current => current.map((item, i) => i === index ? { ...item, name: event.target.value } : item))} sx={{ flex: 1, minWidth: 140 }} />
              <TextField select label="Data type" value={column.type} onChange={event => setColumns(current => current.map((item, i) => i === index ? { ...item, type: event.target.value } : item))} sx={{ minWidth: 165 }}>
                {['NUMBER', 'VARCHAR2(255)', 'DATE', 'TIMESTAMP', 'CLOB'].map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </TextField>
              <Button disabled={columns.length === 1} onClick={() => setColumns(current => current.filter((_, i) => i !== index))} aria-label={`Remove column ${index + 1}`}>Remove</Button>
            </Box>
          ))}
          <Button startIcon={<Plus size={16} />} onClick={() => setColumns(current => [...current, { name: '', type: 'VARCHAR2(255)' }])}>Add column</Button>
          {tableName && !valid && <Typography color="error" sx={{ mt: 2 }}>Use valid names and make each column name unique.</Typography>}
          {valid && <Box component="pre" sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, overflowX: 'auto', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{sql}</Box>}
        </DialogContent>
        <DialogActions><Button onClick={() => setCreateOpen(false)}>Close</Button><Button variant="contained" disabled>Create in Oracle</Button></DialogActions>
      </Dialog>
    </Box>
  );
}

