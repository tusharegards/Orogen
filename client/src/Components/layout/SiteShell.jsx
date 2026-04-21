import React from 'react'
import { Box } from '@chakra-ui/react'
import ThemeProfileMenu from '../theme/ThemeProfileMenu'
import { shellStyles } from '../../styles/siteShellStyles'

const SiteShell = ({ children }) => {
  return (
    <Box {...shellStyles.wrapper}>
      <ThemeProfileMenu />
      <Box {...shellStyles.content}>{children}</Box>
    </Box>
  )
}

export default SiteShell
