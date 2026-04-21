import React from 'react'
import { Box, Heading, Link, Text } from '@chakra-ui/react'
import {
  buttonStyles,
  layoutStyles,
  outcomeStyles,
} from '../../styles/homeStyles'

const OutcomeSection = () => {
  return (
    <Box as="section" {...layoutStyles.section} pt={{ base: '4', md: '6' }}>
      <Box {...layoutStyles.shell}>
        <Box {...outcomeStyles.panel}>
          <Box>
            <Text {...outcomeStyles.eyebrow}>Why it works</Text>
            <Heading as="h2" {...outcomeStyles.title}>
              Most teams separate marketing from product intelligence. That slows
              the climb.
            </Heading>
          </Box>

          <Box {...outcomeStyles.copyWrap}>
            <Text {...outcomeStyles.copy}>
              Orogen ties narrative, acquisition, and AI operations into one
              system. Founders get clearer messaging for the outside world and
              better internal leverage for the team building it.
            </Text>
            <Link href="#contact" {...buttonStyles.inline}>
              Plan your next launch
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default OutcomeSection
