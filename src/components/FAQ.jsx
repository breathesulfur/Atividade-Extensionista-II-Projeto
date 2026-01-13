import React from 'react'
import './FAQ.css'

function FAQ({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="faq-modal-overlay" onClick={onClose}>
      <div className="faq-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="faq-header">
          <h2 className="faq-title">❓ Perguntas Frequentes</h2>
          <button onClick={onClose} className="faq-close-button" aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className="faq-body">
          {/* Como funciona o app */}
          <section className="faq-section">
            <h3 className="faq-section-title">📱 Como funciona o app?</h3>
            <p className="faq-text">
              O InclusivChat é uma plataforma gamer inclusiva e segura para mulheres e comunidade LGBTQIAPN+.
              Aqui você pode:
            </p>
            <ul className="faq-list">
              <li>💬 Criar e interagir com postagens sobre jogos</li>
              <li>🎮 Participar de grupos temáticos por jogo</li>
              <li>👤 Personalizar seu perfil com pronomes, bio e avatar</li>
              <li>🔮 Ganhar Essências por suas ações positivas</li>
              <li>🏆 Conquistar selos e títulos místicos</li>
              <li>🎨 Personalizar temas e molduras de avatar</li>
            </ul>
          </section>

          {/* Como ganhar essências */}
          <section className="faq-section">
            <h3 className="faq-section-title">🔮 Como ganhar Essências?</h3>
            <p className="faq-text">
              Você ganha Essências realizando ações positivas na comunidade:
            </p>
            <ul className="faq-list">
              <li><strong>+10 Essências</strong> - Criar uma postagem respeitosa (sem denúncias por 48h)</li>
              <li><strong>+5 Essências</strong> - Fazer um comentário de apoio</li>
              <li><strong>+15 Essências</strong> - Denunciar conteúdo ofensivo corretamente</li>
              <li><strong>+10 Essências</strong> - Participar de um grupo inclusivo (apenas na primeira vez)</li>
              <li><strong>+20 Essências</strong> - Completar seu perfil (pronomes + bio)</li>
              <li><strong>+10 Essências</strong> - Fazer login por 3 dias consecutivos</li>
              <li><strong>+10 Essências</strong> - Criar seu primeiro grupo</li>
              <li><strong>+5 Essências</strong> - Criar grupos adicionais</li>
            </ul>
            <p className="faq-text faq-note">
              💡 A cada 50 Essências conquistadas, você ganha um bônus de +10 Essências!
            </p>
          </section>

          {/* Como funcionam os Selos e os Títulos */}
          <section className="faq-section">
            <h3 className="faq-section-title">🌱 Como funcionam os Selos e os Títulos?</h3>
            
            <p className="faq-text">
              Os Selos e Títulos são conquistas simbólicas que reconhecem comportamentos positivos recorrentes 
              dentro da comunidade, baseados na qualidade das interações, e não apenas na quantidade.
            </p>

            <div className="faq-rewards">
              <h4 className="faq-subsection-title">🏆 Selos</h4>
              <p className="faq-text">
                Os Selos representam tipos específicos de contribuição positiva, sendo concedidos automaticamente 
                conforme o comportamento do usuário. Cada Selo reconhece uma forma única de participar da comunidade.
              </p>
              <ul className="faq-list">
                <li><strong>💬 Voz Gentil</strong> - Reconhece interações respeitosas e comunicação cuidadosa.</li>
                <li><strong>💜 Aura de Apoio</strong> - Concedido a quem oferece apoio genuíno em interações com outras pessoas.</li>
                <li><strong>🛡️ Guardião do Espaço</strong> - Reconhece a colaboração na manutenção de um ambiente seguro.</li>
                <li><strong>🌈 Círculo de Pertencimento</strong> - Representa participação ativa em grupos inclusivos.</li>
                <li><strong>🔮 Essência Revelada</strong> - Simboliza o cuidado com a própria identidade dentro do app.</li>
                <li><strong>🕯️ Ritual Diário</strong> - Reconhece constância e presença equilibrada na comunidade.</li>
              </ul>
              <p className="faq-text">
                Os Selos aparecem no perfil do usuário na seção "Conquistas". Eles não são competitivos nem possuem ranking.
              </p>

              <h4 className="faq-subsection-title">✨ Títulos Místicos</h4>
              <p className="faq-text">
                Os Títulos são desbloqueados ao longo do tempo, a partir da combinação de diferentes ações positivas, 
                representando níveis de envolvimento e maturidade comunitária.
              </p>
              <ul className="faq-list">
                <li><strong>🌙 Caminhante Serena</strong> - Para quem mantém interações respeitosas de forma consistente.</li>
                <li><strong>💜 Guardiã do Acolhimento</strong> - Para quem cuida do próprio perfil e apoia outras pessoas.</li>
                <li><strong>🔮 Tecelã de Conexões</strong> - Para quem participa ativamente de grupos inclusivos.</li>
                <li><strong>💝 Alma Gentil</strong> - Para quem espalha gentileza nas interações.</li>
                <li><strong>📚 Mentora Sábia</strong> - Para quem compartilha apoio e experiências construtivas.</li>
                <li><strong>💖 Guardiã do Coração</strong> - Reconhecimento máximo de cuidado e proteção da comunidade.</li>
              </ul>
            </div>

            <div className="faq-note">
              <p className="faq-text">
                <strong>Observações importantes:</strong> Não há ranking público. As recompensas não incentivam volume 
                excessivo de ações. O foco do sistema é acolhimento, constância e respeito.
              </p>
            </div>
          </section>

          {/* Créditos */}
          <section className="faq-section faq-credits">
            <p className="faq-credits-text">
              Criado com 💜 por <strong>Luiza C - 2026</strong>
            </p>
          </section>
        </div>

        <div className="faq-footer">
          <button onClick={onClose} className="faq-button">
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

export default FAQ
