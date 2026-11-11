import nodemailer from 'nodemailer'

let transporter = null
let transporterKey = ''

function getTransporter() {
  const user = process.env.EMAIL_USER || ''
  const pass = process.env.EMAIL_APP_PASSWORD || ''
  if (!user || !pass) return null
  const key = `${user}\n${pass}`
  if (!transporter || transporterKey !== key) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    })
    transporterKey = key
  }
  return transporter
}

export async function sendApplicationEmail({ name, email, type, summary }) {
  const t = getTransporter()
  if (!t) throw new Error('Email is not configured on the server yet')
  const inbox = process.env.CONTACT_TO || process.env.EMAIL_USER
  const who = type === 'trainer' ? 'trainer' : 'volunteer'
  await t.sendMail({
    from: `"StreetSmarter" <${process.env.EMAIL_USER}>`,
    to: email,
    bcc: inbox,
    replyTo: inbox,
    subject: type === 'trainer' ? 'We received your trainer application' : 'We received your volunteer application',
    text: `Hi ${name},\n\nThank you for signing up as a ${who} with StreetSmarter. We have your details and will write back to this email.\n\n${summary}\n\nStreetSmarter\nBecause no one taught us this stuff`,
  })
}

export async function sendContactEmail({ name, email, message }) {
  const t = getTransporter()
  if (!t) throw new Error('Email is not configured on the server yet')
  await t.sendMail({
    from: `"StreetSmarter website" <${process.env.EMAIL_USER}>`,
    to: process.env.CONTACT_TO || process.env.EMAIL_USER,
    replyTo: email,
    subject: `New contact form message from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
  })
}
