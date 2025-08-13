import React from 'react'
import { Container, Paper, Stack, TextField, Button, Typography } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const Login: React.FC = () => {
  const { login, guestLogin } = useAuth()
  const [identifier, setIdentifier] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const navigate = useNavigate()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await login(identifier, password)
      navigate('/admin')
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Login failed')
    }
  }

  const onGuest = async () => {
    await guestLogin()
    navigate('/')
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" mb={2}>Login</Typography>
        <form onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField label="Email or Username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
            <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <Typography color="error">{error}</Typography>}
            <Stack direction="row" spacing={2}>
              <Button variant="contained" type="submit">Login</Button>
              <Button variant="outlined" onClick={onGuest}>Guest login</Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Container>
  )
}

export default Login