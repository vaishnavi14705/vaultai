import bcrypt from 'bcryptjs'
import { db, save, uid } from './db.js'
import { chunk } from './ingest.js'

const SAMPLE = [
  { assistant: ['HR Helper', 'HR', '🧑‍💼', 'Policies and benefits'], docs: [
    ['HR_Handbook.pdf', [
      [4, 'Working Hours. Standard working hours are 9:30 AM to 6:30 PM, Monday to Friday. Employees may work remotely up to two days per week with manager approval.'],
      [12, 'Leave Policy. Every full-time employee receives 24 paid leave days per calendar year. Up to 5 unused leave days can be carried forward to the next year. Sick leave is 10 days per year and requires a medical certificate for absences longer than 3 days. Maternity leave is 26 weeks and paternity leave is 2 weeks.'],
    ]],
    ['Expense_Policy.docx', [[1, 'Expense Claims. Submit expense claims within 30 days of purchase through the finance portal with receipts attached. Meals during business travel are reimbursed up to 1,500 rupees per day. Claims above 10,000 rupees need director approval.']]],
  ]},
  { assistant: ['IT Support Bot', 'IT', '🛠️', 'Troubleshooting guides'], docs: [
    ['IT_Guide.pdf', [
      [3, 'VPN Setup. Install the company VPN client from the IT portal, sign in with your work email and approve the multi-factor prompt. If the VPN does not connect, restart the client and check that your system clock is correct. Contact the IT helpdesk at helpdesk@company.com if the problem continues.'],
      [7, 'Password Policy. Passwords must have at least 12 characters and be changed every 90 days. Never share your password. Report lost laptops to IT within 24 hours.'],
    ]],
  ]},
]
const QUESTIONS = ['What is the leave policy?', 'How do I claim expenses?', 'How do I reset my VPN?', 'What are the working hours?', 'What is the password policy?']

export function seedDemo() {
  if (db.users.some((u) => u.email === 'demo@vaultai.com')) return
  const user = { id: uid(), name: 'Demo User', email: 'demo@vaultai.com', passwordHash: bcrypt.hashSync('demo12345', 10) }
  db.users.push(user)
  const assistantIds = []
  for (const s of SAMPLE) {
    const [name, dept, avatar, desc] = s.assistant
    const a = { id: uid(), userId: user.id, name, dept, avatar, desc, createdAt: Date.now() }
    db.assistants.push(a)
    assistantIds.push(a.id)
    for (const [docName, pages] of s.docs) {
      const sections = pages.map(([page, text]) => ({ page, text }))
      db.documents.push({ id: uid(), userId: user.id, assistantId: a.id, name: docName, size: 180000 + Math.floor(Math.random() * 900000), type: docName.split('.').pop(), uploadedAt: Date.now() - Math.random() * 3e8, chunks: chunk(sections) })
    }
  }
  // Fake history so the analytics chart looks realistic
  for (let i = 0; i < 60; i++) {
    db.chats.push({ id: uid(), userId: user.id, assistantId: assistantIds[i % 2], question: QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)], at: Date.now() - Math.floor(Math.random() * 6.5 * 864e5) })
  }
  save()
  console.log('Seeded demo account: demo@vaultai.com / demo12345')
}
