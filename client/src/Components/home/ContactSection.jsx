import React from 'react'
import { Box, Button, Heading, Link, Text } from '@chakra-ui/react'
import { buttonStyles, contactStyles, layoutStyles } from '../../styles/homeStyles'

const ContactSection = () => {
  return (
    <Box as="section" id="contact" {...layoutStyles.section} pt={{ base: '8', md: '10' }} pb={{ base: '16', md: '20' }}>
      <Box {...layoutStyles.shell}>
        <Box {...contactStyles.card}>
          <Text {...contactStyles.eyebrow}>Contact</Text>
          <Heading as="h2" {...contactStyles.title}>
            Ready to give your startup a higher ridge line?
          </Heading>
          <Text {...contactStyles.copy}>
            Use this homepage as the front door for strategy, launches, and AI
            tooling. When you are ready, wire this section to your live form,
            booking flow, or CRM.
          </Text>

          <Box {...contactStyles.actions}>
            <Button as={Link} href="mailto:tushar@orogen.in" {...buttonStyles.primary}>
              tushar@orogen.in
            </Button>
            <Button as={Link} href="#top" {...buttonStyles.secondary}>
              Back to summit
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default ContactSection
