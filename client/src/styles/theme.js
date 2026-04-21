import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: {
          value:
            '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif',
        },
        body: {
          value: '"Avenir Next", "Trebuchet MS", "Segoe UI", sans-serif',
        },
      },
      colors: {
        forest: {
          950: { value: '#08110f' },
          900: { value: '#10211d' },
          800: { value: '#13231f' },
        },
        sand: {
          300: { value: '#f7d8ac' },
          400: { value: '#e8b978' },
        },
      },
    },
  },
  globalCss: {
    ':root': {
      '--page-bg-base': '#08110f',
      '--page-bg-gradient': 'linear-gradient(180deg, #13231f 0%, #08110f 46%, #060b0a 100%)',
      '--text-main': '#f2f1e8',
      '--text-soft': '#c6d2ca',
      '--text-muted': '#91a59a',
      '--accent': '#e8b978',
      '--accent-strong': '#c88e55',
      '--accent-soft': '#f7d8ac',
      '--accent-contrast': '#1a1207',
      '--surface-card': 'rgba(12, 28, 24, 0.72)',
      '--surface-strong': 'rgba(18, 37, 32, 0.92)',
      '--surface-line': 'rgba(188, 225, 206, 0.14)',
      '--secondary-surface': 'rgba(255, 255, 255, 0.03)',
      '--secondary-surface-hover': 'rgba(255, 255, 255, 0.06)',
      '--logo-frame-bg': 'rgba(8, 17, 15, 0.82)',
      '--profile-trigger-bg': 'rgba(12, 28, 24, 0.78)',
      '--profile-trigger-hover': 'rgba(18, 37, 32, 0.92)',
      '--shadow': '0 24px 80px rgba(0, 0, 0, 0.34)',
      '--shadow-soft': '0 18px 44px rgba(0, 0, 0, 0.22)',
      '--orb-one': 'radial-gradient(circle, rgba(232, 185, 120, 0.52) 0%, rgba(232, 185, 120, 0) 68%)',
      '--orb-two': 'radial-gradient(circle, rgba(104, 146, 126, 0.24) 0%, rgba(104, 146, 126, 0) 72%)',
      '--grid-line': 'rgba(255, 255, 255, 0.06)',
      '--mountain-scape-bg': 'linear-gradient(180deg, rgba(244, 192, 123, 0.18) 0%, rgba(10, 17, 15, 0) 35%), linear-gradient(180deg, #11211c 0%, #09110f 100%)',
      '--mountain-layer-four': 'linear-gradient(180deg, rgba(43, 70, 61, 0.2), rgba(43, 70, 61, 0.86))',
      '--mountain-layer-three': 'linear-gradient(180deg, rgba(48, 82, 70, 0.28), rgba(25, 43, 37, 0.96))',
      '--mountain-layer-two': 'linear-gradient(180deg, rgba(88, 129, 112, 0.24), rgba(16, 32, 27, 0.98))',
      '--mountain-layer-one': 'linear-gradient(180deg, rgba(238, 206, 160, 0.22) 0%, rgba(86, 123, 107, 0.22) 28%, rgba(8, 17, 15, 0.98) 78%), linear-gradient(120deg, rgba(255, 255, 255, 0.08), transparent 34%)',
      '--switch-track': 'rgba(232, 185, 120, 0.26)',
      '--switch-track-border': 'rgba(247, 216, 172, 0.32)',
      '--switch-thumb': '#f7d8ac',
    },
    'html[data-theme="light"]': {
      '--page-bg-base': '#f7f3ea',
      '--page-bg-gradient': 'linear-gradient(180deg, #f7f3ea 0%, #efe4d3 48%, #e2d3b9 100%)',
      '--text-main': '#132634',
      '--text-soft': '#415a66',
      '--text-muted': '#617482',
      '--accent': '#d58a2f',
      '--accent-strong': '#b66c1e',
      '--accent-soft': '#ab641c',
      '--accent-contrast': '#1a1207',
      '--surface-card': 'rgba(255, 250, 242, 0.78)',
      '--surface-strong': 'rgba(255, 249, 239, 0.92)',
      '--surface-line': 'rgba(19, 38, 52, 0.12)',
      '--secondary-surface': 'rgba(255, 255, 255, 0.5)',
      '--secondary-surface-hover': 'rgba(255, 255, 255, 0.72)',
      '--logo-frame-bg': 'rgba(255, 249, 239, 0.95)',
      '--profile-trigger-bg': 'rgba(255, 250, 242, 0.82)',
      '--profile-trigger-hover': 'rgba(255, 255, 255, 0.96)',
      '--shadow': '0 24px 60px rgba(92, 67, 35, 0.16)',
      '--shadow-soft': '0 16px 36px rgba(92, 67, 35, 0.12)',
      '--orb-one': 'radial-gradient(circle, rgba(234, 180, 88, 0.28) 0%, rgba(234, 180, 88, 0) 68%)',
      '--orb-two': 'radial-gradient(circle, rgba(88, 138, 121, 0.16) 0%, rgba(88, 138, 121, 0) 72%)',
      '--grid-line': 'rgba(19, 38, 52, 0.08)',
      '--mountain-scape-bg': 'linear-gradient(180deg, rgba(246, 197, 130, 0.26) 0%, rgba(234, 240, 244, 0.22) 35%), linear-gradient(180deg, #edf4f6 0%, #c8dbe1 100%)',
      '--mountain-layer-four': 'linear-gradient(180deg, rgba(93, 130, 119, 0.34), rgba(93, 130, 119, 0.76))',
      '--mountain-layer-three': 'linear-gradient(180deg, rgba(70, 111, 127, 0.28), rgba(47, 74, 88, 0.9))',
      '--mountain-layer-two': 'linear-gradient(180deg, rgba(116, 157, 145, 0.26), rgba(67, 96, 89, 0.95))',
      '--mountain-layer-one': 'linear-gradient(180deg, rgba(247, 213, 166, 0.72) 0%, rgba(141, 177, 159, 0.34) 28%, rgba(66, 92, 101, 0.96) 78%), linear-gradient(120deg, rgba(255, 255, 255, 0.2), transparent 34%)',
      '--switch-track': 'rgba(213, 138, 47, 0.22)',
      '--switch-track-border': 'rgba(182, 108, 30, 0.25)',
      '--switch-thumb': '#ffffff',
    },
    html: {
      scrollBehavior: 'smooth',
    },
    body: {
      margin: 0,
      minWidth: '320px',
      background: 'var(--page-bg-gradient)',
      color: 'var(--text-main)',
      fontFamily: 'body',
    },
    '#root': {
      minHeight: '100vh',
    },
    '*': {
      boxSizing: 'border-box',
    },
    a: {
      color: 'inherit',
      textDecoration: 'none',
    },
  },
})

const system = createSystem(defaultConfig, config)

export default system
