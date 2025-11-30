import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Lock,
  GraduationCap,
  Users,
  Shield,
  Sparkles,
  Building2,
  Headset,
  Laptop,
  BarChart3,
  MessageCircle,
  Code,
  Globe,
  ChevronDown,
} from 'lucide-react';
import styles from './homeLanding.module.css';

const fadeInUp = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.65, ease: 'easeOut' },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: 'easeOut' },
};

const hoverLift = {
  whileHover: { y: -6, scale: 1.01 },
  transition: { duration: 0.22, ease: 'easeOut' },
};

type NavProps = { isScrolled: boolean };

export function HeaderNav({ isScrolled }: NavProps) {
  const [open, setOpen] = useState(false);

  const links = [
    { label: 'Foro', href: '#foro' },
    { label: 'Educación', href: '#educacion' },
    { label: 'Roadmap', href: '#roadmap' },
    { label: 'Comunidad', href: '#comunidad' },
    { label: 'Empresas', href: '#empresas' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
      <div className={`${styles.container} ${styles.headerInner}`}>
        <Link href="/" className={styles.logo} aria-label="Inicio PLOFTEC">
          <span className={styles.logoMark}>P</span>
          <span className={styles.logoText}>PLOFTEC</span>
        </Link>

        <nav className={`${styles.nav} ${open ? styles.navOpen : ''}`}>
          {links.map((link) => (
            <a
              key={link.href}
              className={styles.navLink}
              href={link.href}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/forum"
            className={`${styles.navLink} ${styles.navCta}`}
            onClick={() => setOpen(false)}
          >
            Entrar al foro
          </Link>
        </nav>

        <button
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          className={`${styles.mobileToggle} ${open ? styles.toggleOpen : ''}`}
          onClick={() => setOpen((p) => !p)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

export function HeroSection() {
  const highlights = [
    {
      title: 'Foro técnico',
      description: 'Preguntas, reputación, etiquetas y moderación cuidada.',
      icon: <Shield size={18} />,
    },
    {
      title: 'LiveHelp en minutos',
      description: 'Jitsi + pairing en tiempo real con especialistas.',
      icon: <Headset size={18} />,
    },
    {
      title: 'Academia guiada',
      description: 'Carreras prácticas de ciberseguridad 2026–2028.',
      icon: <GraduationCap size={18} />,
    },
  ];

  const miniStats = [
    { label: 'Respuestas en vivo', value: '< 10 min', accent: 'beta acompañada' },
    { label: 'Preguntas resueltas', value: '+1.200', accent: 'comunidad en crecimiento' },
    { label: 'Equipos en espera', value: '12 empresas', accent: 'pilotos B2B 2026' },
  ];

  return (
    <motion.section id="top" className={`${styles.section} ${styles.hero}`} {...fadeInUp}>
      <div className={styles.container}>
        <div className={styles.heroGrid}>
          <motion.div className={styles.heroContent} {...fadeInUp} transition={{ duration: 0.8 }}>
            <div className={styles.heroBadgeRow}>
              <span className={styles.heroBadge}>PLOFTEC · Seguridad 24/7</span>
              <span className={styles.heroBadgeGhost}>Aprender haciendo, sin humo</span>
            </div>

            <h1 className={styles.heroTitle}>
              La plataforma donde la ciberseguridad{' '}
              <span className={styles.gradientText}>se aprende haciendo.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Comunidad técnica, ayuda en vivo y una academia que nace desde el mundo real. Uní
              foros, sesiones 1:1 y rutas guiadas para crecer en Blue/Red Team sin perder tiempo.
            </p>

            <div className={styles.heroCtas}>
              <Link href="/forum" className={`${styles.button} ${styles.primaryButton}`}>
                Entrar al foro
                <ArrowUpRight size={16} />
              </Link>
              <a href="#roadmap" className={`${styles.button} ${styles.secondaryButton}`}>
                Ver roadmap educativo
              </a>
            </div>

            <p className={styles.trustNote}>
              Proyecto de tesis · Plataforma real en construcción 2026–2028 · Comunidad abierta
            </p>

            <div className={styles.heroHighlights}>
              {highlights.map((item) => (
                <motion.div
                  key={item.title}
                  className={styles.highlightCard}
                  {...hoverLift}
                  {...fadeInUp}
                  transition={{ duration: 0.5 }}
                >
                  <div className={styles.iconCircle}>{item.icon}</div>
                  <div>
                    <p className={styles.highlightTitle}>{item.title}</p>
                    <p className={styles.highlightDescription}>{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div className={styles.heroVisual} {...scaleIn}>
            <motion.div className={styles.glassCard} {...hoverLift}>
              <div className={styles.glassHeader}>
                <span className={styles.glassLabel}>Radar en vivo</span>
                <span className={styles.tag}>Beta</span>
              </div>
              <p className={styles.glassTitle}>
                LiveHelp + Foro + Academia en un único panel, pensado para equipos y autodidactas.
              </p>
              <div className={styles.miniStats}>
                {miniStats.map((stat) => (
                  <div key={stat.label} className={styles.miniStat}>
                    <span className={styles.miniLabel}>{stat.label}</span>
                    <span className={styles.miniValue}>{stat.value}</span>
                    <span className={styles.miniAccent}>{stat.accent}</span>
                  </div>
                ))}
              </div>
              <div className={styles.heroPills}>
                <span className={styles.heroTag}>Blue Team</span>
                <span className={styles.heroTag}>Red Team</span>
                <span className={styles.heroTag}>SecOps</span>
                <span className={styles.heroTag}>DevSecOps</span>
                <span className={styles.heroTag}>Cloud Security</span>
              </div>
            </motion.div>

            <motion.div className={styles.glassCardSecondary} {...hoverLift}>
              <div className={styles.glassHeader}>
                <span className={styles.glassLabel}>LiveHelp</span>
                <span className={`${styles.tag} ${styles.tagOutline}`}>En curso</span>
              </div>
              <p className={styles.glassTitle}>
                Combina Jitsi seguro, pairing guiado, templates de diagnóstico y checklists.
              </p>
              <div className={styles.miniStats}>
                <div className={styles.miniStat}>
                  <span className={styles.miniLabel}>Acompañamientos</span>
                  <span className={styles.miniValue}>+280</span>
                  <span className={styles.miniAccent}>Pruebas con analistas</span>
                </div>
                <div className={styles.miniStat}>
                  <span className={styles.miniLabel}>Playbooks</span>
                  <span className={styles.miniValue}>18</span>
                  <span className={styles.miniAccent}>IR, hardening, appsec</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.div
        className={`${styles.floatingOrb} ${styles.orbPrimary}`}
        animate={{ y: [0, -16, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className={`${styles.floatingOrb} ${styles.orbSecondary}`}
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.section>
  );
}

export function SplitSection() {
  const forumPoints = [
    'Respuestas expertas y reputación visible.',
    'Etiquetas, filtros y LiveHelp directo desde cada post.',
    'Moderación humana + IA para cuidar la calidad.',
  ];
  const educationPoints = [
    'Carreras por roles: Blue Team, AppSec, Cloud y Red Team.',
    'Labs guiados, retos y feedback con mentores.',
    'Certificados verificables y panel de progreso.',
  ];

  return (
    <section id="foro" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Foro activo · Academia en camino</span>
          <h2 className={styles.sectionTitle}>Conecta lo que ya existe con lo que viene</h2>
          <p className={styles.sectionSubtitle}>
            El foro ya está vivo. La academia se construye sobre los casos reales y métricas que
            levanta la comunidad.
          </p>
        </div>

        <div className={styles.splitGrid}>
          <motion.div className={`${styles.splitCard} ${styles.lockedCard}`} {...scaleIn}>
            <span className={`${styles.chip} ${styles.comingSoon}`}>
              <Lock size={14} />
              Coming soon
            </span>
            <h3 className={styles.splitTitle}>Academia PLOFTEC</h3>
            <p className={styles.splitDescription}>
              Rutas de aprendizaje con proyectos reales, laboratorios guiados y desafíos prácticos
              orientados a 2026–2028.
            </p>
            <ul className={styles.splitList}>
              {educationPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <div className={styles.timelineNote}>2026–2028 · lanzamientos escalonados</div>
          </motion.div>

          <motion.div className={`${styles.splitCard} ${styles.activeCard}`} {...scaleIn}>
            <span className={styles.chip}>Activo</span>
            <h3 className={styles.splitTitle}>Foro PLOFTEC</h3>
            <p className={styles.splitDescription}>
              Comunidad, reputación, etiquetas vivas y sesiones de ayuda en minutos. Una base sólida
              para aprender y colaborar.
            </p>
            <ul className={styles.splitList}>
              {forumPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <div className={styles.splitFooter}>
              <Link href="/forum" className={`${styles.button} ${styles.primaryButton}`}>
                Ir al foro
              </Link>
              <span className={styles.sectionSubtitle}>
                Comunidad disponible 24/7 · LiveHelp beta incluido
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function AudienceSection() {
  const audience = [
    {
      title: 'Estudiantes y juniors',
      description: 'Primeras prácticas guiadas, correcciones y feedback seguro.',
      icon: <GraduationCap size={18} />,
      bullets: ['Rutas desde cero', 'Playbooks descargables', 'Mentoría grupal'],
    },
    {
      title: 'Devs y analistas',
      description: 'Escala tus skills con casos reales y soporte en vivo.',
      icon: <Code size={18} />,
      bullets: ['AppSec y DevSecOps', 'Automatización y pipelines', 'Hardening práctico'],
    },
    {
      title: 'Empresas y líderes',
      description: 'Upskilling acelerado con métricas y seguimiento ejecutivo.',
      icon: <Building2 size={18} />,
      bullets: ['Panel de progreso', 'Informes ejecutivos', 'Entrenamientos custom'],
    },
    {
      title: 'Instructores',
      description: 'Espacio para publicar labs, retos y cohortes con impacto.',
      icon: <Users size={18} />,
      bullets: ['Templates de cursos', 'Recompensas por impacto', 'Comunidad lista para aprender'],
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Para quién es PLOFTEC</span>
          <h2 className={styles.sectionTitle}>Diseñado para quienes viven y respiran seguridad</h2>
          <p className={styles.sectionSubtitle}>
            Un hub que equilibra velocidad, profundidad técnica y guía humana.
          </p>
        </div>

        <div className={styles.cardsGrid}>
          {audience.map((item) => (
            <motion.div key={item.title} className={styles.card} {...hoverLift} {...fadeInUp}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>{item.icon}</div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
              </div>
              <p className={styles.cardDescription}>{item.description}</p>
              <ul className={styles.bulletList}>
                {item.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PillarsSection() {
  const pillars = [
    {
      title: 'Foro técnico',
      description: 'Preguntas de alto nivel, reputación clara y etiquetas vivas.',
      icon: <Sparkles size={18} />,
      bullets: ['Moderación + IA', 'Historias reales', 'Snippets y adjuntos'],
    },
    {
      title: 'LiveHelp en tiempo real',
      description: 'Acompañamiento con especialistas, Jitsi seguro y guías rápidas.',
      icon: <Headset size={18} />,
      bullets: ['Checklists listos', 'Diagnóstico en vivo', 'Grabaciones opcionales'],
    },
    {
      title: 'Academia de ciberseguridad',
      description: 'Carreras guiadas, labs y certificaciones prácticas.',
      icon: <Laptop size={18} />,
      bullets: ['Rutas por rol', 'Labs reproducibles', 'Mentoría y feedback'],
    },
  ];

  return (
    <section className={styles.section} id="educacion">
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Qué vas a encontrar</span>
          <h2 className={styles.sectionTitle}>Tres pilares, una sola experiencia</h2>
        </div>

        <div className={styles.pillarsGrid}>
          {pillars.map((pillar) => (
            <motion.div key={pillar.title} className={styles.card} {...hoverLift} {...fadeInUp}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>{pillar.icon}</div>
                <h3 className={styles.cardTitle}>{pillar.title}</h3>
              </div>
              <p className={styles.cardDescription}>{pillar.description}</p>
              <ul className={styles.bulletList}>
                {pillar.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RoadmapSection() {
  const items = [
    {
      year: '2025',
      title: 'Foro PLOFTEC en producción',
      description: 'Base de comunidad, reputación, etiquetas y búsqueda avanzada.',
      tag: 'Listo',
    },
    {
      year: '2026 Q1',
      title: 'LiveHelp Beta (Jitsi seguro)',
      description: 'Acompañamientos 1:1 y 1:N con checklists, agendas y seguimiento.',
      tag: 'En marcha',
    },
    {
      year: '2026 Q3',
      title: 'Cursos base y labs guiados',
      description: 'Fundamentos Blue/Red Team, DevSecOps y laboratorios reproducibles.',
      tag: 'Próximamente',
    },
    {
      year: '2027',
      title: 'Especializaciones avanzadas',
      description: 'Rutas por rol, retos, simulacros de IR y labs ofensivos/defensivos.',
      tag: 'Planificado',
    },
    {
      year: '2027 Q4',
      title: 'Panel empresas y reporting',
      description: 'Upskilling de equipos, métricas de progreso y cumplimiento.',
      tag: 'B2B',
    },
    {
      year: '2028',
      title: 'Certificaciones y rutas personalizadas',
      description: 'Ecosistema completo para talento, instructores y empresas.',
      tag: 'Objetivo',
    },
  ];

  return (
    <section id="roadmap" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Roadmap 2025–2028</span>
          <h2 className={styles.sectionTitle}>Construimos sobre lo que medimos</h2>
          <p className={styles.sectionSubtitle}>
            Hitos claros para que la comunidad, la academia y las empresas crezcan juntas.
          </p>
        </div>

        <div className={styles.roadmapList}>
          {items.map((item) => (
            <motion.div key={item.title} className={styles.roadmapItem} {...fadeInUp}>
              <div className={styles.roadmapYear}>{item.year}</div>
              <div className={styles.roadmapTitleRow}>
                <h3 className={styles.roadmapTitle}>{item.title}</h3>
                <span className={`${styles.tag} ${styles.tagOutline}`}>{item.tag}</span>
              </div>
              <p className={styles.roadmapDescription}>{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MetricsSection() {
  const metrics = [
    { value: '+1.2K', label: 'Preguntas respondidas en el foro' },
    { value: '< 10 min', label: 'Tiempo objetivo de respuesta en LiveHelp beta' },
    { value: '92%', label: 'Usuarios que recomiendan la comunidad' },
    { value: '18', label: 'Playbooks listos para incidentes y hardening' },
    { value: '+35', label: 'Mentores y líderes técnicos listos para guiar' },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Métricas y social proof</span>
          <h2 className={styles.sectionTitle}>Transparencia y foco en impacto</h2>
        </div>

        <div className={styles.metricsGrid}>
          {metrics.map((metric) => (
            <motion.div key={metric.label} className={styles.metricCard} {...hoverLift} {...fadeInUp}>
              <div className={styles.metricValue}>{metric.value}</div>
              <div className={styles.metricLabel}>{metric.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CommunitySection() {
  const items = [
    {
      title: 'Comunidad y LiveHelp',
      description: 'Sesiones 1:1 y 1:N con Jitsi, templates y follow-up automático.',
      icon: <Headset size={18} />,
    },
    {
      title: 'Canales en vivo',
      description: 'Foros, salas temáticas y chats moderados para mover rápido.',
      icon: <MessageCircle size={18} />,
    },
    {
      title: 'Recursos prácticos',
      description: 'Checklists, snippets, dashboards y kits para intervenir.',
      icon: <BarChart3 size={18} />,
    },
  ];

  return (
    <section id="comunidad" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Comunidad y LiveHelp</span>
          <h2 className={styles.sectionTitle}>Acompañamiento real, no solo teoría</h2>
        </div>

        <div className={styles.communityGrid}>
          {items.map((item) => (
            <motion.div key={item.title} className={styles.communityCard} {...hoverLift} {...fadeInUp}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>{item.icon}</div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
              </div>
              <p className={styles.cardDescription}>{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CompaniesSection() {
  const benefits = [
    'Planes de upskilling por rol y seniority.',
    'Informes ejecutivos y métricas accionables.',
    'Entrenamientos custom con instructores validados.',
    'Panel para líderes: progreso, riesgos y próximos pasos.',
  ];

  return (
    <section id="empresas" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Para empresas</span>
          <h2 className={styles.sectionTitle}>Upskilling que se ve en producción</h2>
          <p className={styles.sectionSubtitle}>
            PLOFTEC acompaña a los equipos con labs, métricas y soporte en vivo para que el
            aprendizaje se traduzca en seguridad real.
          </p>
        </div>

        <div className={styles.companiesGrid}>
          <motion.div className={styles.communityCard} {...hoverLift} {...fadeInUp}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <Building2 size={18} />
              </div>
              <h3 className={styles.cardTitle}>Panel de líderes</h3>
            </div>
            <p className={styles.cardDescription}>
              Visibilidad de progreso, adoption score y seguimiento de cohortes.
            </p>
            <ul className={styles.companiesList}>
              {benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </motion.div>

          <motion.div className={styles.communityCard} {...hoverLift} {...fadeInUp}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <Globe size={18} />
              </div>
              <h3 className={styles.cardTitle}>Programas B2B</h3>
            </div>
            <p className={styles.cardDescription}>
              Cohortes privadas, labs en contenedores seguros y check-ins con especialistas.
            </p>
            <ul className={styles.bulletList}>
              <li>Integramos tus políticas y tecnologías.</li>
              <li>Reportes listos para auditoría y compliance.</li>
              <li>Soporte en vivo para incidentes y hardening.</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        '“LiveHelp me salvó en un incidente real. En 15 minutos tenía un plan claro y un playbook listo.”',
      by: 'Analista Blue Team · Empresa fintech',
    },
    {
      quote:
        '“El foro es práctico: respuestas claras, snippets y feedback de gente que está en proyectos reales.”',
      by: 'Desarrollador AppSec',
    },
    {
      quote:
        '“Como instructora puedo testear labs con la comunidad antes de lanzar cohortes completas.”',
      by: 'Instructora Red Team',
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Testimonios y frases</span>
          <h2 className={styles.sectionTitle}>Lo que ya dicen de PLOFTEC</h2>
        </div>

        <div className={styles.testimonials}>
          {testimonials.map((item) => (
            <motion.div key={item.by} className={styles.testimonialCard} {...hoverLift} {...fadeInUp}>
              <p className={styles.quote}>{item.quote}</p>
              <p className={styles.quoteBy}>{item.by}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FAQSection() {
  const faqs: Array<{ question: string; answer: string }> = [
    {
      question: '¿Qué es PLOFTEC?',
      answer:
        'Una plataforma de foro técnico, ayuda en vivo y academia práctica enfocada 100% en ciberseguridad.',
    },
    {
      question: '¿Es gratis?',
      answer:
        'El foro es abierto. LiveHelp y la academia tendrán planes gratuitos y de pago según acompañamiento y labs.',
    },
    {
      question: '¿Cómo se financia?',
      answer:
        'Modelo freemium para la comunidad, planes B2B para empresas y programas premium con instructores.',
    },
    {
      question: '¿Para quién está pensado?',
      answer:
        'Para estudiantes, analistas, devs, instructores y empresas que necesiten upskilling real en seguridad.',
    },
    {
      question: '¿Proyecto de tesis o producto real?',
      answer: 'Ambos: nace como tesis pero se construye como producto listo para producción 2026–2028.',
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>FAQ</span>
          <h2 className={styles.sectionTitle}>Preguntas frecuentes</h2>
        </div>

        <div className={styles.faqList}>
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div key={faq.question} className={styles.faqItem} {...fadeInUp}>
                <button
                  className={`${styles.faqQuestion} ${isOpen ? styles.faqQuestionOpen : ''}`}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={styles.faqIcon} />
                </button>
                {isOpen && <p className={styles.faqAnswer}>{faq.answer}</p>}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function FooterSection() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          <div>
            <div className={styles.logo}>
              <span className={styles.logoMark}>P</span>
              <span className={styles.logoText}>PLOFTEC</span>
            </div>
            <p className={styles.sectionSubtitle}>
              Foro técnico, LiveHelp y academia en construcción. Ciberseguridad que se aprende
              haciendo.
            </p>
          </div>
          <div className={styles.footerLinks}>
            <Link href="/forum">Foro</Link>
            <a href="#comunidad">Comunidad</a>
            <a href="#roadmap">Roadmap</a>
            <a href="#empresas">Empresas</a>
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
          <p className={styles.footerNote}>
            Proyecto de tesis · Plataforma real en construcción 2026–2028 · Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
