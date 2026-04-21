import React from 'react'
import { Box, Text } from '@chakra-ui/react'
import { mountainStageStyles } from '../../styles/homeStyles'

const MountainStage = () => {
  return (
    <Box aria-hidden="true" {...mountainStageStyles.wrapper}>
      <Box as="article" {...mountainStageStyles.forecastCard}>
        <Text as="span" {...mountainStageStyles.kicker}>
          Current forecast
        </Text>
        <Text as="strong" {...mountainStageStyles.cardTitle}>
          Demand updraft
        </Text>
        <Text {...mountainStageStyles.cardBody}>
          Positioning, distribution, and AI tooling aligned in one climb.
        </Text>
      </Box>

      <Box as="article" {...mountainStageStyles.altitudeCard}>
        <Text as="span" {...mountainStageStyles.kicker}>
          Summit marker
        </Text>
        <Text as="strong" {...mountainStageStyles.cardTitle}>
          Go-to-market systems with product intelligence
        </Text>
      </Box>

      <Box {...mountainStageStyles.scape}>
        <Box {...mountainStageStyles.layerFour} />
        <Box {...mountainStageStyles.layerThree} />
        <Box {...mountainStageStyles.layerTwo} />
        <Box {...mountainStageStyles.layerOne} />
        <Box {...mountainStageStyles.ridgeTrail} />
        <Box {...mountainStageStyles.campLight} />
      </Box>
    </Box>
  )
}

export default MountainStage
