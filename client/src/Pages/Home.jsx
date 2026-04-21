import React from 'react'
import { Box } from '@chakra-ui/react'
import ContactSection from '../Components/home/ContactSection'
import FormationBand from '../Components/home/FormationBand'
import HeroSection from '../Components/home/HeroSection'
import OutcomeSection from '../Components/home/OutcomeSection'
import ProcessSection from '../Components/home/ProcessSection'
import ServicesSection from '../Components/home/ServicesSection'
import { layoutStyles } from '../styles/homeStyles'

const Home = () => {
  return (
    <Box as="main" {...layoutStyles.page}>
      <HeroSection />
      <FormationBand />
      <ServicesSection />
      <ProcessSection />
      <OutcomeSection />
      <ContactSection />
    </Box>
  )
}

export default Home
