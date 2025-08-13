import React from 'react'
import { Container, Paper, Typography, Tabs, Tab, Box, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControlLabel, Switch, Chip, Tooltip, IconButton } from '@mui/material'
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid'
import api from '../services/api'
import UserSelector from '../components/UserSelector'
import { useNotifications } from '../contexts/NotificationsContext'
import { useLocation } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import BlockIcon from '@mui/icons-material/Block'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

function a11yProps(index: number) {
  return { id: `tab-${index}`, 'aria-controls': `tabpanel-${index}` }
}

const Admin: React.FC = () => {
  const [tab, setTab] = React.useState(0)

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Users" {...a11yProps(0)} />
          <Tab label="Settings" {...a11yProps(1)} />
          <Tab label="Logs" {...a11yProps(2)} />
          <Tab label="Data" {...a11yProps(3)} />
          <Tab label="Metrics" {...a11yProps(4)} />
          <Tab label="Leaderboard" {...a11yProps(5)} />
          <Tab label="Dashboard" {...a11yProps(6)} />
        </Tabs>
      </Paper>

      {tab === 0 && <UsersTab />}
      {tab === 1 && <SettingsTab />}
      {tab === 2 && <LogsTab />}
      {tab === 3 && <DataTab />}
      {tab === 4 && <MetricsTab />}
      {tab === 5 && <LeaderboardTab />}
      {tab === 6 && <DashboardTab />}
    </Container>
  )
}

const UsersTab: React.FC = () => {
  type U = { id: string; email: string; username: string; roles: string[]; isBanned: boolean }
  const [users, setUsers] = React.useState<U[]>([])
  const [search, setSearch] = React.useState('')
  const [selection, setSelection] = React.useState<string[]>([])
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<U | null>(null)
  const [form, setForm] = React.useState({ email: '', username: '', password: '', roles: 'USER' })
  const [targetUser, setTargetUser] = React.useState<any | null>(null)
  const location = useLocation()

  React.useEffect(() => {
    const params = new URLSearchParams(location.search)
    const q = params.get('search') || ''
    setSearch(q)
  }, [location.search])

  const load = React.useCallback(() => {
    api.get('/admin/users', { params: { search } }).then(({ data }) => setUsers(data.items.map((u: any) => ({ id: u.id, email: u.email, username: u.username, roles: u.roles.map((r: any) => r.name), isBanned: u.isBanned }))))
  }, [search])

  React.useEffect(() => { load() }, [load])

  const onEdit = (u?: U) => {
    setEditing(u || null)
    setForm({ email: u?.email || '', username: u?.username || '', password: '', roles: (u?.roles[0] || 'USER') })
    setOpen(true)
  }

  const onSave = async () => {
    if (!form.email || !form.username || (!editing && !form.password)) return
    if (editing) {
      await api.put(`/admin/users/${editing.id}`, { email: form.email, username: form.username, password: form.password || undefined, roles: [form.roles] })
    } else {
      await api.post(`/admin/users`, { email: form.email, username: form.username, password: form.password, roles: [form.roles] })
    }
    setOpen(false); load()
  }

  const onDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return
    await api.delete(`/admin/users/${id}`); load()
  }

  const onBanToggle = async (u: U) => {
    const ban = !u.isBanned
    if (!confirm(`${ban ? 'Ban' : 'Unban'} ${u.username}?`)) return
    await api.post('/admin/users/bulk/ban', { ids: [u.id], isBanned: ban })
    load()
  }

  const bulkBan = async (ban: boolean) => {
    if (!selection.length) return
    if (!confirm(`${ban ? 'Ban' : 'Unban'} ${selection.length} users?`)) return
    await api.post('/admin/users/bulk/ban', { ids: selection, isBanned: ban }); setSelection([]); load()
  }
  const bulkDelete = async () => {
    if (!selection.length) return
    if (!confirm(`Delete ${selection.length} users?`)) return
    await api.post('/admin/users/bulk/delete', { ids: selection }); setSelection([]); load()
  }
  const bulkRole = async (role: string) => {
    if (!selection.length) return
    if (!confirm(`Set role ${role} for ${selection.length} users?`)) return
    await api.post('/admin/users/bulk/role', { ids: selection, role }); setSelection([]); load()
  }

  const columns: GridColDef[] = [
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'username', headerName: 'Username', width: 180 },
    { field: 'roles', headerName: 'Roles', width: 220, renderCell: (params) => (
      <Stack direction="row" spacing={1}>{(params.value as string[]).map((r) => <Chip key={r} label={r} size="small" />)}</Stack>
    )},
    { field: 'status', headerName: 'Status', width: 120, valueGetter: (_, row) => row.isBanned ? 'BANNED' : 'ACTIVE', renderCell: (params) => params.row.isBanned ? <Chip color="error" size="small" label="BANNED"/> : <Chip color="success" size="small" label="ACTIVE"/> },
    { field: 'actions', headerName: 'Actions', width: 220, sortable: false, filterable: false, renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        <Tooltip title="Edit"><IconButton size="small" onClick={() => onEdit(params.row as U)}><EditIcon fontSize="small"/></IconButton></Tooltip>
        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => onDelete((params.row as U).id)}><DeleteIcon fontSize="small"/></IconButton></Tooltip>
        { (params.row as U).isBanned ? (
          <Tooltip title="Unban"><IconButton size="small" color="success" onClick={() => onBanToggle(params.row as U)}><CheckCircleIcon fontSize="small"/></IconButton></Tooltip>
        ) : (
          <Tooltip title="Ban"><IconButton size="small" color="warning" onClick={() => onBanToggle(params.row as U)}><BlockIcon fontSize="small"/></IconButton></Tooltip>
        )}
      </Stack>
    )},
  ]

  return (
    <Paper sx={{ mt: 2, p: 2 }}>
      <Stack direction="row" spacing={2} mb={2} alignItems="center">
        <TextField size="small" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button variant="contained" onClick={() => onEdit()}>Create</Button>
        <Button variant="outlined" onClick={() => bulkRole('USER')}>Role: USER</Button>
        <Button variant="outlined" onClick={() => bulkRole('ADMIN')}>Role: ADMIN</Button>
        <Button variant="outlined" onClick={() => bulkRole('SUPERADMIN')}>Role: SUPERADMIN</Button>
        <Button color="warning" variant="outlined" onClick={() => bulkBan(true)}>Ban</Button>
        <Button color="success" variant="outlined" onClick={() => bulkBan(false)}>Unban</Button>
        <Button color="error" variant="outlined" onClick={bulkDelete}>Delete</Button>
        <UserSelector value={targetUser} onChange={setTargetUser} label="Target user" />
      </Stack>
      <div style={{ width: '100%' }}>
        <DataGrid
          autoHeight
          rows={users}
          columns={columns}
          getRowId={(r) => r.id}
          checkboxSelection
          disableRowSelectionOnClick
          rowSelectionModel={selection as GridRowSelectionModel}
          onRowSelectionModelChange={(m) => setSelection(m as string[])}
          sx={{ '& .MuiDataGrid-row:hover': { backgroundColor: 'action.hover' } }}
        />
      </div>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editing ? 'Edit User' : 'Create User'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1} sx={{ minWidth: 360 }}>
            <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <TextField label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
            <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editing} />
            <TextField label="Role" value={form.roles} onChange={(e) => setForm({ ...form, roles: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={onSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

const SettingsTab: React.FC = () => {
  const [maintenance, setMaintenance] = React.useState(false)
  const [flagKey, setFlagKey] = React.useState('')
  const [flagEnabled, setFlagEnabled] = React.useState(false)
  const { add } = useNotifications()

  const onMaintenance = async () => {
    await api.post('/admin/maintenance', { enabled: maintenance })
    add(`Maintenance ${maintenance ? 'enabled' : 'disabled'}`)
  }
  const onFlag = async () => {
    if (!flagKey) return
    await api.post('/admin/feature-flags', { key: flagKey, enabled: flagEnabled })
    add(`Feature flag '${flagKey}' ${flagEnabled ? 'enabled' : 'disabled'}`)
  }
  const onCache = async () => {
    await api.post('/admin/cache/clear')
    add('Server cache cleared')
  }

  return (
    <Paper sx={{ mt: 2, p: 2 }}>
      <Stack spacing={2}>
        <FormControlLabel control={<Switch checked={maintenance} onChange={(e) => setMaintenance(e.target.checked)} />} label="Maintenance Mode" />
        <Button variant="contained" onClick={onMaintenance}>Apply Maintenance</Button>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField size="small" label="Feature Flag Key" value={flagKey} onChange={(e) => setFlagKey(e.target.value)} />
          <FormControlLabel control={<Switch checked={flagEnabled} onChange={(e) => setFlagEnabled(e.target.checked)} />} label="Enabled" />
          <Button variant="outlined" onClick={onFlag}>Toggle Flag</Button>
        </Stack>
        <Button variant="outlined" onClick={onCache}>Clear Server Cache</Button>
      </Stack>
    </Paper>
  )
}

const LogsTab: React.FC = () => {
  const [rows, setRows] = React.useState<any[]>([])
  const [search, setSearch] = React.useState('')
  const location = useLocation()
  React.useEffect(() => {
    const params = new URLSearchParams(location.search)
    const q = params.get('search') || ''
    setSearch(q)
  }, [location.search])
  React.useEffect(() => {
    api.get('/admin/audit-logs', { params: { action: search } }).then(({ data }) => setRows(data.items))
  }, [search])
  return (
    <Paper sx={{ mt: 2, p: 2 }}>
      <Stack direction="row" spacing={2} mb={2}>
        <TextField size="small" placeholder="Filter by action" value={search} onChange={(e) => setSearch(e.target.value)} />
      </Stack>
      <Box sx={{ width: '100%', overflow: 'auto' }}>
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
                <td>{r.userId || '-'}</td>
                <td>{r.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Paper>
  )
}

const DataTab: React.FC = () => {
  const fileRef = React.useRef<HTMLInputElement>(null)
  const onExport = async () => {
    const { data } = await api.get('/admin/export')
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'backup.json'
    a.click()
  }
  const onImport = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    const text = await file.text()
    await api.post('/admin/import', JSON.parse(text))
    alert('Import complete')
  }
  return (
    <Paper sx={{ mt: 2, p: 2 }}>
      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={onExport}>Export</Button>
        <input type="file" ref={fileRef} accept="application/json" />
        <Button variant="contained" onClick={onImport}>Import</Button>
      </Stack>
    </Paper>
  )
}

const MetricsTab: React.FC = () => {
  const [metrics, setMetrics] = React.useState<any>(null)
  React.useEffect(() => { api.get('/admin/metrics').then(({ data }) => setMetrics(data)) }, [])
  return (
    <Paper sx={{ mt: 2, p: 2 }}>
      <Typography variant="h6">Metrics</Typography>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{metrics ? JSON.stringify(metrics, null, 2) : 'Loading...'}</pre>
    </Paper>
  )
}

const LeaderboardTab: React.FC = () => {
  const [rows, setRows] = React.useState<any[]>([])
  React.useEffect(() => { api.get('/admin/leaderboard').then(({ data }) => setRows(data)) }, [])
  return (
    <Paper sx={{ mt: 2, p: 2 }}>
      <Typography variant="h6">Leaderboard Manager</Typography>
      <Box sx={{ width: '100%', overflow: 'auto' }}>
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>User</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.user.username}</td>
                <td>{r.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Paper>
  )
}

const DashboardTab: React.FC = () => {
  const [stats, setStats] = React.useState<{ totalUsers: number; activeUsers: number; bannedUsers: number } | null>(null)
  const [metrics, setMetrics] = React.useState<any>(null)
  React.useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data))
    api.get('/admin/metrics').then(({ data }) => setMetrics(data))
  }, [])
  return (
    <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
      <Paper sx={{ p: 2 }}><Typography variant="subtitle2">Total Users</Typography><Typography variant="h4">{stats?.totalUsers ?? '-'}</Typography></Paper>
      <Paper sx={{ p: 2 }}><Typography variant="subtitle2">Active (24h)</Typography><Typography variant="h4">{stats?.activeUsers ?? '-'}</Typography></Paper>
      <Paper sx={{ p: 2 }}><Typography variant="subtitle2">Banned</Typography><Typography variant="h4">{stats?.bannedUsers ?? '-'}</Typography></Paper>
      <Paper sx={{ p: 2 }}><Typography variant="subtitle2">Server</Typography><Typography variant="body2">CPU cores: {metrics?.cpuCores ?? '-'}</Typography><Typography variant="body2">Mem RSS: {metrics?.memory?.rss ?? '-'}</Typography></Paper>
    </Box>
  )
}

export default Admin