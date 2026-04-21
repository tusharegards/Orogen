import React from 'react'
import { Box, Heading, Text } from '@chakra-ui/react'
import { sectionHeadingStyles } from '../../styles/homeStyles'

const SectionHeading = ({ eyebrow, title, maxWidth = '46rem' }) => {
  return (
    <Box {...sectionHeadingStyles.wrapper} maxW={maxWidth}>
      <Text {...sectionHeadingStyles.eyebrow}>{eyebrow}</Text>
      <Heading as="h2" {...sectionHeadingStyles.title}>
        {title}
      </Heading>
    </Box>
  )
}

export default SectionHeading
