import React from 'react'
import { Box, SimpleGrid, Text } from '@chakra-ui/react'
import { serviceCards } from './content'
import SectionHeading from './SectionHeading'
import { cardGridStyles, cardStyles, layoutStyles } from '../../styles/homeStyles'

const ServicesSection = () => {
  return (
    <Box as="section" id="services" {...layoutStyles.section}>
      <Box {...layoutStyles.shell}>
        <SectionHeading
          eyebrow="Services"
          title="Three layers of growth, shaped like a mountain range."
        />

        <SimpleGrid {...cardGridStyles.services}>
          {serviceCards.map((card) => (
            <Box as="article" key={card.title} {...cardStyles.service}>
              <Text as="span" {...cardStyles.kicker}>
                {card.label}
              </Text>
              <Text as="h3" {...cardStyles.title}>
                {card.title}
              </Text>
              <Text {...cardStyles.body}>{card.description}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  )
}

export default ServicesSection
