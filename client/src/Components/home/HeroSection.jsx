import React from 'react'
import {
  Box,
  Button,
  Grid,
  Heading,
  Link,
  SimpleGrid,
  Text,
} from '@chakra-ui/react'
import { signalCards } from './content'
import MountainStage from './MountainStage'
import {
  heroStyles,
  layoutStyles,
  signalCardStyles,
  buttonStyles,
} from '../../styles/homeStyles'
import HomeNavbar from './HomeNavbar'

const HeroSection = () => {
  return (
    <Box as="section" {...layoutStyles.heroShell}>
      <Box aria-hidden="true" {...heroStyles.backdrop}>
        <Box {...heroStyles.orbOne} />
        <Box {...heroStyles.orbTwo} />
        <Box {...heroStyles.gridHaze} />
      </Box>

      <HomeNavbar />

      <Grid {...heroStyles.grid} id="top">
        <Box {...heroStyles.copy}>
          <Text {...heroStyles.eyebrow}>Mountain formation for modern startups</Text>
          <Heading as="h1" {...heroStyles.title}>
            We help founders carve growth.
          </Heading>
          <Text {...heroStyles.description}>
            Orogen blends strategic marketing with practical AI execution. The
            result is a sharper position, stronger launch systems, and internal
            tools that let small teams move like larger ones.
          </Text>

          <Box {...heroStyles.actions}>
            <Button as={Link} href="#contact" {...buttonStyles.primary}>
              Start the ascent
            </Button>
            <Button as={Link} href="#services" {...buttonStyles.secondary}>
              Explore the formation
            </Button>
          </Box>

          <SimpleGrid {...heroStyles.signalGrid}>
            {signalCards.map((card) => (
              <Box as="article" key={card.label} {...signalCardStyles.card}>
                <Text as="strong" {...signalCardStyles.value}>
                  {card.value}
                </Text>
                <Text {...signalCardStyles.label}>{card.label}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        <MountainStage />
      </Grid>
    </Box>
  )
}

export default HeroSection
