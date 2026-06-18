const glassPanel = {
  border: '1px solid',
  borderColor: 'var(--surface-line)',
  bg: 'var(--surface-card)',
  backdropFilter: 'blur(16px)',
  boxShadow: 'var(--shadow)',
  borderRadius: '2xl',
}

export const dashboardStyles = {
  pageWrapper: {
    minH: '100vh',
    position: 'relative',
    pt: { base: '20', md: '24' },
    pb: '16',
    px: { base: '4', md: '8' },
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0,
    overflow: 'hidden',
  },
  orbOne: {
    position: 'absolute',
    top: '-10%',
    left: '10%',
    w: '30rem',
    h: '30rem',
    borderRadius: 'full',
    filter: 'blur(120px)',
    bg: 'var(--orb-one)',
    opacity: 0.45,
  },
  orbTwo: {
    position: 'absolute',
    bottom: '-10%',
    right: '10%',
    w: '35rem',
    h: '35rem',
    borderRadius: 'full',
    filter: 'blur(120px)',
    bg: 'var(--orb-two)',
    opacity: 0.3,
  },
  gridHaze: {
    position: 'absolute',
    inset: 0,
    bgImage:
      'linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)',
    bgSize: '60px 60px',
    maskImage: 'radial-gradient(circle at 50% 50%, black, transparent 85%)',
    opacity: 0.12,
  },
  container: {
    position: 'relative',
    zIndex: 1,
    maxW: '1120px',
    mx: 'auto',
    w: '100%',
  },
  
  // Login Specific
  loginCard: {
    ...glassPanel,
    maxW: 'md',
    mx: 'auto',
    p: { base: '8', md: '10' },
    mt: '12',
  },
  loginTitle: {
    fontFamily: 'heading',
    fontSize: '3xl',
    textAlign: 'center',
    mb: '2',
    letterSpacing: '-0.02em',
  },
  loginSubtitle: {
    color: 'var(--text-soft)',
    fontSize: 'sm',
    textAlign: 'center',
    mb: '8',
  },

  // Common Header
  navHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '4',
    mb: '10',
    pb: '6',
    borderBottom: '1px solid var(--surface-line)',
  },
  userEmail: {
    color: 'var(--text-soft)',
    fontSize: 'sm',
    fontWeight: '500',
  },
  logoutBtn: {
    size: 'sm',
    px: '4',
    borderRadius: 'full',
    border: '1px solid var(--surface-line)',
    bg: 'var(--secondary-surface)',
    color: 'var(--text-main)',
    _hover: {
      bg: 'var(--secondary-surface-hover)',
      transform: 'translateY(-1px)',
    },
  },

  // Main Dashboard Title
  dashTitle: {
    fontFamily: 'heading',
    fontSize: { base: '3xl', md: '4xl' },
    letterSpacing: '-0.02em',
    mb: '2',
  },
  dashSub: {
    color: 'var(--text-muted)',
    fontSize: 'sm',
    mb: '8',
  },

  // Form Section (Employee logging)
  formCard: {
    ...glassPanel,
    p: '6',
    mb: '10',
  },
  formGrid: {
    columns: { base: 1, md: 3 },
    gap: '5',
    alignItems: 'end',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2',
  },
  formLabel: {
    fontSize: 'xs',
    fontWeight: '700',
    color: 'var(--accent-soft)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  input: {
    bg: 'rgba(0, 0, 0, 0.25)',
    border: '1px solid var(--surface-line)',
    borderRadius: 'xl',
    h: '2.8rem',
    px: '4',
    color: 'var(--text-main)',
    width: '100%',
    outline: 'none',
    transition: 'border-color 180ms ease, box-shadow 180ms ease',
    _focus: {
      borderColor: 'var(--accent)',
      boxShadow: '0 0 0 1px var(--accent)',
    },
  },
  submitBtn: {
    h: '2.8rem',
    px: '6',
    w: '100%',
    borderRadius: 'xl',
    bg: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)',
    color: 'var(--accent-contrast)',
    fontWeight: '700',
    boxShadow: 'var(--shadow-soft)',
    _hover: {
      filter: 'brightness(1.05)',
      transform: 'translateY(-1px)',
    },
    _active: {
      transform: 'translateY(0)',
    },
  },

  // Tables
  tableCard: {
    ...glassPanel,
    p: { base: '4', md: '6' },
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0',
    textAlign: 'left',
  },
  th: {
    fontSize: 'xs',
    fontWeight: '700',
    color: 'var(--accent-soft)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    pb: '4',
    borderBottom: '1px solid var(--surface-line)',
    px: '4',
  },
  td: {
    fontSize: 'sm',
    color: 'var(--text-soft)',
    py: '4',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    px: '4',
    verticalAlign: 'middle',
  },
  tr: {
    _hover: {
      bg: 'rgba(255, 255, 255, 0.015)',
    },
  },

  // Analytics Panel (Admin view)
  statsGrid: {
    columns: { base: 1, md: 3 },
    gap: '6',
    mb: '10',
  },
  statCard: {
    ...glassPanel,
    p: '6',
    display: 'flex',
    flexDirection: 'column',
    gap: '2',
    transition: 'transform 200ms ease',
    _hover: {
      transform: 'translateY(-2px)',
    },
  },
  statValue: {
    fontFamily: 'heading',
    fontSize: '4xl',
    color: 'var(--accent)',
    lineHeight: '1',
  },
  statLabel: {
    color: 'var(--text-muted)',
    fontSize: 'xs',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  
  // Filtering in Admin
  filterRow: {
    display: 'flex',
    gap: '4',
    mb: '6',
    flexDirection: { base: 'column', md: 'row' },
  },
  searchField: {
    flex: '1',
  },
}
