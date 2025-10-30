export type Platform = 'facebook' | 'instagram' | 'x' | 'google' | 'tripadvisor';

export type Sentiment = 'positive' | 'neutral' | 'negative';

export type CustomerType = 'regular' | 'member' | 'vip';

export interface Guest {
  name: string;
  username?: string; // handle on the platform
  avatarUrl?: string;
  location?: string; // city, country
  language?: string; // e.g., en-IN
  customerType?: CustomerType;
  email?: string;
  phone?: string;
  lastStayed?: string; // ISO date string
}

export interface Message {
  id: string;
  threadId: string;
  platform: Platform;
  senderName: string;
  text: string;
  timestamp: string; // ISO string
  inbound: boolean;
  attachments?: Array<{ id: string; type: 'image'; url: string; alt?: string }>; // Data URL or absolute URL
}

export interface AiMeta {
  summary: string;
  sentiment: Sentiment;
  emotion?: string;
  tags: string[];
  suggestedReplies: string[];
}

export interface PropertyInfo {
  name: string;
  address: string;
  contact: string;
  rooms: { name: string; price: string }[];
  policies: { checkIn: string; checkOut: string };
  rating?: number; // 0-5
  reviewsCount?: number;
  amenities?: string[];
  timezone?: string;
  website?: string;
  email?: string;
  // Additional details
  restaurants?: { type: string; hours: string }[]; // e.g., type: "Indian", hours: "7AM–11PM"
  poolHours?: string; // e.g., "6AM–10PM"
  parking?: string; // e.g., "On-site parking, free for guests"
  promotions?: Promotion[];
}

export interface Promotion {
  title: string;
  code: string;
  description?: string;
  start: string; // ISO
  end: string; // ISO
}

export interface Thread {
  id: string;
  platform: Platform;
  threadTitle: string;
  lastUpdated: string; // ISO string
  assignment?: {
    assignee: string;
    department?: string;
    priority: 'low' | 'medium' | 'high';
  };
  status: 'open' | 'pending' | 'resolved';
  guest?: Guest; // primary participant on the guest side
  messages: Message[];
  ai: AiMeta;
  property: PropertyInfo;
}

