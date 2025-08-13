import React from 'react'
import { Container, Paper, Stack, TextField, Button, Typography, Alert } from '@mui/material'
import api from '../services/api'

const Contact: React.FC = () => {
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [subject, setSubject] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [status, setStatus] = React.useState<'idle'|'success'|'error'>('idle')
  const [error, setError] = React.useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('idle'); setError(null)
    if (!name || !email || !subject || message.length < 10) {
      setError('Please fill all fields. Message should be at least 10 characters.')
      return
    }
    try {
      await api.post('/public/contact', { name, email, subject, message })
      setStatus('success')
      setName(''); setEmail(''); setSubject(''); setMessage('')
    } catch (e: any) {
      setStatus('error'); setError(e?.response?.data?.message || 'Failed to send')
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" mb={2}>Contact</Typography>
        {status === 'success' && <Alert severity="success">Sent successfully</Alert>}
        {status === 'error' && <Alert severity="error">{error}</Alert>}
        <form onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required type="email" />
            <TextField label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
            <TextField label="Message" value={message} onChange={(e) => setMessage(e.target.value)} multiline rows={4} required />
            <Button variant="contained" type="submit">Send</Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  )
}

export default Contact