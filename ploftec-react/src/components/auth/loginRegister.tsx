"use client";

import { useEffect, useState, type MouseEvent as ReactMouseEvent } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import logo from "../../images/ploftec-fluid.png";
import { authenticateExternal, login } from '@/lib/services/auth/authenticationService';
import useAuthStore from "@/store/slices/authStore/authStore";
import { ProvidersEnum } from "@/lib/types/auth";

export default function LoginRegister() {
  const router = useRouter();

  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showUsernameError, setShowUsernameError] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showEmailError, setShowEmailError] = useState(false);
  const [showConfirmPasswordError, setShowConfirmPasswordError] = useState(false);

  const [animate, setAnimate] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);
  const setAuthLoaded = useAuthStore((state) => state.setAuthLoaded);

  const handleExternalLogin = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    provider: ProvidersEnum
  ) => {
    event.preventDefault();
    authenticateExternal(provider);
  };

  const triggerAnimation = () => {
    setAnimate(true);
    setTimeout(() => {
      setAnimate(false);
    }, 550); // coincide con tu animación CSS de 0.55s
  };

  const toggleRegister = () => setIsRegister(!isRegister);

  const handleLogin = async () => {
    triggerAnimation();
    setAnimate(true);
    setErrorVisible(false);
  
    const usernameEmpty = !username.trim();
    const passwordEmpty = !password.trim();
  
    setShowUsernameError(usernameEmpty);
    setShowPasswordError(passwordEmpty);
  
    if (usernameEmpty || passwordEmpty) {
      return;
    }
    setLoadingLogin(true);
  
    try {
      const response = await login({ username, password });
      if (response != null) {
        setUser(response);
        setAuthLoaded();
        router.push("/forum/publications");
      } else {
        setErrorMessage("Usuario o contraseña inválido");
        setErrorVisible(true);
      }
    } catch (err) {
      setErrorMessage("Error al intentar iniciar sesión");
      setErrorVisible(true);
      console.error(err);
    } finally {
      setLoadingLogin(false);
    }
  };


  const handleRegister = async () => {
    const emailEmpty = !email.trim();
    const usernameEmpty = !username.trim();
    const passwordEmpty = !password.trim();
    const confirmEmpty = !confirmPassword.trim();
    const passwordsDontMatch = password !== confirmPassword;

    setShowEmailError(emailEmpty);
    setShowUsernameError(usernameEmpty);
    setShowPasswordError(passwordEmpty);
    setShowConfirmPasswordError(confirmEmpty || passwordsDontMatch);

    if (emailEmpty || usernameEmpty || passwordEmpty || confirmEmpty || passwordsDontMatch) {
      setErrorMessage(passwordsDontMatch ? "Las contraseñas no coinciden" : "Todos los campos son obligatorios");
      setErrorVisible(true);
      return;
    }

    try {
      const res = await fetch("https://localhost:44352/Auth/Register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Username: username,
          Email: email,
          Password: password,
          ConfirmPassword: confirmPassword,
        }),
      });

      if (res.ok) {
        setIsRegister(false);
        setErrorVisible(false);
      } else {
        const errorText = await res.text();
        setErrorMessage(errorText || "Error al registrar");
        setErrorVisible(true);
      }
    } catch (err) {
      setErrorMessage("Error al registrar usuario");
      setErrorVisible(true);
      console.error(err);
    }
  };
  
  useEffect(() => {
    router.prefetch('/forum/publications');
  }, []);

  return (
    <div className="login-body">
      <div className={`login-container ${isRegister ? "sign-up-mode" : ""}`}>
        <div className="signin-signup">
          {/* Login */}
          <div className="form sign-in-form">
            <form
              className="form"
              autoComplete="on"
              onSubmit={(e) => {
                e.preventDefault(); // evita que se recargue la página
                handleLogin();
              }}
            >
              <div className="image-ploftec">
                <Image src={logo} width="200" height="70" alt="Logo PLOFTEC" />
              </div>
              <div className="title-login">
                <h2 className="title">Iniciar Sesión</h2>
              </div>
              <div className="input-container">
                <div className={`input-field ${showUsernameError ? "error" : ""}`}>
                  <i className="icon fas fa-user" style={{ padding: "0 4px" }}></i>
                  <div className="input-content">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      className="input-login"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setShowUsernameError(false);
                      }}
                    />
                    <label className="placeholder-login" placeholder="Usuario"></label>
                  </div>
                </div>
                  {showUsernameError && (
                    <div className="error-message">Usuario requerido</div>
                  )}
              </div>
              <div className="input-container">
                <div className={`input-field ${showPasswordError ? "error" : ""}`}>
                  <i className="icon fas fa-lock" style={{ padding: "0 4px" }}></i>
                  <div className="input-content">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder=" "
                      className="input-login"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setShowPasswordError(false);
                      }}
                    />
                    <label className="placeholder-login" placeholder="Contraseña"></label>
                    <span className="password-span" onClick={() => setShowPassword(!showPassword)}>
                      <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </span>
                  </div>
                </div>
                  {showPasswordError && (
                    <div className="error-message">Contraseña requerida</div>
                  )}
              </div>
              <div className="button-login-container">
              <button
                className={`button-login ${animate ? "animate" : ""} ${loadingLogin ? "loading" : ""}`}
                onClick={handleLogin}
                disabled={loadingLogin}
              >
                {loadingLogin ? (
                  <span className="spinner"></span>
                ) : (
                  "Ingresar"
                )}
              </button>
              </div>
              {errorVisible && <div className="login-error">{errorMessage}</div>}
              {/* <div className="no-account">
                <p className="account-text">
                  No tienes una cuenta? <a onClick={toggleRegister}>Regístrate!</a>
                </p>
              </div> */}
              <div className="external-login-text">
                <p>O iniciar sesión con:</p>
              </div>
              <div className="text-center">
                <div className="btn-group-external-login">
                  <div className="socialButtonLogin">
                    <ul>
                      <li>
                        <a href="#" onClick={(event) => handleExternalLogin(event, ProvidersEnum.Google)}>
                          <i className="fab fa-google"></i>
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(event) => handleExternalLogin(event, ProvidersEnum.GitHub)}>
                          <i className="fab fa-github"></i>
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(event) => handleExternalLogin(event, ProvidersEnum.LinkedIn)}>
                          <i className="fab fa-linkedin-in"></i>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </form>
          </div>

        {/* Register */}
        <div className="form sign-up-form">
            <h2 className="title">Panel de registro</h2>
            <div className="input-container">
              <div className="input-field">
                <i className="fas fa-user"></i>
                <div className="input-content">
                  <input
                    type="text"
                    placeholder=" "
                    className="input-login"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <label className="placeholder-login" placeholder="Ingrese su nombre..."></label>
                </div>
              </div>
              {showUsernameError && <div className="error-message">Nombre requerido</div>}
            </div>
            <div className="input-container">
              <div className="input-field">
                <i className="fas fa-envelope"></i>
                <div className="input-content">
                  <input
                    type="text"
                    placeholder=" "
                    className="input-login"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <label className="placeholder-login" placeholder="Ingrese su email..."></label>
                </div>
              </div>
              {showEmailError && <div className="error-message">Email requerido</div>}
            </div>
            <div className="input-container">
              <div className="input-field">
                <i className="fas fa-lock"></i>
                <div className="input-content">
                  <input
                    type="password"
                    placeholder=" "
                    className="input-login"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label className="placeholder-login" placeholder="Ingrese una contraseña..."></label>
                </div>
              </div>
              {showPasswordError && <div className="error-message">Contraseña requerida</div>}
            </div>
            <div className="input-container">
              <div className="input-field">
                <i className="fas fa-lock"></i>
                <div className="input-content">
                  <input
                    type="password"
                    placeholder=" "
                    className="input-login"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <label className="placeholder-login" placeholder="Repetir Contraseña"></label>
                </div>
              </div>
              {showConfirmPasswordError && <div className="error-message">{password !== confirmPassword ? "Las contraseñas no coinciden" : "Confirmación requerida"}</div>}
            </div>
            <button className="button-login" onClick={handleRegister}>Registrarse</button>
            {errorVisible && isRegister && <div className="login-error">{errorMessage}</div>}
            <p className="account-text">Ya tienes una cuenta? <a onClick={() => setIsRegister(false)}>Iniciar Sesión</a></p>
          </div>
        </div>

        {/* Panels */}
        <div className="panels-container">
          <div className="panel left-panel">
            <div className="content">
              <h3>¿Aun no es miembro?</h3>
              <p>
                No pierda la oportunidad de especializarse en ciberseguridad, tenemos los mejores cursos,
                carreras, capacitaciones y ayuda en linea con lo que usted necesite!
              </p>
              <button className="btn-login" onClick={() => setIsRegister(false)} id="sign-in-btn">
                Iniciar Sesión
              </button>
            </div>
            <Image src="/signin.svg" alt="" className="image" width={1024} height={768}/>
          </div>

          <div className="panel right-panel">
            <div className="content">
              <h3>¿Aún no tienes cuenta?</h3>
              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Neque accusantium dolor, eos incidunt minima iure?</p>
              <button className="btn-login" onClick={() => setIsRegister(true)} id="sign-up-btn">
                Regístrate!
              </button>
            </div>
            <Image src="/signup.svg" alt="" className="image" width={1024} height={768}/>
          </div>
        </div>
      </div>
    </div>
  );
}
