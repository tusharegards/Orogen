import React from 'react'
import { Box, SimpleGrid, Text } from '@chakra-ui/react'
import { climbPlan } from './content'
import SectionHeading from './SectionHeading'
import {
  cardGridStyles,
  cardStyles,
  layoutStyles,
  processStyles,
} from '../../styles/homeStyles'

const ProcessSection = () => {
  return (
    <Box as="section" id="process" {...layoutStyles.section} {...processStyles.section}>
      <Box {...layoutStyles.shell}>
        <SectionHeading
          eyebrow="Process"
          title="We treat startup growth like route design, not guesswork."
        />

        <SimpleGrid {...cardGridStyles.process}>
          {climbPlan.map((item) => (
            <Box as="article" key={item.step} {...cardStyles.process}>
              <Text as="span" {...cardStyles.kicker}>
                {item.step}
              </Text>
              <Text as="h3" {...cardStyles.title}>
                {item.title}
              </Text>
              <Text {...cardStyles.body}>{item.description}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  )
}

export default ProcessSection
