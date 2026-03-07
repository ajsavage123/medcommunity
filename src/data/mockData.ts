import { Room, Message, TrendingPost, User, Tool, SalaryPost, JobPost } from '@/types';

export const currentUser: User = {
  id: 'user-1',
  name: 'Arjun Mehta',
  role: 'verified',
  createdAt: new Date('2024-01-15'),
};

export const systemRooms: Room[] = [
  {
    id: 'room-general',
    name: 'General Discussion',
    description: 'General talk for EMTs and Paramedics',
    type: 'general',
    icon: 'MessageCircle',
    isSystem: true,
    memberCount: 2847,
    messageCount: 15632,
  },
  {
    id: 'room-salary',
    name: 'Salary & Pay',
    description: 'Anonymous salary discussions',
    type: 'salary',
    icon: 'DollarSign',
    isSystem: true,
    memberCount: 3521,
    messageCount: 8945,
    isAnonymous: true,
  },
  {
    id: 'room-career',
    name: 'Job Postings',
    description: 'Job postings, career guidance and opportunities',
    type: 'career',
    icon: 'Briefcase',
    isSystem: true,
    memberCount: 1892,
    messageCount: 4521,
  },
  {
    id: 'room-leadership',
    name: 'Leadership & Rights',
    description: 'EMT rights, policy, and labor discussions',
    type: 'leadership',
    icon: 'Shield',
    isSystem: true,
    memberCount: 1456,
    messageCount: 3287,
  },
  {
    id: 'room-entrepreneurship',
    name: 'Entrepreneurship',
    description: 'EMT-led business ideas and startups',
    type: 'entrepreneurship',
    icon: 'Rocket',
    isSystem: true,
    memberCount: 892,
    messageCount: 1654,
  },
  {
    id: 'room-certifications',
    name: 'Certifications',
    description: 'BLS, ACLS, ATLS, PHTLS, Prometric exams',
    type: 'certifications',
    icon: 'Award',
    isSystem: true,
    memberCount: 2134,
    messageCount: 5892,
  },
  {
    id: 'room-students',
    name: 'Students & Interns',
    description: 'EMT students and internship guidance',
    type: 'students',
    icon: 'GraduationCap',
    isSystem: true,
    memberCount: 1678,
    messageCount: 4123,
  },
  {
    id: 'room-library',
    name: 'Library',
    description: 'Books, study materials, and resources',
    type: 'library',
    icon: 'BookOpen',
    isSystem: true,
    memberCount: 2456,
    messageCount: 1892,
  },
];

export const mockUsers: User[] = [
  { id: 'user-2', name: 'Vikram Sethi', role: 'verified', gender: 'male', qualification: 'paramedic', createdAt: new Date() },
  { id: 'user-3', name: 'Priya Das', role: 'user', gender: 'female', qualification: 'emt', createdAt: new Date() },
  { id: 'user-4', name: 'Rohan Gupta', role: 'paid', gender: 'male', qualification: 'advance_emt', createdAt: new Date() },
  { id: 'user-5', name: 'Anjali Singh', role: 'user', gender: 'female', qualification: 'emr', createdAt: new Date() },
  { id: 'user-6', name: 'Rajesh Pillai', role: 'verified', gender: 'male', qualification: null, createdAt: new Date() },
  { id: 'user-7', name: 'Sneha Reddy', role: 'user', gender: 'female', qualification: null, createdAt: new Date() },
  { id: 'user-8', name: 'Karan Patel', role: 'paid', gender: 'male', qualification: 'paramedic', createdAt: new Date() },
];

const now = Date.now();
const m = (mins: number) => new Date(now - 1000 * 60 * mins);
const h = (hrs: number) => new Date(now - 1000 * 60 * 60 * hrs);

// ─── GEN MESSAGES (room-general) ────────────────────────────────────────────
const generalMessages: Message[] = [
  { id: 'g1', roomId: 'room-general', userId: 'user-2', content: 'Just finished a 12-hour shift. Anyone else dealing with the new protocol changes for cardiac arrest calls?', isAnonymous: false, likes: 24, replies: 8, isPinned: false, createdAt: h(6), user: mockUsers[0] },
  { id: 'g2', roomId: 'room-general', userId: 'user-3', content: 'The new cardiac arrest protocols are actually making a difference. Saw improved ROSC outcomes this week with the updated compression ratios!', isAnonymous: false, likes: 45, replies: 12, isPinned: true, createdAt: h(5), user: mockUsers[1] },
  { id: 'g3', roomId: 'room-general', userId: 'user-4', content: 'Just passed my PHTLS recertification 🎉 The new hemorrhage control modules are really well designed. Highly recommend!', isAnonymous: false, likes: 38, replies: 5, isPinned: false, createdAt: h(4), user: mockUsers[2] },
  { id: 'g4', roomId: 'room-general', userId: 'user-5', content: 'Does anyone have experience with the Lucas device for extended CPR on long transports? Our station is considering purchasing one.', isAnonymous: false, likes: 19, replies: 7, isPinned: false, createdAt: h(3), user: mockUsers[3] },
  { id: 'g5', roomId: 'room-general', userId: 'user-6', content: 'Reminder: The NAEMSP annual conference registration opens next week! Great networking opportunity. Link in bio.', isAnonymous: false, likes: 56, replies: 3, isPinned: false, createdAt: h(2), user: mockUsers[4] },
  { id: 'g6', roomId: 'room-general', userId: 'user-7', content: 'Hot take: We need better mental health support in EMS. 3 colleagues from my station have left the field this year due to burnout. We need to talk about this more openly.', isAnonymous: false, likes: 89, replies: 22, isPinned: false, createdAt: h(1.5), user: mockUsers[5] },
  { id: 'g7', roomId: 'room-general', userId: 'user-8', content: 'Agreed with @Taylor. Just got back from a peer support training — Peer Support Teams save careers. Reach out if you need someone to talk to. We\'re here 🙏', isAnonymous: false, likes: 71, replies: 9, isPinned: false, createdAt: m(45), user: mockUsers[6] },
  { id: 'g8', roomId: 'room-general', userId: 'user-2', content: 'Anyone tried the new EMS tracking app going around? It shows response times by unit and zone. Pretty useful for performance review discussions.', isAnonymous: false, likes: 15, replies: 4, isPinned: false, createdAt: m(20), user: mockUsers[0] },
];

// ─── SALARY MESSAGES (room-salary, anonymous) ────────────────────────────────
const salaryMessages: Message[] = [
  { id: 's1', roomId: 'room-salary', userId: 'user-anon-1', content: 'Private ambulance EMT-B in Texas, 2 years exp. Making ₹28k/month. Is this normal? Feels low compared to peers.', isAnonymous: true, likes: 34, replies: 11, isPinned: false, createdAt: h(8), user: undefined },
  { id: 's2', roomId: 'room-salary', userId: 'user-anon-2', content: 'Anyone working government sector in South India? Currently at ₹22k for EMRI (108). Heard some states get ₹35k+ for same role.', isAnonymous: true, likes: 67, replies: 18, isPinned: true, createdAt: h(6), user: undefined },
  { id: 's3', roomId: 'room-salary', userId: 'user-anon-3', content: 'Just negotiated my salary from ₹25k to ₹38k after getting my BSc EMT degree. Education really does make a difference for salary discussions!', isAnonymous: true, likes: 92, replies: 14, isPinned: false, createdAt: h(4), user: undefined },
  { id: 's4', roomId: 'room-salary', userId: 'user-anon-4', content: 'Hospital-based EMS Paramedic, Delhi NCR: ₹42,000/month + night allowance + PF. 5 years exp. Better than private but hours are brutal.', isAnonymous: true, likes: 45, replies: 8, isPinned: false, createdAt: h(3), user: undefined },
  { id: 's5', roomId: 'room-salary', userId: 'user-anon-5', content: 'Pro tip: Always negotiate for Night Differential, HRA, and medical allowance separately. Many employers hide these in "CTC" to make it look bigger.', isAnonymous: true, likes: 108, replies: 21, isPinned: false, createdAt: h(2), user: undefined },
  { id: 's6', roomId: 'room-salary', userId: 'user-anon-6', content: 'Aviation EMS / Air Ambulance roles are where the real money is. ₹65k-1.2L/month for experienced paramedics. Requires extensive experience though.', isAnonymous: true, likes: 134, replies: 29, isPinned: false, createdAt: h(1), user: undefined },
  { id: 's7', roomId: 'room-salary', userId: 'user-anon-7', content: 'Freshers: Don\'t accept less than ₹20k/month for full-time EMT work, even in smaller cities. Know your worth. Market rate data is on this app!', isAnonymous: true, likes: 78, replies: 16, isPinned: false, createdAt: m(30), user: undefined },
];

// ─── CAREER MESSAGES (room-career) - NOW JOB POSTS ───────────────────────────
export const mockJobPosts: JobPost[] = [
  {
    id: 'job1',
    roomId: 'room-career',
    userId: 'user-2',
    companyName: 'Apollo Hospitals',
    role: 'Paramedic',
    location: 'Chennai, TN',
    workingDays: '6 Days/Week',
    workingHours: '12',
    salaryOffering: '₹35k-45k/month',
    description: 'Looking for 3 Paramedics with deep ICU/CCU experience. Must be comfortable with ventilator management and long-distance transfers.',
    likes: 56,
    replies: 14,
    isPinned: true,
    createdAt: h(5),
    user: mockUsers[0],
  },
  {
    id: 'job2',
    roomId: 'room-career',
    userId: 'user-4',
    companyName: 'Fortis Healthcare',
    role: 'Emergency Care Technician',
    location: 'Bangalore, KA',
    workingDays: 'Rotational Shifts',
    workingHours: '8',
    salaryOffering: '₹30k-40k/month',
    description: 'BSc EMT or Diploma + 2yr experience required. Will be primarily stationed in the emergency ward assisting with trauma cases.',
    likes: 44,
    replies: 9,
    isPinned: false,
    createdAt: h(2),
    user: mockUsers[2],
  },
  {
    id: 'job3',
    roomId: 'room-career',
    userId: 'user-7',
    companyName: 'Reliance Industries (Occupational Health)',
    role: 'Industrial Paramedic',
    location: 'Jamnagar, GJ',
    workingDays: '15 Days On / 15 Off',
    workingHours: '12',
    salaryOffering: '₹55k/month + Accommodation',
    description: 'Seeking an experienced paramedic for our refinery occupational health center. Must have experience with hazmat protocols and industrial trauma.',
    likes: 89,
    replies: 22,
    isPinned: false,
    createdAt: h(1),
    user: mockUsers[5],
  }
];


// ─── ENTREPRENEURSHIP MESSAGES (room-entrepreneurship) ──────────────────────
const entrepreneurshipMessages: Message[] = [
  { id: 'e1', roomId: 'room-entrepreneurship', userId: 'user-2', content: 'Started my own First Aid training company 6 months ago. Revenue crossed ₹3L/month last week 🎉 AMA about the business model!', isAnonymous: false, likes: 94, replies: 31, isPinned: true, createdAt: h(7), user: mockUsers[0] },
  { id: 'e2', roomId: 'room-entrepreneurship', userId: 'user-3', content: 'Thinking about setting up a private event medical standby service. Anyone done this? What are the licensing requirements in your state?', isAnonymous: false, likes: 38, replies: 17, isPinned: false, createdAt: h(5), user: mockUsers[1] },
  { id: 'e3', roomId: 'room-entrepreneurship', userId: 'user-4', content: 'EMS consulting is hugely underrated. Hospitals pay ₹50k+ per project for protocol optimization. You don\'t need a startup — just your expertise!', isAnonymous: false, likes: 72, replies: 14, isPinned: false, createdAt: h(4), user: mockUsers[2] },
  { id: 'e4', roomId: 'room-entrepreneurship', userId: 'user-5', content: 'Building an app that connects freelance paramedics with event organizers. Looking for a co-founder with tech skills. Is anyone here also a developer?', isAnonymous: false, likes: 29, replies: 22, isPinned: false, createdAt: h(3), user: mockUsers[3] },
  { id: 'e5', roomId: 'room-entrepreneurship', userId: 'user-6', content: 'School AED and first aid contract tips: Schools LOVE when you handle compliance documentation for them. Bundle training + equipment + records management = sticky revenue.', isAnonymous: false, likes: 55, replies: 8, isPinned: false, createdAt: h(2), user: mockUsers[4] },
  { id: 'e6', roomId: 'room-entrepreneurship', userId: 'user-7', content: 'Anyone explored telemedicine triage as a service for remote areas? Rural India is massively underserved and there\'s real money in this space with the right partners.', isAnonymous: false, likes: 41, replies: 13, isPinned: false, createdAt: h(1), user: mockUsers[5] },
  { id: 'e7', roomId: 'room-entrepreneurship', userId: 'user-8', content: 'Grant opportunity: DST NIDHI program funds healthcare startups up to ₹50L. Application period closes March 15th. Link: dst.gov.in — several EMT-led solutions have gotten this!', isAnonymous: false, likes: 66, replies: 9, isPinned: false, createdAt: m(25), user: mockUsers[6] },
];

// ─── CERTIFICATIONS MESSAGES (room-certifications) ──────────────────────────
const certificationMessages: Message[] = [
  { id: 'cert1', roomId: 'room-certifications', userId: 'user-3', content: 'Pro tip for ACLS: Focus on the megacode scenarios. They love testing algorithm application under pressure. Know EVERY branch of the pulseless arrest flowchart cold!', isAnonymous: false, likes: 67, replies: 23, isPinned: false, createdAt: h(8), user: mockUsers[1] },
  { id: 'cert2', roomId: 'room-certifications', userId: 'user-4', content: 'Just passed Prometric HAAD exam! Used Mosby\'s EMT textbook + NREMT sample questions. 3 months of daily 2hr study. Here are the topic weightings I noticed…', isAnonymous: false, likes: 83, replies: 19, isPinned: true, createdAt: h(6), user: mockUsers[2] },
  { id: 'cert3', roomId: 'room-certifications', userId: 'user-5', content: 'PHTLS 9th edition is out. Major changes: New approach for penetrating trauma, updated tourniquet placement guidelines, and revised spinal motion restriction criteria.', isAnonymous: false, likes: 52, replies: 14, isPinned: false, createdAt: h(5), user: mockUsers[3] },
  { id: 'cert4', roomId: 'room-certifications', userId: 'user-6', content: 'BLS quick reminder everyone: No more look/listen/feel. Immediate pulse check (10 sec), start compressions if unsure. 2024 guidelines are strict on this!', isAnonymous: false, likes: 74, replies: 8, isPinned: false, createdAt: h(4), user: mockUsers[4] },
  { id: 'cert5', roomId: 'room-certifications', userId: 'user-7', content: 'NREMT question tip: When in doubt, choose the answer that involves REASSESSING the patient. The exam loves reassessment as the answer for clinical scenarios.', isAnonymous: false, likes: 98, replies: 27, isPinned: false, createdAt: h(2), user: mockUsers[5] },
  { id: 'cert6', roomId: 'room-certifications', userId: 'user-8', content: 'Free resource alert: AHA has free ACLS/BLS reference cards on their website now. Download and laminate them. Perfect for quick review before your shift!', isAnonymous: false, likes: 61, replies: 10, isPinned: false, createdAt: h(1), user: mockUsers[6] },
  { id: 'cert7', roomId: 'room-certifications', userId: 'user-2', content: 'ATLS vs PHTLS: ATLS is hospital-based (for surgeons), PHTLS is prehospital. If you\'re in the field, PHTLS is what hiring managers want to see on your cert list!', isAnonymous: false, likes: 44, replies: 6, isPinned: false, createdAt: m(35), user: mockUsers[0] },
];

// ─── STUDENTS MESSAGES (room-students) ───────────────────────────────────────
const studentMessages: Message[] = [
  { id: 'st1', roomId: 'room-students', userId: 'user-5', content: 'Just started my EMT-B program! Any advice for someone completely new to EMS? A bit overwhelmed but super excited 🙌', isAnonymous: false, likes: 29, replies: 18, isPinned: false, createdAt: h(7), user: mockUsers[3] },
  { id: 'st2', roomId: 'room-students', userId: 'user-3', content: "First clinical rotation tomorrow at AIIMS emergency dept. Tips from those who've done it? I'm nervous about looking capable in front of the physicians!", isAnonymous: false, likes: 41, replies: 22, isPinned: false, createdAt: h(6), user: mockUsers[1] },
  { id: 'st3', roomId: 'room-students', userId: 'user-6', content: 'Sharing my free NREMT study schedule: Week 1-2: Airway/Ventilation → Week 3-4: Cardiology → Week 5-6: Trauma → Week 7-8: Med emergencies → Week 9-10: OB/Peds → Week 11-12: Practice tests only.', isAnonymous: false, likes: 112, replies: 31, isPinned: true, createdAt: h(4), user: mockUsers[4] },
  { id: 'st4', roomId: 'room-students', userId: 'user-7', content: 'Skill tip from my preceptor: When assessing a cardiac patient, narrate EVERYTHING out loud. Examiners miss less and patients feel less anxious. Changed my game completely.', isAnonymous: false, likes: 67, replies: 9, isPinned: false, createdAt: h(3), user: mockUsers[5] },
  { id: 'st5', roomId: 'room-students', userId: 'user-8', content: 'Anyone doing internship at a private ambulance company? How do you handle it when a senior EMT does something that contradicts your training? Asking for real advice.', isAnonymous: false, likes: 38, replies: 27, isPinned: false, createdAt: h(2), user: mockUsers[6] },
  { id: 'st6', roomId: 'room-students', userId: 'user-2', content: 'Book recommendation: "EMS Field Guide" by Informed is a must-have pocket reference. Fits in your uniform pocket and covers drugs, vitals, protocols, Glasgow scale — everything!', isAnonymous: false, likes: 54, replies: 8, isPinned: false, createdAt: h(1), user: mockUsers[0] },
  { id: 'st7', roomId: 'room-students', userId: 'user-4', content: 'Don\'t stress about memorizing every drug dose — focus on understanding mechanisms first. Once you understand WHY we give dopamine in cardiogenic shock, the dose is easy to remember.', isAnonymous: false, likes: 83, replies: 14, isPinned: false, createdAt: m(20), user: mockUsers[2] },
];

// ─── All mock messages combined ───────────────────────────────────────────────
export const mockMessages: Message[] = [
  ...generalMessages,
  ...salaryMessages,
  ...entrepreneurshipMessages,
  ...certificationMessages,
  ...studentMessages,
];

export const trendingPosts: TrendingPost[] = [
  {
    id: 'trend-1',
    message: certificationMessages[0],
    room: systemRooms[5],
    engagementScore: 156,
    trendingAt: new Date(),
  },
  {
    id: 'trend-2',
    message: generalMessages[1],
    room: systemRooms[0],
    engagementScore: 124,
    trendingAt: new Date(),
  },
  {
    id: 'trend-3',
    message: entrepreneurshipMessages[0],
    room: systemRooms[4],
    engagementScore: 98,
    trendingAt: new Date(),
  },
  {
    id: 'trend-4',
    message: salaryMessages[5],
    room: systemRooms[1],
    engagementScore: 134,
    trendingAt: new Date(),
  },
];

export const mockSalaryData: SalaryPost[] = [
  { id: 's1', role: 'emt', location: 'Mumbai', experienceYears: 2, workingHours: 12, sector: 'private', salary: 28000, currency: 'INR', createdAt: new Date() },
  { id: 's2', role: 'paramedic', location: 'Delhi', experienceYears: 5, workingHours: 12, sector: 'government', salary: 42000, currency: 'INR', createdAt: new Date() },
  { id: 's3', role: 'emt', location: 'Chennai', experienceYears: 1, workingHours: 8, sector: 'private', salary: 22000, currency: 'INR', createdAt: new Date() },
  { id: 's4', role: 'paramedic', location: 'Bangalore', experienceYears: 8, workingHours: 12, sector: 'government', salary: 55000, currency: 'INR', createdAt: new Date() },
  { id: 's5', role: 'emt', location: 'Hyderabad', experienceYears: 3, workingHours: 12, sector: 'ngo', salary: 32000, currency: 'INR', createdAt: new Date() },
  { id: 's6', role: 'paramedic', location: 'Delhi', experienceYears: 10, workingHours: 8, sector: 'government', salary: 68000, currency: 'INR', createdAt: new Date() },
  { id: 's7', role: 'emt', location: 'Pune', experienceYears: 4, workingHours: 12, sector: 'private', salary: 30000, currency: 'INR', createdAt: new Date() },
  { id: 's8', role: 'paramedic', location: 'Kolkata', experienceYears: 6, workingHours: 8, sector: 'ngo', salary: 38000, currency: 'INR', createdAt: new Date() },
  { id: 's9', role: 'emt', location: 'Ahmedabad', experienceYears: 0, workingHours: 12, sector: 'private', salary: 18000, currency: 'INR', createdAt: new Date() },
  { id: 's10', role: 'paramedic', location: 'Mumbai', experienceYears: 12, workingHours: 12, sector: 'government', salary: 75000, currency: 'INR', createdAt: new Date() },
];

export const tools: Tool[] = [
  {
    id: 'tool-salary',
    name: 'Salary Insights',
    description: 'Compare salaries across roles, locations, and experience levels',
    type: 'internal',
    icon: 'BarChart3',
    category: 'salary',
  },
  {
    id: 'tool-drugs',
    name: 'Drug Dosage Calculator',
    description: 'Quick reference for emergency medications',
    type: 'external',
    url: 'https://play.google.com/store',
    icon: 'Pill',
    category: 'drugs',
  },
  {
    id: 'tool-protocols',
    name: 'EMS Protocols',
    description: 'State and national emergency protocols',
    type: 'external',
    url: 'https://example.com',
    icon: 'FileText',
    category: 'protocols',
  },
  {
    id: 'tool-ecg',
    name: 'ECG Reference',
    description: 'Quick ECG interpretation guide',
    type: 'external',
    url: 'https://example.com',
    icon: 'Activity',
    category: 'ecg',
  },
  {
    id: 'tool-study',
    name: 'NREMT Prep',
    description: 'Study materials for certification exams',
    type: 'external',
    url: 'https://example.com',
    icon: 'BookMarked',
    category: 'study',
  },
];
