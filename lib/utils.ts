import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function formatTime(timeStr: string): string {
  return timeStr.substring(0, 5)
}

export function formatWhatsApp(number: string): string {
  const digits = number.replace(/\D/g, '')
  return `https://wa.me/${digits}`
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatOrdinal(n: number): string {
  const ordinals = ['', '1º', '2º', '3º', '4º', '5º', '6º', '7º', '8º', '9º', '10º']
  return ordinals[n] || `${n}º`
}

export function halfLabel(half: string): string {
  return half === 'first' ? 'Primeiro Tempo' : 'Segundo Tempo'
}

export function goalsLabel(goals: number): string {
  if (goals >= 5) return '5 gols ou mais'
  return `${goals} ${goals === 1 ? 'gol' : 'gols'}`
}

export function isGuessesClosed(matchDate: string, matchTime: string, status: string): boolean {
  if (status === 'finished') return true
  const matchDateTime = new Date(`${matchDate}T${matchTime}-03:00`)
  const limitTime = new Date(matchDateTime.getTime() - 10 * 60 * 1000)
  return new Date() > limitTime
}

