// src/app/forum/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getUserDetails, logout } from '@/lib/services/auth/authenticationService';
import { usuariosForoService } from '@/lib/services/forum/usuariosForoService';
import { obtenerIniciales } from '@/lib/helpers/forumHelper';
import { UserApplication } from '@/lib/types/application';
import { DetailsUserForumResponse } from '@/lib/types/forum';
import Footer from '@/components/footerComponent/footer';
import useAuthStore from "@/store/slices/authStore/authStore";
import ProtectedRoute from "@/components/auth/protectedRoute";
import {
  moveTabBar,
  moveContentTabBar,
  enableTdTextSelection,
  preventHorizontalScrollWheel,
} from '@/lib/utils/tabBar';
import { Chatbot, Input, SkeletonLine, AvatarUser, Loading } from '@/components';
import { RobotIntro } from '@/components/chatbotComponent/robotIntro/robotIntro';
import { publicationsService } from '@/lib/services/forum/publicationsService';

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userForum, setUserForum] = useState<DetailsUserForumResponse | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const isAuthLoaded = useAuthStore((state) => state.isAuthLoaded);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  console.log("LAYOUT page:");

  const rutasProtegidas = [
    "/forumTest",
    //"/forum/users",
    //"/forum/labels",
    //"/forum/liveHelp",
  ];

  useEffect(() => {
    const fetchUserForum = async () => {
      if (isAuthLoaded) {
        setIsUserLoading(true);

        if (isAuthenticated && user?.email) {
          try {
            const res = await usuariosForoService.obtenerDetalleUsuario(user.email);
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
  }, [isAuthLoaded, isAuthenticated, user]);

  useEffect(() => {
    if (pathname === '/forum') {
      router.push('/forum/publications');
    }
    else if (pathname === '/forum/users') {
      setActiveTab(1);
      moveTabBar(1);
    } else if (pathname === '/forum/labels') {
      setActiveTab(2);
      moveTabBar(2);
    } else if (pathname === '/forum/liveHelp') {
      setActiveTab(3);
      moveTabBar(3);
    }
  }, [pathname, router]);

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

  useEffect(() => {
    router.prefetch('/forum/publications');
    router.prefetch('/forum/users');
    router.prefetch('/login');
  }, []);

  const [showIntro, setShowIntro] = useState(false);
  const [showRobot, setShowRobot] = useState(true);

  const handleIntroComplete = () => {
    setShowIntro(false);
    setShowRobot(true);
  };

  const handleOnSubmitSearch = async (query: string) => {
    //setIsLoading(true);
    //await publicationsService.getPublicationsWithFilter(query, 0, 10);
    router.push(`/forum/publications?search=${encodeURIComponent(query)}`)
    //setIsLoading(false);
  }

  return (
    <div className="forum">
      {showIntro && <RobotIntro onComplete={handleIntroComplete} />}
      <Loading show={isLoading} />
      <nav className="navBar">
        <div className="navBar-container">
          <input type="checkbox" id="click" />
          <label htmlFor="click" className="menu-btn">
            <i className="fas fa-bars"></i>
          </label>
          <div className="logo">PLOFTEC</div>
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
                <button className="btn buttonNav">
                  <i className="fa fa-bell"></i>
                </button>
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

      {/* <Footer /> */}
      {<Chatbot showRobot={showRobot}></Chatbot>}    
    </div>
  );
}
