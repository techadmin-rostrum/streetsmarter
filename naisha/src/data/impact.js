export const IMPACT_GROUPS = [
  { key: 'reach', title: 'Reach', blurb: 'Teenagers who sat in a session, and the schools and cities those sessions covered.', fields: [
    ['studentsTrained', 'Students trained'],
    ['schoolsVisited', 'Schools visited'],
    ['citiesCovered', 'Cities covered'],
  ]},
  { key: 'voterRegistration', title: 'Voter registration', blurb: 'Teenagers who started the process of getting on the electoral roll.', fields: [
    ['formsSubmitted', 'Forms submitted'],
    ['rollConfirmations', 'Names confirmed on the roll'],
  ]},
  { key: 'scholarships', title: 'Scholarships', blurb: 'Applications started after a session, and the money students actually received.', fields: [
    ['applications', 'Applications'],
    ['rupeeValue', 'Value applied for'],
    ['disbursements', 'Money received'],
  ]},
  { key: 'rti', title: 'Right to information', blurb: 'Questions filed with government offices, and the answers that came back.', fields: [
    ['filed', 'Requests filed'],
    ['responsesReceived', 'Replies received'],
    ['issuesResolved', 'Issues resolved'],
  ]},
  { key: 'digitalSafety', title: 'Digital safety', blurb: 'Reports filed when something went wrong online.', fields: [
    ['cybercrimeReports', 'Cybercrime reports'],
    ['scamComplaints', 'Scam complaints'],
  ]},
  { key: 'financialInclusion', title: 'Money basics', blurb: 'Bank accounts, PAN cards and DigiLocker set up with a guide in hand.', fields: [
    ['bankAccounts', 'Bank accounts'],
    ['panApplications', 'PAN applications'],
    ['digilockerActivations', 'DigiLocker activations'],
  ]},
]

export function formatImpact(groupKey, fieldKey, value) {
  const n = Number(value) || 0
  if (groupKey === 'scholarships' && (fieldKey === 'rupeeValue' || fieldKey === 'disbursements')) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
  }
  return new Intl.NumberFormat('en-IN').format(n)
}
