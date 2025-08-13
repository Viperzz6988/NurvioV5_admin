import React from 'react'
import { AppBar, Toolbar, Typography, Button, Stack, IconButton, Menu, MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { setLang } from '../i18n'
import { useThemeMode } from '../contexts/ThemeContext'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import TranslateIcon from '@mui/icons-material/Translate'

const App: React.FC = () => {
  const { t } = useTranslation()
  const { mode, toggle } = useThemeMode()
  const { user, logout } = useAuth()
  const [langAnchor, setLangAnchor] = React.useState<null | HTMLElement>(null)

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>{t('welcome')}</Typography>
          <Stack direction="row" spacing={1}>
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