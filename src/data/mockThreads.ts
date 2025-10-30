import type { Thread } from '../types/inbox'

function iso(minutesAgo: number): string {
  return new Date(Date.now() - minutesAgo * 60 * 1000).toISOString()
}

export const mockThreads: Thread[] = [
  {
    id: 't1',
    platform: 'google',
    threadTitle: 'Great stay at OceanView Resort',
    lastUpdated: iso(5),
    assignment: { assignee: 'Alex', department: 'Guest Relations', priority: 'medium' },
    status: 'open',
    guest: {
      name: 'Priya',
      username: 'priya.g',
      location: 'Mumbai, IN',
      language: 'en-IN',
      avatarUrl: '/avatars/priya.svg',
      customerType: 'vip',
      email: 'priya@example.com',
      phone: '+91 90000 00001',
      lastStayed: '2025-09-12T10:00:00.000Z',
    },
    ai: {
      summary: 'Guest complimented room view and breakfast.',
      sentiment: 'positive',
      emotion: 'delight',
      tags: ['compliment', 'breakfast'],
      suggestedReplies: [
        'Thanks for the kind words! 💙',
        'We’re thrilled you enjoyed the view and breakfast!'
      ],
    },
    property: {
      name: 'OceanView Resort',
      address: '123 Beach Rd',
      contact: '+1 (555) 123-4567',
      rating: 4.6,
      reviewsCount: 1287,
      amenities: ['Pool', 'Spa', 'Gym', 'Free Wi‑Fi', 'Breakfast'],
      timezone: 'Asia/Kolkata',
      website: 'https://oceanview.example',
      email: 'contact@oceanview.example',
      restaurants: [
        { type: 'Multi‑cuisine Restaurant', hours: '7AM–11PM' },
        { type: 'Seafood Bar', hours: '5PM–12AM' }
      ],
      poolHours: '6AM–10PM',
      parking: 'On‑site parking, complimentary valet',
      rooms: [
        { name: 'Deluxe', price: '₹8,000' },
        { name: 'Suite', price: '₹12,000' },
      ],
      policies: { checkIn: '2PM', checkOut: '11AM' },
      promotions: [
        { title: 'Monsoon Getaway 20% off', code: 'MONSOON20', description: 'Applicable on Deluxe & Suite stays, min 2 nights', start: '2025-06-01T00:00:00.000Z', end: '2025-08-31T23:59:59.000Z' },
        { title: 'Festive Offer 15% off', code: 'FESTIVE15', description: 'Breakfast included', start: '2025-10-15T00:00:00.000Z', end: '2026-01-10T23:59:59.000Z' },
      ],
    },
    messages: [
      {
        id: 'm1',
        threadId: 't1',
        platform: 'google',
        senderName: 'Priya',
        text: 'Loved my stay! The ocean view was stunning.',
        timestamp: iso(10),
        inbound: true,
      },
      {
        id: 'm2',
        threadId: 't1',
        platform: 'google',
        senderName: 'Hotel',
        text: 'Thank you for choosing us! 💙',
        timestamp: iso(8),
        inbound: false,
      },
    ],
  },
  {
    id: 't4',
    platform: 'x',
    threadTitle: 'Noise complaint near pool area',
    lastUpdated: iso(50),
    assignment: { assignee: 'Jordan', department: 'Operations', priority: 'high' },
    status: 'open',
    guest: {
      name: 'Akhil',
      username: 'akhil_91',
      location: 'Delhi, IN',
      language: 'en-IN',
      avatarUrl: '/avatars/priya.svg',
      customerType: 'regular',
    },
    ai: {
      summary: 'Guest reported loud music past quiet hours near pool.',
      sentiment: 'negative',
      tags: ['noise', 'pool', 'policy'],
      suggestedReplies: [
        'We’re sorry about the disturbance. We’ll address it immediately.',
      ],
    },
    property: {
      name: 'OceanView Resort',
      address: '123 Beach Rd',
      contact: '+1 (555) 123-4567',
      rooms: [
        { name: 'Deluxe', price: '₹8,000' },
        { name: 'Suite', price: '₹12,000' },
      ],
      policies: { checkIn: '2PM', checkOut: '11AM' },
    },
    messages: [
      { id: 'm5', threadId: 't4', platform: 'x', senderName: 'Akhil', text: 'Music was too loud after 11 pm.', timestamp: iso(55), inbound: true },
    ],
  },
  {
    id: 't5',
    platform: 'google',
    threadTitle: 'Breakfast buffet timing question',
    lastUpdated: iso(8),
    status: 'open',
    guest: {
      name: 'Arjun',
      username: 'arjun.travel',
      location: 'Mumbai, IN',
      language: 'en-IN',
      avatarUrl: '/avatars/leena.svg',
      customerType: 'member',
      email: 'arjun@example.com',
      phone: '+91 90000 00002',
      lastStayed: '2025-06-01T10:00:00.000Z',
    },
    ai: {
      summary: 'Asked about breakfast and kids options.',
      sentiment: 'neutral',
      tags: ['breakfast', 'kids'],
      suggestedReplies: ['Breakfast is 7AM–11AM. We have kid-friendly options.'],
    },
    property: {
      name: 'CityCenter Hotel',
      address: '456 Downtown Ave',
      contact: '+1 (555) 987-6543',
      rooms: [
        { name: 'Standard', price: '₹5,500' },
        { name: 'Executive', price: '₹9,500' },
      ],
      policies: { checkIn: '2PM', checkOut: '11AM' },
      promotions: [
        { title: 'Spring Sale 20% off', code: 'SPRING20', description: 'Use before end of May', start: '2025-03-01T00:00:00.000Z', end: '2025-05-31T23:59:59.000Z' },
        { title: 'Weekend Saver 10% off', code: 'WEEKEND10', description: 'Fri–Sun stays only', start: '2025-01-01T00:00:00.000Z', end: '2025-12-31T23:59:59.000Z' },
      ],
    },
    messages: [
      { id: 'm6', threadId: 't5', platform: 'google', senderName: 'Arjun', text: 'What time is breakfast? Do you have kids menu?', timestamp: iso(9), inbound: true },
    ],
  },
  {
    id: 't6',
    platform: 'tripadvisor',
    threadTitle: 'Shuttle from airport',
    lastUpdated: iso(70),
    status: 'open',
    guest: {
      name: 'Neha',
      username: 'neha.fly',
      location: 'Bengaluru, IN',
      language: 'en-IN',
      avatarUrl: '/avatars/liza.svg',
      customerType: 'regular',
    },
    ai: {
      summary: 'Asking about airport shuttle timings and cost.',
      sentiment: 'positive',
      tags: ['transport', 'shuttle'],
      suggestedReplies: ['Yes, shuttle runs hourly. Cost ₹500 per person.'],
    },
    property: {
      name: 'MountainPeak Lodge',
      address: '789 Summit Dr',
      contact: '+1 (555) 555-0000',
      rooms: [
        { name: 'Cabin', price: '₹7,000' },
        { name: 'Suite', price: '₹11,000' },
      ],
      policies: { checkIn: '3PM', checkOut: '10AM' },
      promotions: [
        { title: 'Hikers Special 12% off', code: 'HIKE12', description: 'Complimentary trail map', start: '2025-02-01T00:00:00.000Z', end: '2025-11-30T23:59:59.000Z' },
      ],
    },
    messages: [
      { id: 'm7', threadId: 't6', platform: 'tripadvisor', senderName: 'Neha', text: 'Do you offer airport shuttle late night?', timestamp: iso(75), inbound: true },
    ],
  },
  {
    id: 't8',
    platform: 'facebook',
    threadTitle: 'Did not get promo discount at CityCenter',
    lastUpdated: iso(1),
    status: 'open',
    guest: {
      name: 'Anita',
      username: 'anita.travel',
      location: 'Mumbai, IN',
      language: 'en-IN',
      avatarUrl: '/avatars/leena.svg',
      customerType: 'member',
      email: 'anita@example.com',
    },
    ai: {
      summary: 'Guest claims SPRING20 was not applied during booking.',
      sentiment: 'negative',
      tags: ['promotion', 'discount', 'billing'],
      suggestedReplies: [
        'I’m sorry this happened. May I confirm your booking ID to check the code?',
        'We’ll honor SPRING20 if eligible. I can apply the difference right away.',
        'The code works for stays till May 31 and select room types. I’ll verify yours.',
      ],
    },
    property: {
      name: 'CityCenter Hotel',
      address: '456 Downtown Ave',
      contact: '+1 (555) 987-6543',
      rooms: [
        { name: 'Standard', price: '₹5,500' },
        { name: 'Executive', price: '₹9,500' },
      ],
      policies: { checkIn: '2PM', checkOut: '11AM' },
      promotions: [
        { title: 'Spring Sale 20% off', code: 'SPRING20', description: 'Use before end of May', start: '2025-03-01T00:00:00.000Z', end: '2025-05-31T23:59:59.000Z' },
        { title: 'Weekend Saver 10% off', code: 'WEEKEND10', description: 'Fri–Sun stays only', start: '2025-01-01T00:00:00.000Z', end: '2025-12-31T23:59:59.000Z' },
      ],
    },
    messages: [
      { id: 'm9', threadId: 't8', platform: 'facebook', senderName: 'Anita', text: 'I used SPRING20 but got charged full price.', timestamp: iso(2), inbound: true },
      { id: 'm10', threadId: 't8', platform: 'facebook', senderName: 'Hotel', text: 'We’re checking this for you.', timestamp: iso(1), inbound: false },
    ],
  },
  {
    id: 't7',
    platform: 'instagram',
    threadTitle: 'Housekeeping request not addressed',
    lastUpdated: iso(150),
    assignment: { assignee: 'Alex', department: 'Guest Relations', priority: 'high' },
    status: 'open',
    guest: {
      name: 'Riya',
      username: 'riya.trips',
      location: 'Delhi, IN',
      language: 'en-IN',
      avatarUrl: '/avatars/priya.svg',
      customerType: 'member',
      email: 'riya@example.com',
      phone: '+91 90000 00003',
      lastStayed: '2025-04-20T10:00:00.000Z',
    },
    ai: {
      summary: 'Guest reported housekeeping delay since morning.',
      sentiment: 'negative',
      tags: ['housekeeping', 'delay'],
      suggestedReplies: ['We’re escalating this immediately. Sorry for the delay.'],
    },
    property: {
      name: 'CityCenter Hotel',
      address: '456 Downtown Ave',
      contact: '+1 (555) 987-6543',
      rooms: [
        { name: 'Standard', price: '₹5,500' },
        { name: 'Executive', price: '₹9,500' },
      ],
      policies: { checkIn: '2PM', checkOut: '11AM' },
    },
    messages: [
      { id: 'm8', threadId: 't7', platform: 'instagram', senderName: 'Riya', text: 'No one came since morning.', timestamp: iso(180), inbound: true },
    ],
  },
  {
    id: 't2',
    platform: 'facebook',
    threadTitle: 'Late check-in and refund request',
    lastUpdated: iso(2),
    assignment: { assignee: 'Sam', department: 'Support', priority: 'high' },
    status: 'open',
    guest: {
      name: 'Liza',
      username: 'liza.travel',
      location: 'Delhi, IN',
      language: 'en-IN',
      avatarUrl: '/avatars/liza.svg',
      customerType: 'member',
      email: 'liza@example.com',
      phone: '+91 90000 00004',
      lastStayed: '2025-10-28T14:00:00.000Z',
    },
    ai: {
      summary: 'Guest unhappy with late check-in; requested refund.',
      sentiment: 'negative',
      emotion: 'frustration',
      tags: ['check-in delay', 'refund'],
      suggestedReplies: [
        'We’re sorry about the delay. Please DM your booking ID so we can assist.',
        'Apologies for the inconvenience — our team will review this right away.',
        'Search booking id'
      ],
    },
    property: {
      name: 'CityCenter Hotel',
      address: '456 Downtown Ave',
      contact: '+1 (555) 987-6543',
      rating: 4.1,
      reviewsCount: 842,
      amenities: ['Free Wi‑Fi', 'Gym', 'Bar'],
      timezone: 'Asia/Kolkata',
      website: 'https://citycenter.example',
      email: 'hello@citycenter.example',
      restaurants: [
        { type: 'All‑day Café', hours: '6:30AM–11PM' },
        { type: 'Lobby Bar', hours: '5PM–1AM' }
      ],
      parking: 'Basement self‑parking, ₹200/hour; valet available',
      rooms: [
        { name: 'Standard', price: '₹5,500' },
        { name: 'Executive', price: '₹9,500' },
      ],
      policies: { checkIn: '2PM', checkOut: '11AM' },
    },
    messages: [
      {
        id: 'm3',
        threadId: 't2',
        platform: 'facebook',
        senderName: 'Liza',
        text: 'Checked in 2 hours late. This is unacceptable. I want a refund.',
        timestamp: iso(3),
        inbound: true,
      }
    ],
  },
  {
    id: 't3',
    platform: 'instagram',
    threadTitle: 'Question about suite availability',
    lastUpdated: iso(20),
    status: 'pending',
    guest: {
      name: 'Leena',
      username: 'leena.me',
      location: 'Bengaluru, IN',
      language: 'en-IN',
      avatarUrl: '/avatars/leena.svg',
      customerType: 'vip',
      email: 'leena@example.com',
      phone: '+91 90000 00005',
      lastStayed: '2025-08-18T10:00:00.000Z',
    },
    ai: {
      summary: 'Guest asked about suite availability for next weekend.',
      sentiment: 'neutral',
      tags: ['availability', 'suite'],
      suggestedReplies: [
        'Suites are available next weekend. Would you like us to hold one?',
        'We’d love to host you — here are current rates and options.'
      ],
    },
    property: {
      name: 'MountainPeak Lodge',
      address: '789 Summit Dr',
      contact: '+1 (555) 555-0000',
      rating: 4.4,
      reviewsCount: 621,
      amenities: ['Cabins', 'Hiking Trails', 'Fireplace'],
      timezone: 'Asia/Kolkata',
      website: 'https://mountainpeak.example',
      email: 'stay@mountainpeak.example',
      restaurants: [
        { type: 'Local Cuisine Restaurant', hours: '7:30AM–10PM' },
        { type: 'Coffee House', hours: '7AM–9PM' }
      ],
      parking: 'Outdoor self‑parking, free',
      rooms: [
        { name: 'Cabin', price: '₹7,000' },
        { name: 'Suite', price: '₹11,000' },
      ],
      policies: { checkIn: '3PM', checkOut: '10AM' },
    },
    messages: [
      {
        id: 'm4',
        threadId: 't3',
        platform: 'instagram',
        senderName: 'Leena',
        text: 'Do you have suites available next weekend?',
        timestamp: iso(21),
        inbound: true,
      }
    ],
  }
]

