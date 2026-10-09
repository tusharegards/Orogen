import validator from 'validator'
import dns from 'dns/promises'

// List of disposable / temporary email domains to block
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'trashmail.com',
  'yopmail.com',
  'dispostable.com',
  'getairmail.com',
  'sharklasers.com',
  'maildrop.cc',
  'fake.com',
  'test.com',
  'invalid.com',
  'asdf.com',
  'example.com',
])

export const validateRealEmail = async (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, reason: 'Email address is required.' }
  }

  const normalizedEmail = email.toLowerCase().trim()

  // 1. Syntax check using validator.isEmail
  if (!validator.isEmail(normalizedEmail)) {
    return { valid: false, reason: 'Invalid email format. Please enter a valid email address (e.g. name@domain.com).' }
  }

  const parts = normalizedEmail.split('@')
  if (parts.length !== 2) {
    return { valid: false, reason: 'Invalid email format.' }
  }

  const [localPart, domain] = parts

  // 2. Check local part length and structure
  if (localPart.length === 0 || localPart.length > 64) {
    return { valid: false, reason: 'Invalid email username length.' }
  }

  // 3. Block known temporary/disposable domains
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, reason: `Disposable or temporary email provider '${domain}' is not allowed.` }
  }

  // Bypass DNS check for local dev/demo domain 'orogen.com'
  if (domain === 'orogen.com') {
    return { valid: true }
  }

  // 4. Perform real DNS MX Record lookup to verify real mail server exists
  try {
    const mxRecords = await Promise.race([
      dns.resolveMx(domain),
      new Promise((_, reject) => setTimeout(() => reject(new Error('DNS Timeout')), 3000)),
    ])

    if (!mxRecords || mxRecords.length === 0) {
      return { valid: false, reason: `The email domain '${domain}' has no valid mail servers configured to receive emails.` }
    }

    return { valid: true }
  } catch (err) {
    // If MX lookup fails (e.g., domain doesn't exist)
    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA' || err.code === 'SERVFAIL') {
      return { valid: false, reason: `The email domain '${domain}' does not exist or cannot receive emails.` }
    }

    // In case of network/DNS timeout, fallback to strict syntax check
    console.warn(`DNS lookup warning for ${domain}:`, err.message)
    return { valid: true }
  }
}
