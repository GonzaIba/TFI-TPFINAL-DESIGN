// src/app/forum/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getUserDetails, logout } from '@/lib/services/auth/authenticationService';
import { usuariosForoService } from '@/lib/services/forum/usuariosForoService';
import { obtenerIniciales } from '@/lib/helpers/forumHelper';
import { UserApplication } from '@/lib/types/application';
import { DetailsUserForumResponse } from '@/lib/types/forum';
import Search from '@/components/searchComponent/search';
import AvatarUser from '@/components/avatarUserComponent/avatarUser';
import SkeletonLine from '@/components/skeletonComponent/skeletonLine';
import Button from '@/components/buttonComponent/button';
import Loading from '@/components/loadingComponent/loading';
import Footer from '@/components/footerComponent/footer';

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isUserLoading, setIsUserLoading] = useState(true);
  const [user, setUser] = useState<UserApplication | null>(null);
  const [userForum, setUserForum] = useState<DetailsUserForumResponse | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const userData = await getUserDetails();
        if (userData?.email) {
          const userForumDetails = await usuariosForoService.obtenerDetalleUsuario(userData.email);
          setUser(userData);
          setUserForum(userForumDetails);
        }
      } catch (e) {
        // manejar error
        console.error(e);
      } finally {
        setIsUserLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (pathname === '/Forum') {
      router.push('/Forum/Publications');
    }
  }, [pathname]);

  const changeTab = async (index: number) => {
    setActiveTab(index);
    let route = '/Forum/Publications';
    if (index === 1) route = '/Forum/Users';
    else if (index === 2) route = '/Forum/Labels';
    else if (index === 3) route = '/Forum/LiveHelp';
    router.push(route);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="forum">
      <Loading show={isLoading} />
      <nav className="navBar">
        <div className="navBar-container">
          <input type="checkbox" id="click" />
          <label htmlFor="click" className="menu-btn">
            <i className="fas fa-bars"></i>
          </label>
          <div className="logo">PLOFTEC</div>
          <div className="align-items-lg-start searchContainer">
            <Search
              showHelpCodeOptions={true}
              placeHolder="Escriba algo..."
              searchFunction={async () => {}}
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
                    tagUser={obtenerIniciales(userForum.nombre + ' ' + (userForum.apellido ?? ''))}
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
                    await new Promise(r => setTimeout(r, 1000));
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
          <div className="content" style={{ marginBottom: 16 }}>{children}</div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
