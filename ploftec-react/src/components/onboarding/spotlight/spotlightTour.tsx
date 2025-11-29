import { AnimatePresence, motion } from 'framer-motion';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { RobotAnimated } from '@/components/chatbotComponent/robotIcon/robotIcon';
import styles from './spotlightTour.module.css';
import { useWindowWidth } from '@/hooks';

type PointerDirection = 'left' | 'right' | 'top' | 'bottom';

type SpotlightTourProps = {
  isVisible: boolean;
  stepIndex: number;
  totalSteps: number;
  title: string;
  description: string;
  highlightRect: DOMRect | null;
  panelPosition?: CSSProperties;
  panelPlacement?: PointerDirection;
  panelGap?: number;
  canGoBack?: boolean;
  onPrev?: () => void;
  onNext: () => void;
  onSkip: () => void;
};

type PanelStyleVars = CSSProperties & { '--pointer-offset'?: string };
type PanelLayoutResult = {
  style: CSSProperties;
  rect: DOMRect | null;
  resolvedPlacement: PointerDirection | null;
};
type PanelDimensions = { width: number; height: number; gap: number; maxHeight: string };

const HIGHLIGHT_PADDING = 18;
const PANEL_WIDTH = 560;
const PANEL_HEIGHT = 260;
const DEFAULT_GAP = 28;

export function SpotlightTour({
  isVisible,
  stepIndex,
  totalSteps,
  title,
  description,
  highlightRect,
  panelPosition,
  panelPlacement,
  panelGap,
  canGoBack = false,
  onPrev,
  onNext,
  onSkip,
}: SpotlightTourProps) {
  const isLastStep = stepIndex + 1 === totalSteps;
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [panelRect, setPanelRect] = useState<DOMRect | null>(null);
  const viewportWidth = useWindowWidth();
  const robotSize = viewportWidth > 0 && viewportWidth < 720 ? 160 : 220;

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    if (!isVisible) {
      setPanelRect(null);
      return;
    }

    const updatePanelRect = () => {
      if (panelRef.current) {
        setPanelRect(panelRef.current.getBoundingClientRect());
      }
    };

    updatePanelRect();
    window.addEventListener('resize', updatePanelRect);
    window.addEventListener('scroll', updatePanelRect, true);
    return () => {
      window.removeEventListener('resize', updatePanelRect);
      window.removeEventListener('scroll', updatePanelRect, true);
    };
  }, [isVisible, panelPosition, panelPlacement, panelGap, title, description, highlightRect]);

  const highlightStyle = highlightRect
    ? {
        top: highlightRect.top - HIGHLIGHT_PADDING,
        left: highlightRect.left - HIGHLIGHT_PADDING,
        width: highlightRect.width + HIGHLIGHT_PADDING * 2,
        height: highlightRect.height + HIGHLIGHT_PADDING * 2,
      }
    : undefined;

  const overlaySections = useMemo(() => {
    if (!highlightRect || typeof window === 'undefined') return null;
    const pad = HIGHLIGHT_PADDING + 6;
    const left = Math.max(0, highlightRect.left - pad);
    const top = Math.max(0, highlightRect.top - pad);
    const right = Math.min(window.innerWidth, highlightRect.right + pad);
    const bottom = Math.min(window.innerHeight, highlightRect.bottom + pad);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const sections = [
      { top: 0, left: 0, width: vw, height: top },
      { top: bottom, left: 0, width: vw, height: Math.max(0, vh - bottom) },
      { top, left: 0, width: left, height: Math.max(0, bottom - top) },
      { top, left: right, width: Math.max(0, vw - right), height: Math.max(0, bottom - top) },
    ];

    return sections.filter((section) => section.width > 0 && section.height > 0);
  }, [highlightRect]);

  const invertPlacement = (placement: PointerDirection | null): PointerDirection | null => {
    if (!placement) return null;
    switch (placement) {
      case 'left':
        return 'right';
      case 'right':
        return 'left';
      case 'top':
        return 'bottom';
      case 'bottom':
        return 'top';
    }
  };

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  const placementCandidates = useMemo(() => {
    const defaults: PointerDirection[] = ['right', 'left', 'bottom', 'top'];
    if (!panelPlacement) return defaults;
    const ordered = [panelPlacement, ...defaults];
    return ordered.filter((placement, index) => ordered.indexOf(placement) === index);
  }, [panelPlacement]);

  const getPanelDimensions = (): PanelDimensions => {
    const defaultGap = panelGap ?? DEFAULT_GAP;
    if (typeof window === 'undefined') {
      return {
        width: PANEL_WIDTH,
        height: PANEL_HEIGHT,
        gap: defaultGap,
        maxHeight: '88vh',
      };
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.max(280, Math.min(560, vw - 32));
    const baseHeight = vw < 720 ? 280 : PANEL_HEIGHT;
    const height = Math.max(240, Math.min(baseHeight, vh - 120));
    const adaptiveGap = Math.max(12, panelGap ?? (vw < 720 ? 20 : DEFAULT_GAP));
    const maxHeight = vw < 720 ? '86vh' : '88vh';

    return { width, height, gap: adaptiveGap, maxHeight };
  };

  const computeLayoutForPlacement = (
    placement: PointerDirection,
    dimensions: PanelDimensions,
    highlight: DOMRect,
  ): PanelLayoutResult => {
    if (typeof window === 'undefined') {
      return { style: {}, rect: null, resolvedPlacement: null };
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const highlightCenterX = highlight.left + highlight.width / 2;
    const highlightCenterY = highlight.top + highlight.height / 2;
    const { width, height, gap } = dimensions;

    if (placement === 'right' || placement === 'left') {
      const left =
        placement === 'right'
          ? clamp(highlight.right + gap, gap, vw - width - gap)
          : clamp(highlight.left - gap - width, gap, vw - width - gap);
      const top = clamp(highlightCenterY, gap + height / 2, vh - gap - height / 2);

      return {
        style: {
          left: `${left}px`,
          top: `${top}px`,
          transform: 'translateY(-50%)',
          width: `${width}px`,
          minHeight: `${height}px`,
          maxHeight: dimensions.maxHeight,
        },
        rect: new DOMRect(left, top - height / 2, width, height),
        resolvedPlacement: placement,
      };
    }

    const top =
      placement === 'bottom'
        ? clamp(highlight.bottom + gap, gap, vh - height - gap)
        : clamp(highlight.top - gap - height, gap, vh - height - gap);
    const left = clamp(highlightCenterX, gap + width / 2, vw - gap - width / 2);

    return {
      style: {
        top: `${top}px`,
        left: `${left}px`,
        transform: 'translate(-50%, 0)',
        width: `${width}px`,
        minHeight: `${height}px`,
        maxHeight: dimensions.maxHeight,
      },
      rect: new DOMRect(left - width / 2, top, width, height),
      resolvedPlacement: placement,
    };
  };

  const intersects = (rect: DOMRect | null, highlight: DOMRect) => {
    if (!rect) return true;
    return !(
      rect.right < highlight.left ||
      rect.left > highlight.right ||
      rect.bottom < highlight.top ||
      rect.top > highlight.bottom
    );
  };

  const panelLayout = useMemo(() => {
    if (panelPosition) {
      return {
        style: panelPosition,
        rect: null,
        resolvedPlacement: panelPlacement ?? null,
      };
    }

    if (!highlightRect) {
      return {
        style: {},
        rect: null,
        resolvedPlacement: panelPlacement ?? null,
      };
    }

    const dimensions = getPanelDimensions();
    let fallbackLayout: PanelLayoutResult | null = null;

    for (const candidate of placementCandidates) {
      const layout = computeLayoutForPlacement(candidate, dimensions, highlightRect);
      if (!intersects(layout.rect, highlightRect)) {
        return layout;
      }
      if (!fallbackLayout) fallbackLayout = layout;
    }

    return fallbackLayout ?? { style: {}, rect: null, resolvedPlacement: null };
  }, [panelPosition, panelPlacement, panelGap, placementCandidates, highlightRect]);

  const pointerDirection = useMemo<PointerDirection | null>(() => {
    if (panelLayout.resolvedPlacement) {
      return invertPlacement(panelLayout.resolvedPlacement);
    }

    if (!panelRect || !highlightRect) return null;

    const highlightCenter = {
      x: highlightRect.left + highlightRect.width / 2,
      y: highlightRect.top + highlightRect.height / 2,
    };
    const panelCenter = {
      x: panelRect.left + panelRect.width / 2,
      y: panelRect.top + panelRect.height / 2,
    };
    const diffX = highlightCenter.x - panelCenter.x;
    const diffY = highlightCenter.y - panelCenter.y;
    if (Math.abs(diffX) > Math.abs(diffY)) {
      return diffX < 0 ? 'right' : 'left';
    }
    return diffY < 0 ? 'bottom' : 'top';
  }, [panelLayout.resolvedPlacement, highlightRect, panelRect]);

  const pointerOffset = useMemo(() => {
    if (!pointerDirection || !highlightRect || !panelRect) return null;
    if (pointerDirection === 'left' || pointerDirection === 'right') {
      const relativeY = ((highlightRect.top + highlightRect.height / 2) - panelRect.top) / panelRect.height;
      return `${Math.min(85, Math.max(15, relativeY * 100))}%`;
    }

    const relativeX = ((highlightRect.left + highlightRect.width / 2) - panelRect.left) / panelRect.width;
    return `${Math.min(85, Math.max(15, relativeX * 100))}%`;
  }, [pointerDirection, highlightRect, panelRect]);

  const panelClassName = [
    styles.panel,
    pointerDirection ? styles['hasPointer'] : '',
    pointerDirection ? styles[`pointer-${pointerDirection}`] : '',
  ]
    .filter(Boolean)
    .join(' ');

  const panelStyleVars: PanelStyleVars =
    pointerOffset !== null
      ? {
          '--pointer-offset': pointerOffset,
        }
      : {};

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.dimLayer}>
            {overlaySections
              ? overlaySections.map((section, idx) => (
                  <div
                    key={idx}
                    className={styles.dimSection}
                    style={{
                      top: `${section.top}px`,
                      left: `${section.left}px`,
                      width: `${section.width}px`,
                      height: `${section.height}px`,
                    }}
                  />
                ))
              : (
                  <div className={styles.dimFallback} />
                )}
          </div>

          {highlightRect && (
            <motion.div
              className={styles.highlight}
              layout
              initial={false}
              animate={highlightStyle}
              transition={{ type: 'spring', stiffness: 200, damping: 28 }}
              style={highlightStyle}
            />
          )}

          <div className={styles.panelWrapper} style={panelLayout.style}>
            <motion.div
              ref={panelRef}
          className={panelClassName}
          style={panelStyleVars}
          initial={{ y: 80, opacity: 0, scale: 0.94 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 160, damping: 20 }}
        >
          <div className={styles.robot}>
            <RobotAnimated showImage animated size={robotSize} />
          </div>
              <div className={styles.content}>
                <span className={styles.stepBadge}>
                  Paso {stepIndex + 1} de {totalSteps}
                </span>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.description}>{description}</p>
                <div className={styles.actions}>
                  <button
                    className={`${styles.button} ${styles.buttonGhost}`}
                    onClick={onPrev}
                    disabled={!canGoBack || !onPrev}
                  >
                    Atrás
                  </button>
                  <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={onSkip}>
                    Saltar
                  </button>
                  <button className={`${styles.button} ${styles.buttonPrimary}`} onClick={onNext}>
                    {isLastStep ? '\u00A1Listo!' : 'Entendido'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
