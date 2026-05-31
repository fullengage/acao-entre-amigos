/**
 * Gera payload PIX BR Code (Copia e Cola) para pagamento manual
 * Seguindo o padrão EMV QR Code do Banco Central do Brasil
 */

function crc16(str: string): string {
  let crc = 0xffff
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021
      } else {
        crc <<= 1
      }
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0')
}

function emv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0')
  return `${id}${len}${value}`
}

export interface PixPayload {
  key: string
  name: string
  city: string
  amount: number
  description?: string
  txid?: string
}

export function generatePixPayload(params: PixPayload): string {
  const {
    key,
    name,
    city,
    amount,
    description = 'Bolao Selecao 2026',
    txid = '***',
  } = params

  const pixKey = emv('01', key)
  const pixDescription = emv('02', description.substring(0, 72))
  const merchantAccountInfo = emv('26', emv('00', 'BR.GOV.BCB.PIX') + pixKey + pixDescription)

  const amountStr = amount.toFixed(2)

  const payload =
    emv('00', '01') +
    merchantAccountInfo +
    emv('52', '0000') +
    emv('53', '986') +
    emv('54', amountStr) +
    emv('58', 'BR') +
    emv('59', name.substring(0, 25)) +
    emv('60', city.substring(0, 15)) +
    emv('62', emv('05', txid.substring(0, 25))) +
    '6304'

  const crc = crc16(payload)
  return payload + crc
}

export const PIX_CONFIG = {
  key: '25598513854',
  name: 'Richard Wagner O Portela',
  city: 'Novo Horizonte',
  amount: 10.0,
  description: 'Bolao Selecao 2026',
} as const

export const PIX_DISPLAY = {
  key: '255.985.138-54',
  fullName: 'Richard Wagner de Oliveira Portela',
  description: 'Fundador da Comunidade Voz de Deus',
  city: 'Novo Horizonte - SP',
  amount: 10.0,
} as const
