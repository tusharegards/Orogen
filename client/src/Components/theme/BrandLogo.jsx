import React from 'react'
import { Box, Image, Link } from '@chakra-ui/react'
import { useTheme } from 'next-themes'
import darkLogo from '../../assets/Logo/Orogen_logo_dark.PNG'
import lightLogo from '../../assets/Logo/Orogen_logo_light.PNG'
import { brandLogoStyles } from '../../styles/siteShellStyles'

const BrandLogo = ({ href = '#top' }) => {
  const { resolvedTheme } = useTheme()
  const activeTheme = resolvedTheme ?? 'dark'
  const logoSrc = activeTheme === 'light' ? lightLogo : darkLogo

  return (
    <Link href={href} {...brandLogoStyles.link}>
      <Box {...brandLogoStyles.frame}>
        <Image
          src={logoSrc}
          alt="Orogen"
          {...brandLogoStyles.image}
        />
      </Box>
    </Link>
  )
}

export default BrandLogo
