import React from 'react'
import { AppBar, Toolbar, Typography, Button, Stack, IconButton, Menu, MenuItem, Badge, TextField } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { setLang } from '../i18n'
import { useThemeMode } from '../contexts/ThemeContext'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import TranslateIcon from '@mui/icons-material/Translate'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { useNotifications } from '../contexts/NotificationsContext'

const App: React.FC = () => {
  const { t } = useTranslation()
  const { mode, toggle } = useThemeMode()
  const { user, logout } = useAuth()
  const [langAnchor, setLangAnchor] = React.useState<null | HTMLElement>(null)
  const { notifications, clear } = useNotifications()
  const [search, setSearch] = React.useState('')
  const navigate = useNavigate()

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (user && (user.roles.includes('ADMIN') || user.roles.includes('SUPERADMIN'))) {
      navigate(`/admin?search=${encodeURIComponent(search)}`)
    } else {
      navigate(`/leaderboard`)
    }
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>{t('welcome')}</Typography>
          <form onSubmit={onSearch}>
            <TextField size="small" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ mr: 2, bgcolor: 'background.paper', borderRadius: 1 }} />
          </form>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton color="inherit" onClick={() => clear()}>
              <Badge color="error" badgeContent={notifications.length}>
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Button color="inherit" component={Link} to="/leaderboard">{t('leaderboard')}</Button>
            <Button color="inherit" component={Link} to="/contact">{t('contact')}</Button>
            {user && (user.roles.includes('ADMIN') || user.roles.includes('SUPERADMIN')) && (
              <Button color="inherit" component={Link} to="/admin">{t('admin')}</Button>
            )}
            {!user ? (
              <Button color="inherit" component={Link} to="/login">{t('login')}</Button>
            ) : (
              <Button color="inherit" onClick={logout}>{t('logout')}</Button>
            )}
            <Button color="inherit" onClick={toggle}>{t('theme')}: {mode}</Button>
            <IconButton color="inherit" onClick={(e) => setLangAnchor(e.currentTarget)}>
              <TranslateIcon />
            </IconButton>
            <Menu open={Boolean(langAnchor)} onClose={() => setLangAnchor(null)} anchorEl={langAnchor}>
              <MenuItem onClick={() => { setLang('en'); setLangAnchor(null); }}>EN</MenuItem>
              <MenuItem onClick={() => { setLang('de'); setLangAnchor(null); }}>DE</MenuItem>
            </Menu>
          </Stack>
        </Toolbar>
      </AppBar>
      <Stack p={3} spacing={2}>
        <Typography variant="h4">Nurvio Admin Panel</Typography>
        <Typography>Use the navigation to access features.</Typography>
      </Stack>
    </>
  )
}

export default App