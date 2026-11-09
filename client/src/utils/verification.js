// Only shows what has really been checked (SRS rule BR-10)
export function verificationChips(v = {}) {
  const chips = []
  if (v.phone) chips.push('Phone verified')
  if (v.email) chips.push('Email verified')
  if (v.community === 'verified') chips.push('Community verified')
  else if (v.community === 'pending') chips.push('Community check pending')
  return chips
}