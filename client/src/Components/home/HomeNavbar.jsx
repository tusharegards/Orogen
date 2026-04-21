import React from 'react'
import { Box, Flex, HStack, Link } from '@chakra-ui/react'
import { navLinks } from './content'
import { navStyles } from '../../styles/homeStyles'
import BrandLogo from '../theme/BrandLogo'

const HomeNavbar = () => {
  return (
    <Flex as="nav" {...navStyles.wrapper}>
      <Box {...navStyles.brandLink}>
        <BrandLogo href="#top" />
      </Box>

      <HStack as="ul" {...navStyles.linkList}>
        {navLinks.map((item) => (
          <Box as="li" key={item.href} listStyleType="none">
            <Link href={item.href} {...navStyles.link}>
              {item.label}
            </Link>
          </Box>
        ))}
      </HStack>
    </Flex>
  )
}

export default HomeNavbar
