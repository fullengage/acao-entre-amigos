export type GameStatus = 'upcoming' | 'live' | 'finished'
export type GuessStatus = 'pending' | 'paid' | 'rejected'
export type PaymentStatus = 'pending' | 'confirmed' | 'rejected'
export type Half = 'first' | 'second'

export interface Game {
  id: string
  opponent: string
  match_date: string
  match_time: string
  status: GameStatus
  stage: string
  created_at: string
}

export interface Player {
  id: string
  game_id: string
  name: string
  position?: string
  created_at: string
}

export interface Participant {
  id: string
  name: string
  whatsapp: string
  email?: string
  created_at: string
}

export interface GoalDetail {
  player_name: string
  half: Half
  minute: number
}

export interface Guess {
  id: string
  game_id: string
  participant_id: string
  goals: number
  opponent_goals: number
  player_id?: string
  player_name: string
  half: Half
  minute: number
  status: GuessStatus
  created_at: string
  participant?: Participant
  game?: Game
  goals_details?: GoalDetail[]
}

export interface GameResult {
  id: string
  game_id: string
  brazil_goals: number
  opponent_goals: number
  goal_player?: string
  goal_half?: Half
  goal_minute?: number
  created_at: string
  goals_details?: GoalDetail[]
}

export interface Score {
  id: string
  guess_id: string
  participant_id: string
  game_id: string
  points: number
  breakdown?: ScoreBreakdown
  created_at: string
}

export interface ScoreBreakdown {
  exact_match: boolean
  goals_match: boolean
  player_match: boolean
  half_match: boolean
  minute_bonus: number
  base_points: number
  total: number
  description: string[]
}

export interface Payment {
  id: string
  guess_id: string
  participant_id: string
  amount: number
  status: PaymentStatus
  confirmed_at?: string
  notes?: string
  created_at: string
}

export interface RankingEntry {
  id: string
  name: string
  total_points: number
  total_guesses: number
  position: number
}

export interface GuessFormData {
  goals: number
  opponent_goals: number
  player_name: string
  half: Half
  minute: number
  goals_details: GoalDetail[]
  participant_name: string
  participant_whatsapp: string
  participant_email?: string
}

export interface FinancialSummary {
  game_id: string
  total_participants: number
  total_collected: number
  prize_amount: number
  community_amount: number
}
