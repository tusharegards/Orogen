import React from 'react'
import { SimpleGrid, Text } from '@chakra-ui/react'
import { formationBandCopy } from './content'
import { formationBandStyles, layoutStyles } from '../../styles/homeStyles'

const FormationBand = () => {
  return (
    <SimpleGrid as="section" {...layoutStyles.shell} {...formationBandStyles.wrapper}>
      {formationBandCopy.map((copy) => (
        <Text key={copy} {...formationBandStyles.copy}>
          {copy}
        </Text>
      ))}
    </SimpleGrid>
  )
}

export default FormationBand
