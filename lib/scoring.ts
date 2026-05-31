import { ScoreBreakdown, GameResult, Guess, GoalDetail } from '@/types'

function sortGoals(goalsList: GoalDetail[]): GoalDetail[] {
  return [...goalsList].sort((a, b) => {
    if (a.half === b.half) {
      return a.minute - b.minute
    }
    return a.half === 'first' ? -1 : 1
  })
}

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

  // Se não houver resultado válido cadastrado
  if (result.brazil_goals === undefined || result.brazil_goals === null) {
    return breakdown
  }

  const goalsMatch = guess.goals === result.brazil_goals
  breakdown.goals_match = goalsMatch

  // Caso 1: Ambos possuem o detalhamento de múltiplos gols (JSONB)
  const guessDetails = guess.goals_details || []
  const resultDetails = result.goals_details || []

  const hasDetails = (guess.goals > 0 && guessDetails.length > 0) || 
                     (result.brazil_goals > 0 && resultDetails.length > 0)

  if (hasDetails) {
    // Se o palpite de gols bateu
    if (goalsMatch) {
      if (guess.goals === 0) {
        breakdown.exact_match = true
        breakdown.base_points = 100
        breakdown.description.push('🎯 Acertou o placar de 0 gols! +100 pontos')
      } else {
        // Se acertou a quantidade de gols, adicionamos o bônus de placar (+30)
        breakdown.base_points += 30
        breakdown.description.push('🔢 Acertou a quantidade total de gols! +30 pontos')
      }
    }

    // Ordenar cronologicamente
    const sortedGuesses = sortGoals(guessDetails)
    const sortedActual = sortGoals(resultDetails)

    // Comparar gols correspondentes
    const compareCount = Math.min(sortedGuesses.length, sortedActual.length)
    let totalBase = breakdown.base_points
    let totalMinuteBonus = 0
    let matchCount = 0

    for (let i = 0; i < compareCount; i++) {
      const g = sortedGuesses[i]
      const a = sortedActual[i]

      const pMatch = g.player_name.toLowerCase().trim() === a.player_name.toLowerCase().trim()
      const hMatch = g.half === a.half
      const mMatch = g.minute === a.minute

      let goalBase = 0
      let goalMinuteBonus = 0
      let goalDesc = ''

      if (pMatch && hMatch && mMatch) {
        goalBase = 100
        goalDesc = `🎯 Gol ${i + 1}: Acertou tudo (${g.player_name}, ${g.minute}')! +100 pontos`
        matchCount++
      } else if (pMatch && hMatch) {
        goalBase = 80
        goalDesc = `⚽ Gol ${i + 1}: Acertou jogador e tempo (${g.player_name})! +80 pontos`
      } else if (pMatch) {
        goalBase = 60
        goalDesc = `👤 Gol ${i + 1}: Acertou o jogador (${g.player_name})! +60 pontos`
      } else if (hMatch) {
        goalBase = 40
        goalDesc = `⏱️ Gol ${i + 1}: Acertou o tempo (${g.half === 'first' ? '1ºT' : '2ºT'})! +40 pontos`
      }

      // Bônus de proximidade de minutos se não acertou tudo
      if (!(pMatch && hMatch && mMatch)) {
        const diff = Math.abs(g.minute - a.minute)
        if (g.half === a.half) { // apenas se o tempo (1ºT/2ºT) bater
          if (diff <= 2) {
            goalMinuteBonus = 30
            goalDesc += ` (🕐 Minuto muito próximo! +30)`
          } else if (diff <= 5) {
            goalMinuteBonus = 20
            goalDesc += ` (🕐 Minuto próximo! +20)`
          } else if (diff <= 10) {
            goalMinuteBonus = 10
            goalDesc += ` (🕐 Minuto razoável! +10)`
          }
        }
      }

      if (goalBase > 0 || goalMinuteBonus > 0) {
        totalBase += goalBase
        totalMinuteBonus += goalMinuteBonus
        breakdown.description.push(goalDesc)
      }
    }

    // Se todos os gols bateram perfeitamente e a quantidade de gols é igual
    if (goalsMatch && matchCount === guess.goals && guess.goals > 0) {
      breakdown.exact_match = true
    }

    breakdown.base_points = totalBase
    breakdown.minute_bonus = totalMinuteBonus
    breakdown.total = totalBase + totalMinuteBonus
    return breakdown
  }

  // Caso 2: Fallback para palpites antigos (legados de 1 gol)
  const resultPlayer = result.goal_player || ''
  const resultHalf = result.goal_half || ''
  const resultMinute = result.goal_minute || 0

  const playerMatch =
    resultPlayer &&
    guess.player_name.toLowerCase().trim() === resultPlayer.toLowerCase().trim()
  const halfMatch = resultHalf && guess.half === resultHalf
  const minuteMatch = resultMinute && guess.minute === resultMinute

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

  // Minute proximity bonus
  if (!breakdown.exact_match && resultMinute && guess.half === resultHalf) {
    const diff = Math.abs(guess.minute - resultMinute)
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
