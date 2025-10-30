export interface BookingDetails {
  id: string
  guestName: string
  checkIn: string
  checkOut: string
  roomType: string
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'
  amount: string
  notes?: string
}

const mockBookings: BookingDetails[] = [
  {
    id: 'BK-98231',
    guestName: 'Liza',
    checkIn: '2025-10-28T14:00:00.000Z',
    checkOut: '2025-11-02T11:00:00.000Z',
    roomType: 'Executive',
    status: 'checked_in',
    amount: '₹42,500',
    notes: 'Late check-in due to flight delay',
  },
  {
    id: 'BK-65001',
    guestName: 'Liza',
    checkIn: '2025-07-12T14:00:00.000Z',
    checkOut: '2025-07-15T11:00:00.000Z',
    roomType: 'Standard',
    status: 'checked_out',
    amount: '₹18,900',
  },
  {
    id: 'BK-64011',
    guestName: 'Liza',
    checkIn: '2025-03-09T14:00:00.000Z',
    checkOut: '2025-03-12T11:00:00.000Z',
    roomType: 'Deluxe',
    status: 'checked_out',
    amount: '₹27,000',
  },
  {
    id: 'BK-77410',
    guestName: 'Priya',
    checkIn: '2025-09-10T14:00:00.000Z',
    checkOut: '2025-09-13T11:00:00.000Z',
    roomType: 'Deluxe',
    status: 'checked_out',
    amount: '₹24,000',
  },
  {
    id: 'BK-66109',
    guestName: 'Arjun',
    checkIn: '2025-11-05T14:00:00.000Z',
    checkOut: '2025-11-08T11:00:00.000Z',
    roomType: 'Standard',
    status: 'confirmed',
    amount: '₹16,500',
  },
]

export async function searchBookingByGuestName(name: string): Promise<BookingDetails | undefined> {
  const q = name.trim().toLowerCase()
  if (!q) return undefined
  const found = mockBookings.find((b) => b.guestName.toLowerCase().includes(q))
  // Simulate latency
  await new Promise((r) => setTimeout(r, 200))
  return found
}

export async function searchBookingsByGuest(name: string): Promise<{ current?: BookingDetails; past: BookingDetails[] }> {
  const q = name.trim().toLowerCase()
  const matches = mockBookings.filter((b) => b.guestName.toLowerCase().includes(q))
  // Current booking heuristic: status not checked_out or cancelled; otherwise most recent by checkIn
  const ongoing = matches.find((b) => b.status === 'checked_in' || b.status === 'confirmed')
  const current = ongoing || matches.sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())[0]
  const past = matches
    .filter((b) => b.id !== current?.id)
    .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())
  await new Promise((r) => setTimeout(r, 200))
  return { current, past }
}


