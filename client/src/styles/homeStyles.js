const glassPanel = {
  border: '1px solid',
  borderColor: 'var(--surface-line)',
  bg: 'var(--surface-card)',
  backdropFilter: 'blur(14px)',
  boxShadow: 'var(--shadow)',
}

export const layoutStyles = {
  shell: {
    w: { base: 'calc(100% - 1.25rem)', md: 'min(1160px, calc(100% - 2rem))' },
    mx: 'auto',
  },
  page: {
    overflow: 'hidden',
    minH: '100vh',
    color: 'var(--text-main)',
  },
  heroShell: {
    position: 'relative',
    w: { base: 'calc(100% - 1.25rem)', md: 'min(1160px, calc(100% - 2rem))' },
    mx: 'auto',
    pt: { base: '5', md: '6' },
    pb: { base: '16', md: '20' },
  },
  section: {
    py: { base: '12', md: '16' },
  },
}

export const navStyles = {
  wrapper: {
    align: { base: 'flex-start', lg: 'center' },
    direction: { base: 'column', lg: 'row' },
    justify: 'space-between',
    gap: '6',
    pb: { base: '10', md: '11' },
    pr: { base: '4.2rem', md: '5rem' },
    position: 'relative',
    zIndex: '1',
  },
  brandLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3.5',
  },
  brandMark: {
    display: 'grid',
    placeItems: 'center',
    w: '11',
    h: '11',
    borderRadius: 'full',
    border: '1px solid var(--surface-line)',
    bg: 'var(--secondary-surface)',
    color: 'var(--accent-soft)',
    fontFamily: 'heading',
    fontSize: 'xl',
  },
  brandName: {
    display: 'block',
    fontSize: 'sm',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  brandTagline: {
    color: 'var(--text-muted)',
    fontSize: 'xs',
  },
  linkList: {
    gap: { base: '4', md: '5' },
    flexWrap: 'wrap',
    color: 'var(--text-main)',
    fontSize: 'sm',
  },
  link: {
    position: 'relative',
    display: 'inline-flex',
    color: 'var(--text-main)',
    fontWeight: '500',
    pb: '1',
    _after: {
      content: '""',
      position: 'absolute',
      left: 0,
      bottom: 0,
      w: '100%',
      h: '1px',
      bg: 'var(--accent)',
      transform: 'scaleX(0)',
      transformOrigin: 'left',
      transition: 'transform 180ms ease',
    },
    _hover: {
      color: 'var(--accent-soft)',
      _after: {
        transform: 'scaleX(1)',
      },
    },
  },
}

export const heroStyles = {
  backdrop: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0,
  },
  orbOne: {
    position: 'absolute',
    top: '3rem',
    right: '8%',
    w: '14rem',
    h: '14rem',
    borderRadius: 'full',
    filter: 'blur(14px)',
    bg: 'var(--orb-one)',
  },
  orbTwo: {
    position: 'absolute',
    left: 0,
    top: '14rem',
    w: '20rem',
    h: '20rem',
    borderRadius: 'full',
    filter: 'blur(14px)',
    bg: 'var(--orb-two)',
  },
  gridHaze: {
    position: 'absolute',
    inset: '4rem 0 auto',
    h: '26rem',
    bgImage:
      'linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)',
    bgSize: '54px 54px',
    maskImage: 'linear-gradient(180deg, rgba(0, 0, 0, 0.55), transparent 92%)',
    opacity: 0.18,
  },
  grid: {
    position: 'relative',
    zIndex: '1',
    templateColumns: { base: '1fr', lg: 'minmax(0, 1.1fr) minmax(320px, 0.9fr)' },
    gap: '8',
    alignItems: 'center',
  },
  copy: {
    py: { base: '4', md: '6' },
  },
  eyebrow: {
    mb: '4',
    color: 'var(--accent-soft)',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    fontSize: 'xs',
  },
  title: {
    maxW: '11ch',
    fontFamily: 'heading',
    lineHeight: 0.96,
    letterSpacing: '-0.03em',
    fontSize: { base: '4xl', md: '6xl', xl: '8xl' },
  },
  description: {
    maxW: '36rem',
    mt: '6',
    color: 'var(--text-soft)',
    lineHeight: 1.7,
    fontSize: 'md',
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4',
    mt: '8',
  },
  signalGrid: {
    columns: { base: 1, md: 3 },
    gap: '4',
    maxW: '42rem',
    mt: '9',
  },
}

export const buttonStyles = {
  primary: {
    minH: '3.15rem',
    px: '5',
    borderRadius: 'full',
    bg: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)',
    color: 'var(--accent-contrast)',
    fontWeight: '700',
    boxShadow: 'var(--shadow-soft)',
    _hover: {
      transform: 'translateY(-2px)',
      bg: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)',
      filter: 'brightness(1.04)',
    },
  },
  secondary: {
    minH: '3.15rem',
    px: '5',
    borderRadius: 'full',
    border: '1px solid var(--surface-line)',
    bg: 'var(--secondary-surface)',
    color: 'var(--text-main)',
    _hover: {
      transform: 'translateY(-2px)',
      bg: 'var(--secondary-surface-hover)',
    },
  },
  inline: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    w: 'fit-content',
    minH: '2.9rem',
    px: '4.5',
    borderRadius: 'full',
    border: '1px solid var(--surface-line)',
    bg: 'var(--secondary-surface)',
    color: 'var(--text-main)',
    _hover: {
      transform: 'translateY(-2px)',
      bg: 'var(--secondary-surface-hover)',
    },
  },
}

export const signalCardStyles = {
  card: {
    ...glassPanel,
    display: 'flex',
    flexDirection: 'column',
    gap: '2',
    p: '4.5',
    borderRadius: 'xl',
  },
  value: {
    fontFamily: 'heading',
    fontSize: '4xl',
    color: 'var(--accent-soft)',
    lineHeight: 1,
  },
  label: {
    color: 'var(--text-soft)',
  },
}

export const mountainStageStyles = {
  wrapper: {
    position: 'relative',
    minH: { base: '28rem', md: '32rem', lg: '38rem' },
  },
  forecastCard: {
    ...glassPanel,
    position: { base: 'relative', md: 'absolute' },
    top: { md: '2rem' },
    left: { md: 0 },
    maxW: { md: '15rem' },
    mb: { base: '4', md: 0 },
    p: '4.5',
    borderRadius: '2xl',
    zIndex: 3,
  },
  altitudeCard: {
    ...glassPanel,
    position: { base: 'relative', md: 'absolute' },
    right: { md: 0 },
    top: { md: '7.5rem' },
    bottom: { base: 'auto', lg: 'auto' },
    maxW: { md: '16rem' },
    mb: { base: '4', md: 0 },
    p: '5',
    borderRadius: '2xl',
    zIndex: 3,
  },
  kicker: {
    display: 'inline-block',
    color: 'var(--accent-soft)',
    fontSize: 'xs',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  cardTitle: {
    display: 'block',
    mt: '2.5',
    fontSize: 'xl',
  },
  cardBody: {
    mt: '3',
    color: 'var(--text-soft)',
    lineHeight: 1.6,
  },
  scape: {
    position: { base: 'relative', md: 'absolute' },
    inset: { md: 'auto 0 0' },
    h: { base: '22rem', md: '34rem' },
    borderRadius: '2rem',
    overflow: 'hidden',
    bg: 'var(--mountain-scape-bg)',
    border: '1px solid var(--surface-line)',
    boxShadow: 'var(--shadow)',
  },
  layerFour: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    h: '60%',
    bg: 'var(--mountain-layer-four)',
    clipPath: 'polygon(0 100%, 20% 58%, 34% 68%, 48% 48%, 65% 66%, 82% 32%, 100% 100%)',
  },
  layerThree: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    h: '66%',
    bg: 'var(--mountain-layer-three)',
    clipPath: 'polygon(0 100%, 14% 78%, 31% 42%, 47% 65%, 60% 37%, 74% 56%, 88% 27%, 100% 100%)',
  },
  layerTwo: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    h: '74%',
    bg: 'var(--mountain-layer-two)',
    clipPath: 'polygon(0 100%, 10% 80%, 26% 57%, 41% 24%, 58% 63%, 73% 39%, 90% 58%, 100% 100%)',
  },
  layerOne: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    h: '86%',
    bg: 'var(--mountain-layer-one)',
    clipPath: 'polygon(0 100%, 15% 88%, 30% 63%, 42% 44%, 55% 12%, 70% 54%, 82% 36%, 100% 100%)',
  },
  ridgeTrail: {
    position: 'absolute',
    inset: '26% auto auto 51%',
    w: '2px',
    h: '48%',
    bg: 'linear-gradient(180deg, color-mix(in srgb, var(--accent-soft) 75%, transparent), transparent)',
    transform: 'rotate(18deg)',
    transformOrigin: 'top',
  },
  campLight: {
    position: 'absolute',
    left: '61%',
    bottom: '31%',
    w: '0.9rem',
    h: '0.9rem',
    borderRadius: 'full',
    bg: 'var(--accent-soft)',
    boxShadow: '0 0 0 10px color-mix(in srgb, var(--accent-soft) 12%, transparent), 0 0 28px color-mix(in srgb, var(--accent-soft) 82%, transparent)',
  },
}

export const formationBandStyles = {
  wrapper: {
    columns: { base: 1, lg: 2 },
    gap: { base: '4', lg: '12' },
    py: '6',
    px: { base: '4', md: '6' },
    mb: '6',
    borderTop: '1px solid rgba(247, 216, 172, 0.1)',
    borderBottom: '1px solid rgba(247, 216, 172, 0.1)',
  },
  copy: {
    color: 'var(--text-soft)',
    lineHeight: 1.7,
  },
}

export const sectionHeadingStyles = {
  wrapper: {
    display: 'grid',
    gap: '3',
    mb: '7',
  },
  eyebrow: {
    color: 'var(--accent-soft)',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    fontSize: 'xs',
  },
  title: {
    fontFamily: 'heading',
    lineHeight: 0.96,
    letterSpacing: '-0.03em',
    fontSize: { base: '4xl', md: '6xl' },
  },
}

export const cardGridStyles = {
  services: {
    columns: { base: 1, md: 2, xl: 3 },
    gap: '5',
  },
  process: {
    columns: { base: 1, md: 2, xl: 4 },
    gap: '4',
  },
}

export const cardStyles = {
  service: {
    ...glassPanel,
    p: '6',
    borderRadius: '1.6rem',
  },
  process: {
    ...glassPanel,
    p: '6',
    borderRadius: '1.6rem',
  },
  kicker: {
    display: 'inline-block',
    color: '#f7d8ac',
    fontSize: 'xs',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  title: {
    mt: '3',
    mb: '3',
    fontSize: 'xl',
    fontWeight: '600',
    lineHeight: 1.3,
  },
  body: {
    color: 'var(--text-soft)',
    lineHeight: 1.7,
  },
}

export const processStyles = {
  section: {
    position: 'relative',
    _before: {
      content: '""',
      display: { base: 'none', xl: 'block' },
      position: 'absolute',
      left: 0,
      right: 0,
      top: '8.2rem',
      h: '1px',
      bg: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent-soft) 35%, transparent), transparent)',
    },
  },
}

export const outcomeStyles = {
  panel: {
    ...glassPanel,
    display: 'grid',
    gridTemplateColumns: { base: '1fr', lg: 'minmax(0, 1fr) minmax(0, 0.8fr)' },
    gap: '8',
    p: '8',
    borderRadius: '2rem',
    bg: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-soft) 12%, transparent), rgba(255, 255, 255, 0.02)), var(--surface-strong)',
  },
  eyebrow: {
    color: 'var(--accent-soft)',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    fontSize: 'xs',
    mb: '4',
  },
  title: {
    fontFamily: 'heading',
    lineHeight: 0.96,
    letterSpacing: '-0.03em',
    fontSize: { base: '4xl', md: '6xl' },
  },
  copyWrap: {
    display: 'grid',
    alignContent: 'center',
    gap: '4',
  },
  copy: {
    color: 'var(--text-soft)',
    lineHeight: 1.7,
  },
}

export const contactStyles = {
  card: {
    ...glassPanel,
    p: '8',
    borderRadius: '2rem',
    bg: 'radial-gradient(circle at top right, color-mix(in srgb, var(--accent) 18%, transparent), transparent 28%), var(--surface-strong)',
  },
  eyebrow: {
    color: 'var(--accent-soft)',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    fontSize: 'xs',
  },
  title: {
    mt: '3',
    fontFamily: 'heading',
    lineHeight: 0.96,
    letterSpacing: '-0.03em',
    fontSize: { base: '4xl', md: '6xl' },
  },
  copy: {
    mt: '5',
    color: 'var(--text-soft)',
    lineHeight: 1.7,
    maxW: '42rem',
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4',
    mt: '8',
  },
}
