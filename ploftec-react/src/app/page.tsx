'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from '@/components/home/homeLanding.module.css';
import {
  HeaderNav,
  HeroSection,
  SplitSection,
  AudienceSection,
  PillarsSection,
  RoadmapSection,
  MetricsSection,
  CommunitySection,
  CompaniesSection,
  TestimonialsSection,
  FAQSection,
  FooterSection,
} from '@/components/home/homeSections';

export default function Home() {
  const sections = useMemo(
    () => ['foro', 'educacion', 'roadmap', 'comunidad', 'empresas', 'faq'],
    []
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('foro');
  const [navReady, setNavReady] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const options = { root: null, threshold: 0.35 };

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(id);
        });
      }, options);
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, [sections]);

  const handleNavClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const yOffset = -12;
    const top = el.getBoundingClientRect().top + window.scrollY + yOffset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const handleNavIntroComplete = useCallback(() => {
    setNavReady(true);
  }, []);

  return (
    <div className={styles.page}>
      <HeaderNav
        isScrolled={isScrolled}
        activeSection={activeSection}
        onNavClick={handleNavClick}
        onIntroComplete={handleNavIntroComplete}
      />
      <main className={styles.main}>
        <HeroSection navReady={navReady} />
        <SplitSection />
        <AudienceSection />
        <PillarsSection />
        <RoadmapSection />
        <MetricsSection />
        <CommunitySection />
        <CompaniesSection />
        <TestimonialsSection />
        <FAQSection />
      </main>
      <FooterSection />
    </div>
  );
}
