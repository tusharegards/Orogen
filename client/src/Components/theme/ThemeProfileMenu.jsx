import React, { useEffect, useRef, useState } from 'react'
import { Box, Button, Text } from '@chakra-ui/react'
import { useTheme } from 'next-themes'
import { profileMenuStyles } from '../../styles/siteShellStyles'

const GearIcon = () => (
  <Box
    as="svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...profileMenuStyles.inlineIcon}
  >
    <path d="M12 8.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7Z" />
    <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1.9 1.9 0 0 1 0 2.7a1.9 1.9 0 0 1-2.7 0l-.1-.1a1 1 0 0 0-1.1-.2a1 1 0 0 0-.6.9V20a2 2 0 0 1-4 0v-.2a1 1 0 0 0-.7-.9a1 1 0 0 0-1 .2l-.2.1a1.9 1.9 0 0 1-2.7 0a1.9 1.9 0 0 1 0-2.7l.1-.1a1 1 0 0 0 .2-1.1a1 1 0 0 0-.9-.6H4a2 2 0 0 1 0-4h.2a1 1 0 0 0 .9-.7a1 1 0 0 0-.2-1l-.1-.2a1.9 1.9 0 0 1 0-2.7a1.9 1.9 0 0 1 2.7 0l.1.1a1 1 0 0 0 1.1.2h.1a1 1 0 0 0 .6-.9V4a2 2 0 0 1 4 0v.2a1 1 0 0 0 .6.9a1 1 0 0 0 1.1-.2l.1-.1a1.9 1.9 0 0 1 2.7 0a1.9 1.9 0 0 1 0 2.7l-.1.2a1 1 0 0 0-.2 1a1 1 0 0 0 .9.7h.2a2 2 0 0 1 0 4h-.2a1 1 0 0 0-.9.6Z" />
  </Box>
)

const ThemeProfileMenu = () => {
  const { resolvedTheme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false)
        setShowSettings(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [])

  const isDark = (resolvedTheme ?? 'dark') !== 'light'

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <Box ref={menuRef} {...profileMenuStyles.wrapper}>
      <Box
        as="button"
        type="button"
        aria-label="Open profile settings"
        onClick={() => setOpen((current) => !current)}
        {...profileMenuStyles.trigger}
      >
        <Box {...profileMenuStyles.avatarHead} />
        <Box {...profileMenuStyles.avatarBody} />
      </Box>

      {open ? (
        <Box {...profileMenuStyles.panel}>
          <Text {...profileMenuStyles.panelTitle}>Profile</Text>
          <Text {...profileMenuStyles.panelCopy}>
            Appearance and session controls for your workspace.
          </Text>

          <Button
            type="button"
            onClick={() => setShowSettings((current) => !current)}
            {...profileMenuStyles.settingsButton}
          >
            <GearIcon />
            <Text as="span">Settings</Text>
          </Button>

          {showSettings ? (
            <Box {...profileMenuStyles.settingsPanel}>
              <Box>
                <Text {...profileMenuStyles.settingsTitle}>Dark mode</Text>
                <Text {...profileMenuStyles.settingsCopy}>
                  Keep the night climb on by default.
                </Text>
              </Box>

              <Box
                as="button"
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? 'Disable dark mode' : 'Enable dark mode'}
                aria-pressed={isDark}
                {...profileMenuStyles.switchTrack}
              >
                <Box
                  {...profileMenuStyles.switchThumb}
                  transform={isDark ? 'translateX(1.5rem)' : 'translateX(0)'}
                />
              </Box>
            </Box>
          ) : null}
        </Box>
      ) : null}
    </Box>
  )
}

export default ThemeProfileMenu
