import Link from 'next/link';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  animate,
  motion,
  useAnimationControls,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionProps,
  type Transition,
} from 'framer-motion';
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

const viewportConfig = { once: false, amount: 0.4 };
const baseTransition = { duration: 0.7, ease: 'easeOut' };

const variants = {
  fadeInUp: {
    initial: { opacity: 0.55, y: 30, filter: 'brightness(0.68) saturate(0.9)' },
    animate: { opacity: 1, y: 0, filter: 'brightness(1) saturate(1)' },
  },
  slideLeft: {
    initial: { opacity: 0.55, x: -40, filter: 'brightness(0.68) saturate(0.9)' },
    animate: { opacity: 1, x: 0, filter: 'brightness(1) saturate(1)' },
  },
  slideRight: {
    initial: { opacity: 0.55, x: 40, filter: 'brightness(0.68) saturate(0.9)' },
    animate: { opacity: 1, x: 0, filter: 'brightness(1) saturate(1)' },
  },
  scalePop: {
    initial: { opacity: 0.5, scale: 0.9, filter: 'brightness(0.65) saturate(0.88)' },
    animate: { opacity: 1, scale: 1, filter: 'brightness(1) saturate(1)' },
  },
  rotateInLeft: {
    initial: { opacity: 0.55, y: 26, rotate: -2, filter: 'brightness(0.68) saturate(0.9)' },
    animate: { opacity: 1, y: 0, rotate: 0, filter: 'brightness(1) saturate(1)' },
  },
  rotateInRight: {
    initial: { opacity: 0.55, y: 26, rotate: 2, filter: 'brightness(0.68) saturate(0.9)' },
    animate: { opacity: 1, y: 0, rotate: 0, filter: 'brightness(1) saturate(1)' },
  },
  skewUp: {
    initial: { opacity: 0.55, y: 28, skewY: -1.5, filter: 'brightness(0.68) saturate(0.9)' },
    animate: { opacity: 1, y: 0, skewY: 0, filter: 'brightness(1) saturate(1)' },
  },
};

const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  slideLeft: {
    initial: { x: -40 },
    animate: { x: 0 },
  },
  slideRight: {
    initial: { x: 40 },
    animate: { x: 0 },
  },
  skewUp: {
    initial: { y: 28, skewY: -1.5 },
    animate: { y: 0, skewY: 0 },
  },
  scalePop: {
    initial: { scale: 0.9 },
    animate: { scale: 1 },
  },
};

function useCardIllumination(prefersReducedMotion: boolean) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['center 92%', 'center 8%'],
  });

  if (prefersReducedMotion) {
    return { ref, style: { opacity: 1, filter: 'none' } };
  }

  const focusOpacity = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [0.6, 0.88, 1, 0.88, 0.6]);
  const focusBrightness = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [0.95, 1.08, 1.2, 1.08, 0.95]);
  const focusSaturation = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [0.98, 1.1, 1.2, 1.1, 0.98]);

  return {
    ref,
    style: {
      opacity: focusOpacity,
      filter: useMotionTemplate`brightness(${focusBrightness}) saturate(${focusSaturation})`,
    },
  };
}

type IlluminatedCardProps = {
  children: ReactNode;
  variant: (typeof cardVariants)[keyof typeof cardVariants];
  transition?: Transition;
  whileHover?: MotionProps['whileHover'];
  className?: string;
  prefersReducedMotion: boolean;
};

type IlluminatedBlockProps = {
  children: ReactNode;
  className: string;
  variant?: MotionProps['variants'];
  transition?: Transition;
  whileHover?: MotionProps['whileHover'];
  prefersReducedMotion: boolean;
  viewportAmount?: number;
};

function IlluminatedCard({
  children,
  variant,
  transition,
  whileHover,
  className,
  prefersReducedMotion,
}: IlluminatedCardProps) {
  const { ref, style } = useCardIllumination(prefersReducedMotion);

  return (
    <motion.div
      ref={ref}
      className={className ? `${styles.card} ${className}` : styles.card}
      initial={variant.initial}
      whileInView={variant.animate}
      viewport={{ amount: 0.72, margin: '-10% 0% -10% 0%', once: false }}
      transition={transition ?? baseTransition}
      whileHover={whileHover}
      style={style}
    >
      {children}
    </motion.div>
  );
}

function IlluminatedBlock({
  children,
  className,
  variant,
  transition,
  whileHover,
  prefersReducedMotion,
  viewportAmount,
}: IlluminatedBlockProps) {
  const { ref, style } = useCardIllumination(prefersReducedMotion);

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={variant}
      initial={variant ? 'initial' : undefined}
      whileInView={variant ? 'animate' : undefined}
      viewport={{ amount: viewportAmount ?? 0.72, margin: '-10% 0% -10% 0%', once: false }}
      transition={transition ?? baseTransition}
      whileHover={whileHover}
      style={style}
    >
      {children}
    </motion.div>
  );
}

function useTypingEffect(text: string, enabled: boolean, prefersReducedMotion: boolean) {
  const [display, setDisplay] = useState(prefersReducedMotion || !enabled ? text : '');
  const [done, setDone] = useState(prefersReducedMotion || !enabled);
  const [typing, setTyping] = useState(enabled && !prefersReducedMotion);

  useEffect(() => {
    if (!enabled || prefersReducedMotion) {
      setDisplay(text);
      setDone(true);
      setTyping(false);
      return;
    }

    setDisplay('');
    setDone(false);
    setTyping(true);

    let cancelled = false;
    let idx = 0;
    const pauses = new Set([text.indexOf('ciberseguridad') + 'ciberseguridad'.length, text.lastIndexOf('haciendo')]);

    const step = () => {
      if (cancelled) return;
      setDisplay(text.slice(0, idx + 1));
      idx += 1;
      if (idx >= text.length) {
        setDone(true);
        setTyping(false);
        return;
      }
      let delay = 38 + Math.random() * 45;
      if (pauses.has(idx)) delay += 260;
      const timer = setTimeout(step, delay);
      return () => clearTimeout(timer);
    };

    const initialTimer = setTimeout(step, 220);

    return () => {
      cancelled = true;
      clearTimeout(initialTimer);
    };
  }, [enabled, prefersReducedMotion, text]);

  return { display, done, typing };
}

function AnimatedNumber({ value, start, prefix = '', suffix = '', duration = 0.8 }: { value: number; start: boolean; prefix?: string; suffix?: string; duration?: number }) {
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const unsub = motionValue.on('change', (v) => {
      setDisplay(Math.round(v).toLocaleString('es-AR'));
    });
    return () => unsub();
  }, [motionValue]);

  useEffect(() => {
    if (!start) return;
    const controls = animate(motionValue, value, { duration, ease: 'easeOut' });
    return () => controls.stop();
  }, [motionValue, start, value, duration]);

  return (
    <span>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

type NavProps = { isScrolled: boolean; activeSection: string; onNavClick: (id: string) => void };

export function HeaderNav({ isScrolled, activeSection, onNavClick }: NavProps) {
  const [open, setOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const links = [
    { label: 'Foro', href: 'foro' },
    { label: 'Educación', href: 'educacion' },
    { label: 'Roadmap', href: 'roadmap' },
    { label: 'Comunidad', href: 'comunidad' },
    { label: 'Empresas', href: 'empresas' },
    { label: 'FAQ', href: 'faq' },
  ];

  const handleClick = (id: string) => {
    setOpen(false);
    onNavClick(id);
  };

  return (
    <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
      <div className={`${styles.container} ${styles.headerInner}`}>
        <Link href="/" className={styles.logo} aria-label="Inicio PLOFTEC">
          <span className={styles.logoMark}>P</span>
          <span className={styles.logoText}>PLOFTEC</span>
        </Link>

        <nav className={`${styles.nav} ${open ? styles.navOpen : ''}`}>
          {links.map((link) => (
            <button
              key={link.href}
              className={`${styles.navLink} ${
                activeSection === link.href ? styles.navLinkActive : ''
              }`}
              onClick={() => handleClick(link.href)}
              aria-current={activeSection === link.href ? 'page' : undefined}
            >
              {link.label}
              <motion.span
                className={styles.navActivePill}
                layout
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 280, damping: 26 }
                }
                style={{
                  opacity: activeSection === link.href ? 1 : 0,
                  scale: activeSection === link.href ? 1 : 0.8,
                }}
              />
            </button>
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
  const prefersReducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const orbY = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : -30]);
  const orbX = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : 20]);
  const [shouldType, setShouldType] = useState(false);
  const ctaControls = useAnimationControls();
  const [caretVisible, setCaretVisible] = useState(false);
  const heroTitle = 'La plataforma donde la ciberseguridad se aprende haciendo.';
  const { display: typedTitle, done: typingDone, typing } = useTypingEffect(
    heroTitle,
    shouldType,
    prefersReducedMotion
  );
  const heroReady = typingDone || !shouldType;
  const showRest = prefersReducedMotion || heroReady;

  useEffect(() => {
    if (prefersReducedMotion) {
      setShouldType(false);
      return;
    }
    const atTop = typeof window !== 'undefined' ? window.scrollY < 20 : true;
    setShouldType(atTop);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!heroReady || prefersReducedMotion) {
      ctaControls.set({ scale: 1 });
      return;
    }
    const timer = setTimeout(() => {
      ctaControls.start({ scale: [1, 1.04, 1], transition: { duration: 0.5, ease: 'easeInOut' } });
    }, 1100);
    return () => clearTimeout(timer);
  }, [ctaControls, heroReady, prefersReducedMotion]);

  useEffect(() => {
    if (!shouldType || prefersReducedMotion) {
      setCaretVisible(false);
      return;
    }
    if (typing) {
      setCaretVisible(true);
      return;
    }
    if (typingDone) {
      setCaretVisible(true);
      const timer = setTimeout(() => setCaretVisible(false), 3600);
      return () => clearTimeout(timer);
    }
  }, [shouldType, typing, typingDone, prefersReducedMotion]);

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
    <motion.section
      id="top"
      className={`${styles.section} ${styles.hero}`}
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ ...viewportConfig, amount: 0.12 }}
      ref={heroRef}
    >
      <div className={styles.container}>
        <div className={styles.heroGrid}>
          <motion.div
            className={styles.heroContent}
            initial={{ opacity: 1, x: 0, filter: 'none' }}
            animate={{ opacity: 1, x: 0, filter: 'none' }}
            transition={{ duration: 0 }}
          >
            <div className={styles.heroBadgeRow}>
              <span className={styles.heroBadge}>PLOFTEC · Seguridad 24/7</span>
              <span className={styles.heroBadgeGhost}>Aprender haciendo, sin humo</span>
            </div>

            <motion.h1
              className={styles.heroTitle}
              initial={{ opacity: 1, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0 }}
            >
              {shouldType ? (
                <>
                  <span>
                    {typedTitle.slice(0, heroTitle.length - 'se aprende haciendo.'.length)}
                  </span>
                  <span className={styles.gradientText}>
                    {typedTitle.slice(heroTitle.length - 'se aprende haciendo.'.length)}
                  </span>
                  {(typing || caretVisible) && <span className={styles.typingCaret} />}
                </>
              ) : (
                <>
                  La plataforma donde la ciberseguridad{' '}
                  <span className={styles.gradientText}>se aprende haciendo.</span>
                </>
              )}
            </motion.h1>
            {showRest && (
              <>
                <motion.p
                  className={styles.heroSubtitle}
                  initial={{ opacity: 0, y: 14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ ...baseTransition, delay: 0.12 }}
                >
                  Comunidad técnica, ayuda en vivo y una academia que nace desde el mundo real. Uní
                  foros, sesiones 1:1 y rutas guiadas para crecer en Blue/Red Team sin perder tiempo.
                </motion.p>

                <motion.div
                  className={styles.heroCtas}
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ ...baseTransition, delay: 0.24 }}
                >
                  <motion.div animate={ctaControls}>
                    <Link href="/forum" className={`${styles.button} ${styles.primaryButton}`}>
                      Entrar al foro
                      <ArrowUpRight size={16} />
                    </Link>
                  </motion.div>
                  <motion.div animate={ctaControls}>
                    <a href="#roadmap" className={`${styles.button} ${styles.secondaryButton}`}>
                      Ver roadmap educativo
                    </a>
                  </motion.div>
                </motion.div>

                <motion.p
                  className={styles.trustNote}
                  initial={{ opacity: 0, y: 10, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ ...baseTransition, delay: 0.32 }}
                >
                  Proyecto de tesis · Plataforma real en construcción 2026–2028 · Comunidad abierta
                </motion.p>

                <motion.div
                  className={styles.heroHighlights}
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  transition={{ ...baseTransition, delay: 0.4 }}
                >
                  {highlights.map((item, index) => (
                    <motion.div
                      key={item.title}
                      className={styles.highlightCard}
                      variants={index % 2 === 0 ? variants.slideLeft : variants.slideRight}
                      transition={{ ...baseTransition, delay: index * 0.04 }}
                      whileHover={{ y: -6, scale: prefersReducedMotion ? 1 : 1.01 }}
                    >
                      <div className={styles.iconCircle}>{item.icon}</div>
                      <div>
                        <p className={styles.highlightTitle}>{item.title}</p>
                        <p className={styles.highlightDescription}>{item.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </>
            )}
          </motion.div>

          {showRest && (
            <motion.div
              className={styles.heroVisual}
              variants={variants.slideRight}
              initial="initial"
              animate="animate"
              transition={{ ...baseTransition, delay: 0.3 }}
            >
              <motion.div className={styles.glassCard} whileHover={{ y: -6, scale: 1.01 }}>
                <div className={styles.glassHeader}>
                  <span className={styles.glassLabel}>Radar en vivo</span>
                  <span className={styles.tag}>Beta</span>
                </div>
                <p className={styles.glassTitle}>
                  LiveHelp + Foro + Academia en un ǧnico panel, pensado para equipos y autodidactas.
                </p>
                <motion.div className={styles.miniStats} variants={staggerContainer}>
                  {miniStats.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      className={styles.miniStat}
                      variants={variants.scalePop}
                      transition={{ ...baseTransition, delay: i * 0.05 }}
                    >
                      <span className={styles.miniLabel}>{stat.label}</span>
                      <span className={styles.miniValue}>{stat.value}</span>
                      <span className={styles.miniAccent}>{stat.accent}</span>
                    </motion.div>
                  ))}
                </motion.div>
                <div className={styles.heroPills}>
                  <span className={styles.heroTag}>Blue Team</span>
                  <span className={styles.heroTag}>Red Team</span>
                  <span className={styles.heroTag}>SecOps</span>
                  <span className={styles.heroTag}>DevSecOps</span>
                  <span className={styles.heroTag}>Cloud Security</span>
                </div>
              </motion.div>

              <motion.div
                className={styles.glassCardSecondary}
                whileHover={{ y: -6, scale: 1.01 }}
                initial={{ opacity: 0, y: 16, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ ...baseTransition, delay: 0.38 }}
              >
                <div className={styles.glassHeader}>
                  <span className={styles.glassLabel}>LiveHelp</span>
                  <span className={`${styles.tag} ${styles.tagOutline}`}>En curso</span>
                </div>
                <p className={styles.glassTitle}>
                  Combina Jitsi seguro, pairing guiado, templates de diagnóstico y checklists.
                </p>
                <div className={styles.miniStats}>
                  <IlluminatedBlock
                    className={styles.miniStat}
                    variant={variants.slideLeft}
                    transition={baseTransition}
                    prefersReducedMotion={prefersReducedMotion}
                    viewportAmount={0.55}
                  >
                    <span className={styles.miniLabel}>Acompañamientos</span>
                    <span className={styles.miniValue}>
                      <AnimatedNumber value={280} start={showRest} prefix="+" />
                    </span>
                    <span className={styles.miniAccent}>Pruebas con analistas</span>
                  </IlluminatedBlock>
                  <IlluminatedBlock
                    className={styles.miniStat}
                    variant={variants.slideRight}
                    transition={baseTransition}
                    prefersReducedMotion={prefersReducedMotion}
                    viewportAmount={0.55}
                  >
                    <span className={styles.miniLabel}>Playbooks</span>
                    <span className={styles.miniValue}>
                      <AnimatedNumber value={18} start={showRest} />
                    </span>
                    <span className={styles.miniAccent}>IR, hardening, appsec</span>
                  </IlluminatedBlock>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      <motion.div
        className={`${styles.floatingOrb} ${styles.orbPrimary}`}
        style={{ y: orbY, x: orbX }}
      />
      <motion.div
        className={`${styles.floatingOrb} ${styles.orbSecondary}`}
        style={{ y: orbY, x: orbX }}
      />
    </motion.section>
  );
}

export function SplitSection() {
  const prefersReducedMotion = useReducedMotion();
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
    <motion.section
      id="foro"
      className={styles.section}
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={viewportConfig}
    >
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
          <motion.div
            className={`${styles.splitCard} ${styles.lockedCard}`}
            variants={variants.slideLeft}
            transition={prefersReducedMotion ? { duration: 0 } : { ...baseTransition, stiffness: 120 }}
            id="educacion"
          >
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

          <motion.div
            className={`${styles.splitCard} ${styles.activeCard}`}
            variants={variants.slideRight}
            transition={prefersReducedMotion ? { duration: 0 } : { ...baseTransition, delay: 0.08 }}
          >
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
    </motion.section>
  );
}

export function AudienceSection() {
  const prefersReducedMotion = useReducedMotion();
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
    <motion.section
      className={styles.section}
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={viewportConfig}
    >
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Para quién es PLOFTEC</span>
          <h2 className={styles.sectionTitle}>Diseñado para quienes viven y respiran seguridad</h2>
          <p className={styles.sectionSubtitle}>
            Un hub que equilibra velocidad, profundidad técnica y guía humana.
          </p>
        </div>

        <motion.div
          className={styles.cardsGrid}
          variants={staggerContainer}
          transition={baseTransition}
        >
          {audience.map((item, index) => {
            const variant =
              index === 0
                ? cardVariants.slideLeft
                : index === audience.length - 1
                ? cardVariants.slideRight
                : cardVariants.skewUp;
            return (
              <IlluminatedCard
                key={item.title}
                variant={variant}
                transition={{
                  ...baseTransition,
                  delay: prefersReducedMotion ? 0 : index * 0.05,
                  type: 'spring',
                  stiffness: 140,
                  damping: 18,
                }}
                whileHover={{ y: -6, scale: prefersReducedMotion ? 1 : 1.02, rotate: 0.2 }}
                prefersReducedMotion={prefersReducedMotion}
              >
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
              </IlluminatedCard>
            );
          })}
        </motion.div>
      </div>
    </motion.section>
  );
}

export function PillarsSection() {
  const prefersReducedMotion = useReducedMotion();
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
    <motion.section
      className={styles.section}
      id="educacion"
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={viewportConfig}
    >
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Qué vas a encontrar</span>
          <h2 className={styles.sectionTitle}>Tres pilares, una sola experiencia</h2>
        </div>

        <motion.div className={styles.pillarsGrid} variants={staggerContainer}>
          {pillars.map((pillar, index) => {
            const variant =
              index === 0
                ? cardVariants.slideLeft
                : index === 2
                ? cardVariants.slideRight
                : cardVariants.scalePop;
            return (
              <IlluminatedCard
                key={pillar.title}
                variant={variant}
                transition={{ ...baseTransition, delay: index * 0.05 }}
                whileHover={
                  prefersReducedMotion ? undefined : { y: -6, rotate: (index - 1) * 0.5, scale: 1.02 }
                }
                prefersReducedMotion={prefersReducedMotion}
              >
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
              </IlluminatedCard>
            );
          })}
        </motion.div>
      </div>
    </motion.section>
  );
}

export function RoadmapSection() {
  const prefersReducedMotion = useReducedMotion();
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
    <motion.section
      id="roadmap"
      className={styles.section}
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={viewportConfig}
    >
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Roadmap 2025–2028</span>
          <h2 className={styles.sectionTitle}>Construimos sobre lo que medimos</h2>
          <p className={styles.sectionSubtitle}>
            Hitos claros para que la comunidad, la academia y las empresas crezcan juntas.
          </p>
        </div>

        <div className={styles.roadmapShell}>
          <motion.div
            className={styles.roadmapLine}
            initial={{ scaleY: 0, opacity: 0 }}
            whileInView={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: prefersReducedMotion ? 0 : 1, ease: 'easeOut' }}
            viewport={viewportConfig}
          />
          <div className={styles.roadmapList}>
            {items.map((item, index) => (
              <motion.div
                key={item.title}
                className={styles.roadmapItem}
                variants={variants.fadeInUp}
                transition={{ ...baseTransition, delay: index * 0.08 }}
              >
                <div className={styles.roadmapYear}>{item.year}</div>
                <div className={styles.roadmapTitleRow}>
                  <h3 className={styles.roadmapTitle}>{item.title}</h3>
                  <motion.span
                    className={`${styles.tag} ${styles.tagOutline}`}
                    initial={{ scale: 0.6, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ ...baseTransition, delay: index * 0.08 + 0.05 }}
                    viewport={viewportConfig}
                  >
                    {item.tag}
                  </motion.span>
                </div>
                <p className={styles.roadmapDescription}>{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
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
    <motion.section
      className={styles.section}
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={viewportConfig}
    >
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Métricas y social proof</span>
          <h2 className={styles.sectionTitle}>Transparencia y foco en impacto</h2>
        </div>

        <motion.div className={styles.metricsGrid} variants={staggerContainer}>
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              className={styles.metricCard}
              variants={variants.scalePop}
              transition={{ ...baseTransition, delay: index * 0.06 }}
              whileHover={{ y: -6, boxShadow: '0 16px 46px rgba(100,75,255,0.2)' }}
            >
              <div className={styles.metricValue}>{metric.value}</div>
              <div className={styles.metricLabel}>{metric.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
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
    <motion.section
      id="comunidad"
      className={styles.section}
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={viewportConfig}
    >
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Comunidad y LiveHelp</span>
          <h2 className={styles.sectionTitle}>Acompañamiento real, no solo teoría</h2>
        </div>

        <motion.div className={styles.communityGrid} variants={staggerContainer}>
          {items.map((item, index) => (
            <motion.div
              key={item.title}
              className={styles.communityCard}
              variants={index % 2 === 0 ? variants.slideLeft : variants.slideRight}
              transition={{ ...baseTransition, delay: index * 0.05 }}
              whileHover={{ y: -6, scale: 1.02 }}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>{item.icon}</div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
              </div>
              <p className={styles.cardDescription}>{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
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
    <motion.section
      id="empresas"
      className={styles.section}
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={viewportConfig}
    >
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Para empresas</span>
          <h2 className={styles.sectionTitle}>Upskilling que se ve en producción</h2>
          <p className={styles.sectionSubtitle}>
            PLOFTEC acompaña a los equipos con labs, métricas y soporte en vivo para que el
            aprendizaje se traduzca en seguridad real.
          </p>
        </div>

        <motion.div className={styles.companiesGrid} variants={staggerContainer}>
          <motion.div
            className={styles.communityCard}
            variants={variants.slideLeft}
            transition={baseTransition}
            whileHover={{ y: -6, rotate: -0.3, scale: 1.01 }}
          >
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

          <motion.div
            className={styles.communityCard}
            variants={variants.slideRight}
            transition={baseTransition}
            whileHover={{ y: -6, rotate: 0.3, scale: 1.01 }}
          >
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
        </motion.div>
      </div>
    </motion.section>
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
    <motion.section
      className={styles.section}
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={viewportConfig}
    >
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Testimonios y frases</span>
          <h2 className={styles.sectionTitle}>Lo que ya dicen de PLOFTEC</h2>
        </div>

        <motion.div className={styles.testimonials} variants={staggerContainer}>
          {testimonials.map((item, index) => {
            const variant = index % 2 === 0 ? variants.rotateInLeft : variants.rotateInRight;
            return (
              <motion.div
                key={item.by}
                className={styles.testimonialCard}
                variants={variant}
                transition={{ ...baseTransition, delay: index * 0.06 }}
                whileHover={{ scale: 1.02, rotate: index % 2 === 0 ? -0.4 : 0.4 }}
              >
                <p className={styles.quote}>{item.quote}</p>
                <p className={styles.quoteBy}>{item.by}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.section>
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
    <motion.section
      id="faq"
      className={styles.section}
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={viewportConfig}
    >
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>FAQ</span>
          <h2 className={styles.sectionTitle}>Preguntas frecuentes</h2>
        </div>

        <div className={styles.faqList}>
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={faq.question}
                className={styles.faqItem}
                variants={variants.fadeInUp}
                transition={{ ...baseTransition, delay: index * 0.04 }}
              >
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
    </motion.section>
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
