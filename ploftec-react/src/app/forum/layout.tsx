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
    flags: ['hasSeenIntroLiveHelp', 'hasSeenIntroLiveHelpConfirmed'],
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

type TabDescriptor = {
  label: string;
  route: string;
  match: (path: string) => boolean;
};

const BASE_TAB_CONFIG: TabDescriptor[] = [
  {
    label: 'Publicaciones',
    route: '/forum/publications',
    match: startsWithRoute('/forum/publications'),
  },
  {
    label: 'Usuarios',
    route: '/forum/users',
    match: startsWithRoute('/forum/users'),
  },
  {
    label: 'Etiquetas',
    route: '/forum/labels',
    match: startsWithRoute('/forum/labels'),
  },
  {
    label: 'Live Help',
    route: '/forum/liveHelp',
    match: startsWithRoute('/forum/liveHelp'),
  },
];

const ADMIN_TAB: TabDescriptor = {
  label: 'Administración',
  route: '/forum/administration',
  match: startsWithRoute('/forum/administration'),
};

const isAdminRole = (role?: string | null): boolean => {
  if (!role) return false;
  return role.toLowerCase().includes('admin');
};

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
  const roleName = useAuthStore((state) => state.role ?? state.user?.roleName ?? null);
  const setAlertsEnabled = useAlertsConfigStore((state) => state.setAlertsEnabled);

  const isAdmin = useMemo(() => isAdminRole(roleName), [roleName]);

  const tabConfig = useMemo(() => {
    const items = [...BASE_TAB_CONFIG];
    if (isAdmin) {
      items.push(ADMIN_TAB);
    }
    return items;
  }, [isAdmin]);

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
    if (!tabConfig.length || !isAuthLoaded) return;

    const normalizedPath = pathname?.toLowerCase() ?? '';

    if (!isAdmin && ADMIN_TAB.match(normalizedPath)) {
      router.replace('/forum/publications');
      return;
    }

    if (normalizedPath === '/forum') {
      router.push(tabConfig[0].route);
      setActiveTab(0);
      return;
    }

    const matchedIndex = tabConfig.findIndex((tab) => tab.match(normalizedPath));

    if (matchedIndex >= 0) {
      setActiveTab(matchedIndex);
      return;
    }

    setActiveTab(0);
  }, [pathname, router, tabConfig, isAdmin, isAuthLoaded]);

  useEffect(() => {
    if (!tabConfig.length) return;
    tabConfig.forEach((tab) => router.prefetch(tab.route));
    router.prefetch('/login');
  }, [router, tabConfig]);

  useEffect(() => {
    if (!tabConfig.length) return;
    if (activeTab >= tabConfig.length) {
      setActiveTab(tabConfig.length - 1);
      return;
    }
    moveTabBar(activeTab);
  }, [activeTab, tabConfig]);

  const changeTab = useCallback((index: number) => {
    const target = tabConfig[index];
    if (!target) return;
    setActiveTab(index);
    moveTabBar(index);
    router.push(target.route);
  }, [router, tabConfig]);

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
          {tabConfig.map((tab, index) => (
            <div
              key={tab.route}
              className={`tab-menu-item ${activeTab === index ? 'active' : ''}`}
              onClick={() => changeTab(index)}
            >
              {tab.label}
            </div>
          ))}
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
