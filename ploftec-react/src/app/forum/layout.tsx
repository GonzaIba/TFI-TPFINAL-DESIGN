// src/app/forum/layout.tsx
'use client';

import { useEffect, useMemo, useState, useCallback, useLayoutEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getUserDetails, logout } from '@/lib/services/auth/authenticationService';
import { usuariosForoService } from '@/lib/services/forum/usuariosForoService';
import { obtenerIniciales } from '@/lib/helpers/forumHelper';
import { UserApplication } from '@/lib/types/application';
import { DetailsUserForumResponse, NotificationsResponse } from '@/lib/types/forum';
import Footer from '@/components/footerComponent/footer';
import useAuthStore from "@/store/slices/authStore/authStore";
import useAlertsConfigStore from '@/store/slices/alertsStore/alertsStore';
import ProtectedRoute from "@/components/auth/protectedRoute";
import { useNotificationSignalR } from '@/hooks';
import {
  moveTabBar,
  moveContentTabBar,
  enableTdTextSelection,
  preventHorizontalScrollWheel,
} from '@/lib/utils/tabBar';
import { Chatbot, Input, SkeletonLine, AvatarUser, Loading, NotificationDropdown  } from '@/components';
import { RobotIntro } from '@/components/chatbotComponent/robotIntro/robotIntro';
import { publicationsService } from '@/lib/services/forum/publicationsService';
import { NewNotificationEvent, RemoveNotificationEvent } from '@/lib/types/events';
import { AlertsLayer } from '@/components/alerts/alertsLayer';
import { onboardingService } from '@/lib/services/auth/onboardingService';
import { OnboardingUserEnum } from '@/lib/types/onboarding';

type IntroFlagKey = Extract<
  keyof UserApplication,
  | 'hasSeenIntroPublications'
  | 'hasSeenIntroLabels'
  | 'hasSeenIntroUsers'
  | 'hasSeenIntroLiveHelp'
  | 'hasSeenIntroLiveHelpConfirmed'
  | 'hasSeenIntroLiveHelpDetailHelp'
  | 'hasSeenIntroLiveHelpDetailHelped'
>;

type RouteIntroRequirement = {
  match: (path: string) => boolean;
  flags: IntroFlagKey[];
};

const startsWithRoute = (expected: string) => {
  const normalized = expected.toLowerCase();
  return (path: string) => path.startsWith(normalized);
};

const ROUTE_INTRO_REQUIREMENTS: RouteIntroRequirement[] = [
  {
    match: startsWithRoute('/forum/livehelp/detail'),
    flags: ['hasSeenIntroLiveHelpDetailHelp', 'hasSeenIntroLiveHelpDetailHelped'],
  },
  {
    match: startsWithRoute('/forum/livehelp'),
    flags: ['hasSeenIntroLiveHelp'],
  },
  {
    match: startsWithRoute('/forum/publications'),
    flags: ['hasSeenIntroPublications'],
  },
  {
    match: startsWithRoute('/forum/labels'),
    flags: ['hasSeenIntroLabels'],
  },
  {
    match: startsWithRoute('/forum/users'),
    flags: ['hasSeenIntroUsers'],
  },
];

const hasPendingIntroForRoute = (
  pathname: string,
  user: UserApplication | null,
): boolean => {
  if (!user) return false;
  const normalizedPath = pathname?.toLowerCase() ?? '';
  const requirement = ROUTE_INTRO_REQUIREMENTS.find(({ match }) =>
    match(normalizedPath),
  );
  if (!requirement) return false;

  return requirement.flags.some((flag) => !user[flag]);
};

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userForum, setUserForum] = useState<DetailsUserForumResponse | null>(null);
  const [userNotifications, setUserNotifications] = useState<NotificationsResponse[] | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const isAuthLoaded = useAuthStore((state) => state.isAuthLoaded);
  const user = useAuthStore((state) => state.user);
  const userEmail = user?.email ?? null;
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);
  const setAlertsEnabled = useAlertsConfigStore((state) => state.setAlertsEnabled);

  const newNotificationAdded = useCallback((d: NewNotificationEvent) => {
    setUserNotifications(prev => [d, ...(prev ?? [])]);
  }, []);

  const notificationRemoved = useCallback((d: RemoveNotificationEvent) => {
    setUserNotifications(prev =>
      prev ? prev.filter(n => n.codeNotification !== d.codeNotification) : null
    );
  }, []);

  const notificationHandlers = useMemo(() => {
    if (!isAuthenticated) return null;
    return {
      onNewNotificationAdded: newNotificationAdded,
      onNotificationRemoved: notificationRemoved,
    };
  }, [isAuthenticated, newNotificationAdded, notificationRemoved]);

  const connectionId = useNotificationSignalR(notificationHandlers);

  console.log("LAYOUT page:");

  const rutasProtegidas = [
    "/forumTest",
  ];

  useEffect(() => {
    const fetchUserForum = async () => {
      if (isAuthLoaded) {
        setIsUserLoading(true);

        if (isAuthenticated && userEmail) {
          try {
            const res = await usuariosForoService.getDetailUser(userEmail);
            const resNotif = await usuariosForoService.getNotifications();
            setUserNotifications(resNotif.data as NotificationsResponse[]);
            ///////
            setUserForum(res.data as DetailsUserForumResponse);
          } catch (err) {
            console.error("Error al obtener detalles del foro:", err);
          }
        }

        setIsUserLoading(false);
      }
    };

    fetchUserForum();
  }, [isAuthLoaded, isAuthenticated, userEmail]);

  useEffect(() => {
    if (pathname === '/forum') {
      router.push('/forum/publications');
      setActiveTab(0);
      moveTabBar(0);
    }
    // Publicaciones (incluye query params o subrutas)
    else if (pathname.startsWith('/forum/publications')) {
      setActiveTab(0);
      moveTabBar(0);
    }
    // Usuarios
    else if (pathname.startsWith('/forum/users')) {
      setActiveTab(1);
      moveTabBar(1);
    }
    // Etiquetas
    else if (pathname.startsWith('/forum/labels')) {
      setActiveTab(2);
      moveTabBar(2);
    }
    // Live Help
    else if (pathname.startsWith('/forum/liveHelp')) {
      setActiveTab(3);
      moveTabBar(3);
    }
  }, [pathname, router]);

  useEffect(() => {
    router.prefetch('/forum/publications');
    router.prefetch('/forum/users');
    router.prefetch('/forum/labels');
    router.prefetch('/forum/liveHelp');
    router.prefetch('/login');
  }, []);

  const changeTab = async (index: number) => {
    setActiveTab(index);
    moveTabBar(index);
    let route = '/forum/publications';
    if (index === 1) route = '/forum/users';
    else if (index === 2) route = '/forum/labels';
    else if (index === 3) route = '/forum/liveHelp';
    router.push(route);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const requiereProteccion = rutasProtegidas.includes(pathname);

  const [showIntro, setShowIntro] = useState(false);
  const [showRobot, setShowRobot] = useState(true);
  const [hasDismissedOnboarding, setHasDismissedOnboarding] = useState(false);
  const routeIntroPending = useMemo(
    () => hasPendingIntroForRoute(pathname, user),
    [pathname, user],
  );

  useLayoutEffect(() => {
    if (!isAuthLoaded) {
      setAlertsEnabled(false);
      return;
    }

    const shouldPauseGlobalOnboarding =
      !!user && !user.isOnboarded && !hasDismissedOnboarding;
    const shouldPauseRouteOnboarding = routeIntroPending;

    setAlertsEnabled(!(shouldPauseGlobalOnboarding || shouldPauseRouteOnboarding));
  }, [
    isAuthLoaded,
    user,
    hasDismissedOnboarding,
    routeIntroPending,
    setAlertsEnabled,
  ]);

  useEffect(() => {
    if (!user) {
      setShowIntro(false);
      setShowRobot(true);
      setHasDismissedOnboarding(false);
      return;
    }

    if (!user.isOnboarded && !hasDismissedOnboarding) {
      setShowIntro(true);
      setShowRobot(false);
      return;
    }

    setShowIntro(false);
    setShowRobot(true);
  }, [user, hasDismissedOnboarding]);

  const handleIntroComplete = () => {
    setHasDismissedOnboarding(true);
    setShowIntro(false);
    setShowRobot(true);
    setAlertsEnabled(true);

    if (!user) return;

    const completeOnboarding = async () => {
      try {
        await onboardingService.completeOnboarding(OnboardingUserEnum.Onboarding);
        setUser({ ...user, isOnboarded: true });
      } catch (error) {
        console.error('No pude completar el onboarding', error);
      }
    };

    void completeOnboarding();
  };

  const handleOnSubmitSearch = async (query: string) => {
    //setIsLoading(true);
    //await publicationsService.getPublicationsWithFilter(query, 0, 10);
    router.push(`/forum/publications?search=${encodeURIComponent(query)}`)
    //setIsLoading(false);
  }

  // 3) marcar como leído
  const markAsRead = async (id: number) => {
    try {
      await usuariosForoService.markNotificationAsRead({codeNotification: id});
      setUserNotifications(prev =>
        prev
          ? prev.map(n =>
              n.codeNotification === id
                ? { ...n, isRead: true }
                : n
            )
          : null
      );
    } catch (err) {
      console.error('No pude marcar leído', err);
    }
  };

  return (
    <AlertsLayer>
      <div className="forum">
      {showIntro && <RobotIntro onComplete={handleIntroComplete} />}
      <Loading show={isLoading} />
      <nav className="navBar">
        <div className="navBar-container">
          <input type="checkbox" id="click" />
          <label htmlFor="click" className="menu-btn">
            <i className="fas fa-bars"></i>
          </label>
          <div className="logo">
            <h3>PLOFTEC</h3>
          </div>
          <div className="align-items-lg-start searchContainer">
            <Input
              placeHolder="Escriba algo..."
              submitFunction={handleOnSubmitSearch}
            />
          </div>
          {isUserLoading ? (
            <div className="skeleton-forum-container">
              <SkeletonLine />
            </div>
          ) : user && userForum ? (
            <ul className="buttonsList signed">
              <li>
                <div className="buttonNav" style={{ display: 'flex', justifyContent: 'center' }}>
                  <AvatarUser
                    imageUser={userForum.imageForum}
                    tagUser={obtenerIniciales(userForum.name + ' ' + (userForum.lastName ?? ''))}
                    showDetails={false}
                  />
                </div>
              </li>
              <li>
                <NotificationDropdown
                  notifications={userNotifications}
                  onMarkAsRead={markAsRead}
                />
              </li>
              <li>
                <button className="btn buttonNav" onClick={handleLogout}>
                  <i className="fa fa-sign-out-alt"></i>
                </button>
              </li>
            </ul>
          ) : (
            <ul className="buttonsList">
              <li><a className="buttonNav">Registrarse</a></li>
              <li>
                <a
                  className="buttonNav"
                  onClick={async () => {
                    setIsLoading(true);
                    await new Promise(r => setTimeout(r, 700)); // Simular un retraso de 500ms
                    setIsLoading(false);
                    router.push('/login');
                  }}>
                  Iniciar Sesión
                </a>
              </li>
            </ul>
          )}
        </div>
      </nav>

      <div className="contentForum">
        <div className="tab-menu slider-nav">
          <div className={`tab-menu-item ${activeTab === 0 ? 'active' : ''}`} onClick={() => changeTab(0)}>Publicaciones</div>
          <div className={`tab-menu-item ${activeTab === 1 ? 'active' : ''}`} onClick={() => changeTab(1)}>Usuarios</div>
          <div className={`tab-menu-item ${activeTab === 2 ? 'active' : ''}`} onClick={() => changeTab(2)}>Etiquetas</div>
          <div className={`tab-menu-item ${activeTab === 3 ? 'active' : ''}`} onClick={() => changeTab(3)}>Live Help</div>
          <div className="tab-menu-bar"></div>
        </div>

        <div className="tab-content slider">
          <div className="questionSeparator" />
          <div className="tab-separator" />
          <div className="content" style={{ marginBottom: 16 }}>
            {requiereProteccion ? (
              <ProtectedRoute>{children}</ProtectedRoute>
            ) : (
              children
            )}
          </div>
        </div>
      </div>

      {<Chatbot showRobot={showRobot}></Chatbot>}    
      <Footer />
      </div>
    </AlertsLayer>
  );
}
