export const IMPACT_GROUPS = [
  { key: 'reach', title: 'Who we reached', blurb: 'Teenagers who sat in a session, and where those sessions were.', fields: [
    ['studentsTrained', 'Students in a session'],
    ['schoolsVisited', 'Schools visited'],
    ['citiesCovered', 'Cities covered'],
  ]},
  { key: 'voterRegistration', title: 'Voting', blurb: 'Teenagers who started getting on the voter roll.', fields: [
    ['formsSubmitted', 'Forms submitted'],
    ['rollConfirmations', 'Names confirmed on the roll'],
  ]},
  { key: 'scholarships', title: 'Scholarships', blurb: 'Applications started after a session, and the money that followed.', fields: [
    ['applications', 'Applications started'],
    ['rupeeValue', 'Money applied for'],
    ['disbursements', 'Money received'],
  ]},
  { key: 'rti', title: 'Right to information', blurb: 'Questions sent to a government office, and what came back.', fields: [
    ['filed', 'Requests filed'],
    ['responsesReceived', 'Replies received'],
    ['issuesResolved', 'Issues resolved'],
  ]},
  { key: 'digitalSafety', title: 'Digital safety', blurb: 'Reports filed when something went wrong online.', fields: [
    ['cybercrimeReports', 'Cybercrime reports'],
    ['scamComplaints', 'Scam complaints'],
  ]},
  { key: 'financialInclusion', title: 'Money basics', blurb: 'Accounts and documents set up with a guide in hand.', fields: [
    ['bankAccounts', 'Bank accounts opened'],
    ['panApplications', 'PAN applications'],
    ['digilockerActivations', 'DigiLocker set up'],
  ]},
]

export function formatImpact(groupKey, fieldKey, value) {
  const n = Number(value) || 0
  if (groupKey === 'scholarships' && (fieldKey === 'rupeeValue' || fieldKey === 'disbursements')) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
  }
  return new Intl.NumberFormat('en-IN').format(n)
}
