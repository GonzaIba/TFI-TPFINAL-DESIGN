'use client';

import { useEffect, useState } from 'react';
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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={styles.page}>
      <HeaderNav isScrolled={isScrolled} />
      <main className={styles.main}>
        <HeroSection />
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
