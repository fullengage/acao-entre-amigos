import Link from 'next/link'

export const metadata = {
  title: 'Regulamento — Bolão da COPA 2026',
  description:
    'Confira as regras de pontuação, custos de participação e divisão de prêmios do Bolão da Copa 2026 da Comunidade Voz de Deus.',
}

export default function RegulamentoPage() {
  return (
    <main style={{ padding: '40px 16px 80px' }}>
      <div className="container-app" style={{ maxWidth: 800 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(0,156,59,0.1)',
              border: '1px solid rgba(0,156,59,0.3)',
              borderRadius: 999,
              padding: '6px 18px',
              color: '#00C94F',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            📜 Regras Oficiais
          </div>
          <h1
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              color: 'white',
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            <span className="text-gradient-brazil">Regulamento</span> do Bolão
          </h1>
          <p style={{ color: '#8899bb', fontSize: '0.95rem' }}>
            Bolão da COPA 2026 — Comunidade Voz de Deus
          </p>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Card 1: Como Funciona */}
          <div className="glass-card" style={{ padding: 28 }}>
            <h2
              style={{
                fontSize: '1.3rem',
                fontWeight: 700,
                color: 'white',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span>⚽</span> Como Funciona a Participação
            </h2>
            <div
              style={{
                color: '#aabbdd',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <p>
                1. <strong>Registro de Palpites</strong>: Os participantes podem registrar seus
                palpites para qualquer jogo disponível da Seleção Brasileira. Cada palpite custa{' '}
                <strong>R$ 10,00</strong>.
              </p>
              <p>
                2. <strong>Detalhamento dos Gols</strong>: Ao definir que o Brasil fará <em>N</em>{' '}
                gols, o participante deve detalhar para cada um dos <em>N</em> gols:
              </p>
              <ul
                style={{
                  paddingLeft: 20,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <li>
                  <strong>Autor do gol</strong> (selecionado entre os jogadores escalados ou "Outro");
                </li>
                <li>
                  <strong>Tempo</strong> (1º Tempo ou 2º Tempo);
                </li>
                <li>
                  <strong>Minuto aproximado</strong> (1 a 90).
                </li>
              </ul>
              <p>
                3. <strong>Confirmação de Pagamento</strong>: O palpite só será computado no ranking
                oficial e considerado válido para premiação após o envio do comprovante PIX via
                WhatsApp e confirmação manual pelo administrador.
              </p>
            </div>
          </div>

          {/* Card 2: Pontuação */}
          <div className="glass-card" style={{ padding: 28 }}>
            <h2
              style={{
                fontSize: '1.3rem',
                fontWeight: 700,
                color: 'white',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span>🎯</span> Sistema de Pontuação
            </h2>
            <p style={{ color: '#aabbdd', fontSize: '0.95rem', marginBottom: 20, lineHeight: 1.6 }}>
              Os gols previstos e os gols reais são ordenados <strong>cronologicamente</strong> (1º
              Tempo antes de 2º Tempo, e por minuto crescente) e comparados par-a-par. A pontuação
              de cada gol é calculada conforme os critérios abaixo:
            </p>

            <div style={{ overflowX: 'auto', marginBottom: 20 }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  color: '#aabbdd',
                  fontSize: '0.9rem',
                }}
              >
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '12px 8px',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    >
                      Acerto
                    </th>
                    <th
                      style={{
                        textAlign: 'right',
                        padding: '12px 8px',
                        color: '#FFDF00',
                        fontWeight: 600,
                      }}
                    >
                      Pontos
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '10px 8px' }}>
                      Tudo Exato (Autor + Tempo + Minuto Exato)
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        padding: '10px 8px',
                        color: '#00C94F',
                        fontWeight: 700,
                      }}
                    >
                      100
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '10px 8px' }}>Autor + Tempo</td>
                    <td style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 600 }}>80</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '10px 8px' }}>Só Autor do Gol</td>
                    <td style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 600 }}>60</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '10px 8px' }}>Só o Tempo (1ºT ou 2ºT)</td>
                    <td style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 600 }}>40</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '10px 8px' }}>
                      Quantidade de Gols Prevista para o Gol
                    </td>
                    <td style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 600 }}>30</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', marginBottom: 12 }}>
              ⚡ Bônus Extras por Gol:
            </h3>
            <ul
              style={{
                paddingLeft: 20,
                margin: '0 0 20px',
                color: '#aabbdd',
                fontSize: '0.9rem',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                lineHeight: 1.5,
              }}
            >
              <li>
                <strong>+30 pontos</strong> se acertar o minuto exato com margem de até 2 minutos de
                diferença (ex: palpite 15', real 13' a 17').
              </li>
              <li>
                <strong>+20 pontos</strong> se acertar o minuto com margem de até 5 minutos de
                diferença.
              </li>
              <li>
                <strong>+10 pontos</strong> se acertar o minuto com margem de até 10 minutos de
                diferença.
              </li>
            </ul>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', marginBottom: 12 }}>
              🏆 Bônus Match Geral:
            </h3>
            <p style={{ color: '#aabbdd', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
              Caso o participante acerte a <strong>quantidade total exata de gols</strong> do Brasil
              na partida (ex: previu 4 gols e o Brasil fez exatamente 4 gols), ele recebe um bônus
              adicional de <strong>+30 pontos</strong> na pontuação final do jogo.
            </p>
          </div>

          {/* Card 3: Financeiro */}
          <div className="glass-card" style={{ padding: 28 }}>
            <h2
              style={{
                fontSize: '1.3rem',
                fontWeight: 700,
                color: 'white',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span>💰</span> Divisão Financeira e Destinação dos Fundos
            </h2>
            <div
              style={{
                color: '#aabbdd',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <p>
                A arrecadação obtida através dos palpites confirmados (R$ 10,00 por palpite) será
                integralmente destinada conforme os seguintes percentuais:
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                  margin: '12px 0',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    padding: 16,
                    background: 'rgba(0,156,59,0.1)',
                    border: '1px solid rgba(0,156,59,0.2)',
                    borderRadius: 12,
                  }}
                >
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#00C94F' }}>50%</div>
                  <div style={{ fontSize: '0.78rem', color: '#aabbdd', marginTop: 4, fontWeight: 600 }}>
                    Prêmio ao Vencedor
                  </div>
                </div>
                <div
                  style={{
                    padding: 16,
                    background: 'rgba(255,223,0,0.1)',
                    border: '1px solid rgba(255,223,0,0.2)',
                    borderRadius: 12,
                  }}
                >
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFDF00' }}>50%</div>
                  <div style={{ fontSize: '0.78rem', color: '#aabbdd', marginTop: 4, fontWeight: 600 }}>
                    Comunidade Voz de Deus
                  </div>
                </div>
              </div>
              <p>
                - <strong>Prêmio ao Vencedor</strong>: O participante que acumular mais pontos no
                respectivo jogo receberá metade do valor total arrecadado daquele jogo. Em caso de
                empate na pontuação máxima, o prêmio será dividido igualmente entre os vencedores.
              </p>
              <p>
                - <strong>Acerto Mínimo / Destinação Alternativa</strong>: Caso nenhum participante
                consiga pontuar no jogo (todos terminem com 0 pontos), o valor correspondente ao
                prêmio do vencedor (50% da arrecadação) não será distribuído e será revertido
                integralmente (100% do total arrecadado no jogo) para as obras e manutenção da{' '}
                <strong>Comunidade Voz de Deus</strong>.
              </p>
              <p>
                - <strong>Fundo Comunitário</strong>: Em situações regulares de premiação, os outros 50%
                são integralmente revertidos para a <strong>Comunidade Voz de Deus</strong> (Novo
                Horizonte-SP) para auxílio nos custos dos projetos recreativos e manutenção do espaço
                físico da comunidade.
              </p>
            </div>
          </div>

          {/* Card 4: Termos e Condições */}
          <div className="glass-card" style={{ padding: 28 }}>
            <h2
              style={{
                fontSize: '1.3rem',
                fontWeight: 700,
                color: 'white',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span>⚖️</span> Termos e Condições Importantes
            </h2>
            <div
              style={{
                color: '#aabbdd',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <p>
                • Este sistema é destinado exclusivamente a uma brincadeira recreativa e
                colaborativa de caráter privado entre amigos, familiares e participantes da
                comunidade.
              </p>
              <p>
                • <strong>Não se trata de plataforma de apostas esportivas</strong>, cassino
                online, exploração comercial de sorteios ou atividade de jogo de azar profissional.
              </p>
              <p>
                • Todos os lançamentos de resultados oficiais e o cálculo das pontuações são de
                responsabilidade da administração do bolão e serão feitos com base nos dados reais
                ocorridos em campo na Copa do Mundo de 2026.
              </p>
              <p>
                • A devolução ou cancelamento de palpites confirmados só será permitida caso
                solicitada até 1 hora antes do início do jogo correspondente.
              </p>
            </div>
          </div>
        </div>

        {/* Back button */}
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <Link href="/">
            <button
              className="btn-primary"
              style={{
                padding: '12px 28px',
                fontSize: '0.95rem',
                borderRadius: 12,
              }}
            >
              ⚽ Voltar para Início
            </button>
          </Link>
        </div>
      </div>
    </main>
  )
}
