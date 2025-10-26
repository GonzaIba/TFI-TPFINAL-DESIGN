'use client'

import { useEffect, useState, useRef, useLayoutEffect, useCallback } from 'react'
import { Button, SideBarFilters} from '@/components'
import ProtectedRoute from "@/components/auth/protectedRoute";
import { filtrosService } from "@/lib/services/forum/filtrosService";
import { UserFilterForumResponse } from '@/lib/types/forum'
import TableUsers from '@/components/forum/tableUsers/tableUsers'
import { GroupEnum } from '@/lib/types/enum'
import styles from './page.module.css'
import { SpotlightTour } from '@/components/onboarding/spotlight/spotlightTour';
import useAuthStore from '@/store/slices/authStore/authStore';
import { onboardingService } from '@/lib/services/auth/onboardingService';
import { OnboardingUserEnum } from '@/lib/types/onboarding';

export default function UsersPage() {
  const [showUserFilters, setShowUserFilters] = useState(false)
  const [userFilters, setUserFilters] = useState<UserFilterForumResponse[]>([])
  const [shouldReloadUsers, setShouldReloadUsers] = useState(false)
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const tableRef = useRef<HTMLDivElement | null>(null);
  const actionButtonRef = useRef<HTMLDivElement | null>(null);
  const filterButtonRef = useRef<HTMLDivElement | null>(null);
  const [actionReady, setActionReady] = useState(false);
  const [showUsersIntro, setShowUsersIntro] = useState(false);
  const [usersIntroDismissed, setUsersIntroDismissed] = useState(false);
  const [usersIntroStepIndex, setUsersIntroStepIndex] = useState(-1);
  const [usersHighlightRect, setUsersHighlightRect] = useState<DOMRect | null>(null);

  const USERS_INTRO_STEPS = [
    {
      target: 'table' as const,
      title: 'Explorá la tabla de usuarios',
      description: 'Acá ves el ranking con puntaje y fecha de ingreso para ubicar a cada miembro.',
      placement: 'top' as const,
      gap: 32,
    },
    {
      target: 'details' as const,
      title: 'Abrí el detalle con el ojo',
      description: 'Tocá este botón para desplegar la bottom sheet y ver datos completos de cada usuario.',
      placement: 'left' as const,
      gap: 24,
    },
    {
      target: 'filters' as const,
      title: 'Filtrá como quieras',
      description: 'El botón de filtros abre la configuración para aplicar criterios personalizados.',
      placement: 'left' as const,
      gap: 28,
    },
  ];

  useEffect(() => {
    const loadFilters = async () => {
      const filtros = (await filtrosService.getFilterUser(GroupEnum.ForumUserTable)).data
      setUserFilters(filtros ?? [])
    }
    loadFilters()
  }, [])

  useEffect(() => {
    setUsersIntroDismissed(false);
    setActionReady(false);
  }, [user?.email]);

  const handleFirstActionRef = useCallback((node: HTMLDivElement | null) => {
    actionButtonRef.current = node;
    setActionReady(!!node);
  }, []);

  const getUsersIntroTarget = useCallback(
    (target: 'table' | 'details' | 'filters') => {
      switch (target) {
        case 'table':
          return tableRef.current;
        case 'details':
          return actionButtonRef.current;
        case 'filters':
          return filterButtonRef.current;
        default:
          return null;
      }
    },
    []
  );

  useLayoutEffect(() => {
    if (!showUsersIntro) return;
    const step = USERS_INTRO_STEPS[usersIntroStepIndex];
    const targetEl = step ? getUsersIntroTarget(step.target) : null;
    setUsersHighlightRect(targetEl ? targetEl.getBoundingClientRect() : null);
  }, [showUsersIntro, usersIntroStepIndex, userFilters.length, actionReady, getUsersIntroTarget]);

  useEffect(() => {
    if (!showUsersIntro) return;
    const update = () => {
      const step = USERS_INTRO_STEPS[usersIntroStepIndex];
      const targetEl = step ? getUsersIntroTarget(step.target) : null;
      setUsersHighlightRect(targetEl ? targetEl.getBoundingClientRect() : null);
    };
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [showUsersIntro, usersIntroStepIndex, getUsersIntroTarget]);

  useEffect(() => {
    if (!user || user.hasSeenIntroUsers || showUsersIntro || usersIntroDismissed) return;
    if (!tableRef.current || !filterButtonRef.current || !actionButtonRef.current) return;

    setUsersIntroStepIndex(0);
    setShowUsersIntro(true);
  }, [user, showUsersIntro, usersIntroDismissed, actionReady, userFilters.length]);

  const finishUsersIntro = useCallback(async () => {
    setShowUsersIntro(false);
    setUsersIntroDismissed(true);
    setUsersIntroStepIndex(-1);
    setUsersHighlightRect(null);

    if (!user || user.hasSeenIntroUsers) return;
    try {
      await onboardingService.completeOnboarding(OnboardingUserEnum.HasSeenIntroUsers);
      setUser({ ...user, hasSeenIntroUsers: true });
    } catch (err) {
      console.error('No pude marcar la intro de usuarios', err);
    }
  }, [user, setUser]);

  const handleUsersIntroNext = useCallback(() => {
    if (usersIntroStepIndex + 1 >= USERS_INTRO_STEPS.length) {
      void finishUsersIntro();
      return;
    }
    setUsersIntroStepIndex((prev) => prev + 1);
  }, [usersIntroStepIndex, finishUsersIntro]);

  const handleUsersIntroBack = useCallback(() => {
    setUsersIntroStepIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleUsersIntroSkip = useCallback(() => {
    void finishUsersIntro();
  }, [finishUsersIntro]);

  const handleManageFilters = async () => {
    setShowUserFilters(prev => !prev)
  }

  const handleGuardarFiltrosUsuario = async (valuePairs: Record<number, string>) => {
    const filtered = Object.fromEntries(
      Object.entries(valuePairs).filter(([_, v]) => v.trim() !== '')
    )
    await filtrosService.addFilterUser({ filters_CodeValue: filtered })
    const nuevosFiltros = (await filtrosService.getFilterUser(GroupEnum.ForumUserTable)).data
    setUserFilters(nuevosFiltros ?? [])
    setShouldReloadUsers(true)
    setShowUserFilters(false)
  }

  const handleResetearFiltros = async () => {
    if(userFilters.length > 0) {
      await filtrosService.deleteFilterUser(GroupEnum.ForumUserTable)
      const filtrosActualizados = (await filtrosService.getFilterUser(GroupEnum.ForumUserTable)).data
      setUserFilters(filtrosActualizados ?? [])
      setShouldReloadUsers(true)
      setShowUserFilters(false)
    }
  }

  const handleEliminarFiltro = async (codigoFiltro: number) => {
    await filtrosService.deleteFilterUser(codigoFiltro)
    const filtrosActualizados = (await filtrosService.getFilterUser(GroupEnum.ForumUserTable)).data
    setUserFilters(filtrosActualizados ?? [])
    setShouldReloadUsers(true)
  }

  return (
    <div className="slider__contents">
      <div className={styles.forumContainer}>
        <div className={styles.forumCenter}>
          <div className={styles.userPanelContainer}>
            <div className={styles.userProfiles}>
              <div className={styles.userPanelTitle}>
                <div className={styles.userTitle}>
                  <h2>All Users</h2>
                </div>
                <div className={styles.userTitleSettings}>
                  <i className="fa fa-cog" aria-hidden="true"></i>
                  Configuración
                </div>
              </div>
              <div className={styles.userSearch}>
                <div className={styles.userPanelButtonsContainer} ref={filterButtonRef}>
                  <Button
                    onClick={handleManageFilters}
                    text="Filtrar Por"
                  />
                </div>
              </div>
              <div className={styles.userFilters}>
                {userFilters.map(item => (
                  <span key={item.codeFilter} className={styles.userFiltersTag}>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleEliminarFiltro(item.codeFilter)}
                    >
                      &times;
                    </button>
                    {item.description}: {item.value}
                  </span>
                ))}
              </div>
              <TableUsers
                reload={shouldReloadUsers}
                onReloadCompleted={() => setShouldReloadUsers(false)}
                tableRef={tableRef}
                firstActionRef={handleFirstActionRef}
              />
            </div>
          </div>
        </div>
      </div>
      <SideBarFilters
        show={showUserFilters}
        closeFunction={handleManageFilters}
        saveFunction={handleGuardarFiltrosUsuario}
        resetFunction={handleResetearFiltros}
        onCompleted={handleManageFilters}
        grupo={GroupEnum.ForumUserTable}
      />
      {showUsersIntro && usersHighlightRect && (
        <SpotlightTour
          isVisible={showUsersIntro}
          stepIndex={usersIntroStepIndex}
          totalSteps={USERS_INTRO_STEPS.length}
          title={USERS_INTRO_STEPS[usersIntroStepIndex]?.title ?? ''}
          description={USERS_INTRO_STEPS[usersIntroStepIndex]?.description ?? ''}
          highlightRect={usersHighlightRect}
          panelPlacement={USERS_INTRO_STEPS[usersIntroStepIndex]?.placement}
          panelGap={USERS_INTRO_STEPS[usersIntroStepIndex]?.gap}
          canGoBack={usersIntroStepIndex > 0}
          onPrev={handleUsersIntroBack}
          onNext={handleUsersIntroNext}
          onSkip={handleUsersIntroSkip}
        />
      )}
    </div>
  )
}
