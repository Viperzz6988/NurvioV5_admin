import React from 'react'
import { Container, Paper, Typography, Tabs, Tab, Box, Stack, Button, Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControlLabel, Switch, Chip } from '@mui/material'
import api from '../services/api'

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
        </Tabs>
      </Paper>

      {tab === 0 && <UsersTab />}
      {tab === 1 && <SettingsTab />}
      {tab === 2 && <LogsTab />}
      {tab === 3 && <DataTab />}
      {tab === 4 && <MetricsTab />}
      {tab === 5 && <LeaderboardTab />}
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

  return (
    <Paper sx={{ mt: 2, p: 2 }}>
      <Stack direction="row" spacing={2} mb={2}>
        <TextField size="small" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button variant="contained" onClick={() => onEdit()}>Create</Button>
        <Button variant="outlined" onClick={() => bulkRole('USER')}>Role: USER</Button>
        <Button variant="outlined" onClick={() => bulkRole('ADMIN')}>Role: ADMIN</Button>
        <Button variant="outlined" onClick={() => bulkRole('SUPERADMIN')}>Role: SUPERADMIN</Button>
        <Button color="warning" variant="outlined" onClick={() => bulkBan(true)}>Ban</Button>
        <Button color="success" variant="outlined" onClick={() => bulkBan(false)}>Unban</Button>
        <Button color="error" variant="outlined" onClick={bulkDelete}>Delete</Button>
      </Stack>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Username</TableCell>
            <TableCell>Roles</TableCell>
            <TableCell>Banned</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell><input type="checkbox" checked={selection.includes(u.id)} onChange={(e) => setSelection((s) => e.target.checked ? [...s, u.id] : s.filter((x) => x !== u.id))} /></TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.username}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>{u.roles.map((r) => <Chip key={r} label={r} size="small" />)}</Stack>
              </TableCell>
              <TableCell>{u.isBanned ? 'Yes' : 'No'}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => onEdit(u)}>Edit</Button>
                  <Button size="small" color="error" onClick={() => onDelete(u.id)}>Delete</Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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

  const onMaintenance = async () => {
    await api.post('/admin/maintenance', { enabled: maintenance })
    alert('Maintenance updated')
  }
  const onFlag = async () => {
    if (!flagKey) return
    await api.post('/admin/feature-flags', { key: flagKey, enabled: flagEnabled })
    alert('Feature flag toggled')
  }
  const onCache = async () => {
    await api.post('/admin/cache/clear')
    alert('Cache cleared')
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
  React.useEffect(() => {
    api.get('/admin/audit-logs', { params: { action: search } }).then(({ data }) => setRows(data.items))
  }, [search])
  return (
    <Paper sx={{ mt: 2, p: 2 }}>
      <Stack direction="row" spacing={2} mb={2}>
        <TextField size="small" placeholder="Filter by action" value={search} onChange={(e) => setSearch(e.target.value)} />
      </Stack>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Time</TableCell>
            <TableCell>User</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
              <TableCell>{r.userId || '-'}</TableCell>
              <TableCell>{r.action}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Score</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.user.username}</TableCell>
              <TableCell>{r.score}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  )
}

export default Admin