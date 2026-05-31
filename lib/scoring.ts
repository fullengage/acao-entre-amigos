import { ScoreBreakdown, GameResult, Guess } from '@/types'

export function calculateScore(guess: Guess, result: GameResult): ScoreBreakdown {
  const breakdown: ScoreBreakdown = {
    exact_match: false,
    goals_match: false,
    player_match: false,
    half_match: false,
    minute_bonus: 0,
    base_points: 0,
    total: 0,
    description: [],
  }

  // No result yet
  if (!result.goal_player || !result.goal_half || !result.goal_minute) {
    return breakdown
  }

  const goalsMatch = guess.goals === result.brazil_goals
  const playerMatch =
    result.goal_player &&
    guess.player_name.toLowerCase().trim() === result.goal_player.toLowerCase().trim()
  const halfMatch = result.goal_half && guess.half === result.goal_half
  const minuteMatch = result.goal_minute && guess.minute === result.goal_minute

  breakdown.goals_match = goalsMatch
  breakdown.player_match = !!playerMatch
  breakdown.half_match = !!halfMatch

  // Check exact match (all correct)
  if (goalsMatch && playerMatch && halfMatch && minuteMatch) {
    breakdown.exact_match = true
    breakdown.base_points = 100
    breakdown.description.push('🎯 Acertou tudo! +100 pontos')
  } else if (playerMatch && halfMatch) {
    breakdown.base_points = 80
    breakdown.description.push('⚽ Acertou jogador e tempo! +80 pontos')
  } else if (playerMatch) {
    breakdown.base_points = 60
    breakdown.description.push('👤 Acertou o jogador! +60 pontos')
  } else if (halfMatch) {
    breakdown.base_points = 40
    breakdown.description.push('⏱️ Acertou o tempo! +40 pontos')
  } else if (goalsMatch) {
    breakdown.base_points = 30
    breakdown.description.push('🔢 Acertou a quantidade de gols! +30 pontos')
  }

  // Minute proximity bonus (only if not exact match and result has minute)
  if (!breakdown.exact_match && result.goal_minute) {
    const diff = Math.abs(guess.minute - result.goal_minute)
    if (diff <= 2) {
      breakdown.minute_bonus = 30
      breakdown.description.push(`🕐 Minuto muito próximo (${diff} min de diferença)! +30 pontos`)
    } else if (diff <= 5) {
      breakdown.minute_bonus = 20
      breakdown.description.push(`🕐 Minuto próximo (${diff} min de diferença)! +20 pontos`)
    } else if (diff <= 10) {
      breakdown.minute_bonus = 10
      breakdown.description.push(`🕐 Minuto razoável (${diff} min de diferença)! +10 pontos`)
    }
  }

  breakdown.total = breakdown.base_points + breakdown.minute_bonus
  return breakdown
}

export function formatPoints(points: number): string {
  return `${points} ${points === 1 ? 'ponto' : 'pontos'}`
}
