import React from 'react'
import { Container, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow, TextField, Stack } from '@mui/material'
import api from '../services/api'

type Entry = { id: string; userId: string; username: string; score: number; isAdmin: boolean }

const Leaderboard: React.FC = () => {
  const [rows, setRows] = React.useState<Entry[]>([])
  const [filter, setFilter] = React.useState('')

  React.useEffect(() => {
    api.get('/public/leaderboard').then(({ data }) => setRows(data))
  }, [])

  const filtered = rows.filter((r) => r.username.toLowerCase().includes(filter.toLowerCase()))

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Leaderboard</Typography>
          <TextField size="small" placeholder="Search" value={filter} onChange={(e) => setFilter(e.target.value)} />
        </Stack>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((r, i) => (
              <TableRow key={r.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell sx={{ color: r.isAdmin ? 'error.main' : undefined }}>{r.username}</TableCell>
                <TableCell>{r.score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  )
}

export default Leaderboard