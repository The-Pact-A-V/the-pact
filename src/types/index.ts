export type UserId = 'apeksha' | 'ved'

export type Category = 'mental' | 'physical' | 'spiritual' | 'material'

export type Difficulty = 1 | 2 | 3 | 5 | 8

export type Frequency =
  | { type: 'daily' }
  | { type: 'times_per_week'; n: number }
  | { type: 'specific_days'; days: number[] }
  | { type: 'custom'; unit: 'weeks' | 'days' | 'monthly'; interval?: number }

export interface Pact {
  id: string
  name: string
  startDate: string
  endDate: string
  targetPct: number
  rewardBoardId: string | null
  status: 'active' | 'completed' | 'abandoned'
  createdBy: UserId
  pactJoinedByA: boolean
  pactJoinedByV: boolean
  createdAt: number
  closedAt: number | null
}

export interface Activity {
  id: string
  userId: UserId
  pactId: string
  name: string
  category: Category
  frequency: Frequency
  points: Difficulty
  createdAt: number
  notes?: string
  position?: number
}

export interface DailyLogEntry {
  userId: UserId
  pactId: string
  logDate: string
  activityId: string
  completed: boolean
  pointsAtTick: number
}

export interface Buzz {
  id: string
  fromUser: UserId
  toUser: UserId
  message: string
  presetType: 'heart' | 'star' | 'sun' | 'moon' | null
  sentAt: number
  seenAt: number | null
}

export interface Board {
  id: string
  name: string
  emoji: string
  coverColor: string
  createdAt: number
}

export interface BoardItem {
  id: string
  boardId: string
  type: 'photo' | 'note' | 'link' | 'voice' | 'spotify' | 'instagram' | 'youtube'
  content: Record<string, unknown>
  position: number
  addedBy: UserId
  addedAt: number
}

export interface Milestone {
  threshold: 25 | 50 | 75 | 95
  hitAt: number
  hitBy: UserId | 'both'
}
