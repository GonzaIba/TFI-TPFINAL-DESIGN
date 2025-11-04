"use client";

import { useEffect, useState, type MouseEvent as ReactMouseEvent } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import logo from "../../images/ploftec-fluid.png";
import { authenticateExternal, login, register as registerService } from '@/lib/services/auth/authenticationService';
import useAuthStore from "@/store/slices/authStore/authStore";
import { ProvidersEnum } from "@/lib/types/auth";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9\s()+-]{7,20}$/;

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
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [showEmailError, setShowEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [showConfirmPasswordError, setShowConfirmPasswordError] = useState(false);
  const [showLastNameError, setShowLastNameError] = useState(false);
  const [showPhoneError, setShowPhoneError] = useState(false);
  const [phoneErrorMessage, setPhoneErrorMessage] = useState("");

  const [animate, setAnimate] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [animateRegister, setAnimateRegister] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
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

  const triggerRegisterAnimation = () => {
    setAnimateRegister(true);
    setTimeout(() => {
      setAnimateRegister(false);
    }, 550);
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
    triggerRegisterAnimation();
    setErrorVisible(false);

    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const emailEmpty = !trimmedEmail;
    const trimmedUsername = username.trim();
    const trimmedLastName = lastName.trim();
    const usernameEmpty = !trimmedUsername;
    const lastNameEmpty = !trimmedLastName;
    const phoneEmpty = !trimmedPhone;
    const passwordEmpty = !password.trim();
    const confirmEmpty = !confirmPassword.trim();
    const passwordsDontMatch = password !== confirmPassword;
    const invalidEmail = !emailEmpty && !emailRegex.test(trimmedEmail);
    const invalidPhone = !phoneEmpty && !phoneRegex.test(trimmedPhone);

    setShowEmailError(emailEmpty || invalidEmail);
    setEmailErrorMessage(
      emailEmpty ? "Email requerido" : invalidEmail ? "Email inválido" : ""
    );
    setShowUsernameError(usernameEmpty);
    setShowLastNameError(lastNameEmpty);
    setShowPhoneError(phoneEmpty || invalidPhone);
    setPhoneErrorMessage(
      phoneEmpty ? "Teléfono requerido" : invalidPhone ? "Teléfono inválido" : ""
    );
    setShowPasswordError(passwordEmpty);
    setShowConfirmPasswordError(confirmEmpty || passwordsDontMatch);

    const hasMissingRequired =
      emailEmpty ||
      usernameEmpty ||
      lastNameEmpty ||
      phoneEmpty ||
      passwordEmpty ||
      confirmEmpty;

    const hasInvalidFormat = invalidEmail || invalidPhone;

    if (passwordsDontMatch || hasMissingRequired || hasInvalidFormat) {
      if (passwordsDontMatch) {
        setErrorMessage("Las contrasenas no coinciden");
      } else if (hasMissingRequired) {
        setErrorMessage("Todos los campos son obligatorios");
      } else {
        setErrorMessage("Revise los campos marcados en el formulario");
      }
      setErrorVisible(true);
      return;
    }

    try {
      setLoadingRegister(true);
      const response = await registerService({
        email: trimmedEmail,
        firstName: trimmedUsername,
        lastName: trimmedLastName,
        password,
        confirmPassword,
        phoneNumber: trimmedPhone,
      });

      if (response?.data) {
        setIsRegister(false);
        setErrorVisible(false);
        setUsername("");
        setLastName("");
        setPhone("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setShowUsernameError(false);
        setShowLastNameError(false);
        setShowPhoneError(false);
        setShowEmailError(false);
        setEmailErrorMessage("");
        setPhoneErrorMessage("");
        setShowPasswordError(false);
        setShowConfirmPasswordError(false);
        setShowPassword(false);
        setShowRegisterPassword(false);
        setShowRegisterConfirmPassword(false);
      } else if (response?.errors?.errorsList?.length) {
        const serverMessage = response.errors.errorsList[0]?.message;
        setErrorMessage(serverMessage || "Ocurrio un error, contacte con un administrador");
        setErrorVisible(true);
      } else {
        setErrorMessage("Ocurrio un error, contacte con un administrador");
        setErrorVisible(true);
      }
    } catch (err) {
      setErrorMessage("Ocurrio un error, contacte con un administrador");
      setErrorVisible(true);
      console.error(err);
    } finally {
      setLoadingRegister(false);
    }
  };
  
  useEffect(() => {
    router.prefetch('/forum/publications');
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'register' || window.location.hash === '#register') {
      setIsRegister(true);
    }
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
          <form
            className="form"
            autoComplete="on"
            onSubmit={(e) => {
              e.preventDefault();
              handleRegister();
            }}
          >
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
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setShowUsernameError(false);
                    }}
                  />
                  <label className="placeholder-login" placeholder="Ingrese su nombre..."></label>
                </div>
              </div>
              {showUsernameError && <div className="error-message">Nombre requerido</div>}
            </div>
            <div className="input-container">
              <div className="input-field">
                <i className="fas fa-user"></i>
                <div className="input-content">
                  <input
                    type="text"
                    placeholder=" "
                    className="input-login"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      setShowLastNameError(false);
                    }}
                  />
                  <label className="placeholder-login" placeholder="Ingrese su apellido..."></label>
                </div>
              </div>
              {showLastNameError && <div className="error-message">Apellido requerido</div>}
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
                    onChange={(e) => {
                      const value = e.target.value;
                      setEmail(value);
                      setShowEmailError(false);
                      setEmailErrorMessage("");
                    }}
                  />
                  <label className="placeholder-login" placeholder="Ingrese su email..."></label>
                </div>
              </div>
              {showEmailError && <div className="error-message">{emailErrorMessage}</div>}
            </div>
            <div className="input-container">
              <div className="input-field">
                <i className="fas fa-phone"></i>
                <div className="input-content">
                  <input
                    type="text"
                    placeholder=" "
                    className="input-login"
                    value={phone}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPhone(value);
                      setShowPhoneError(false);
                      setPhoneErrorMessage("");
                    }}
                  />
                  <label className="placeholder-login" placeholder="Ingrese su telefono..."></label>
                </div>
              </div>
              {showPhoneError && <div className="error-message">{phoneErrorMessage}</div>}
            </div>
            <div className="input-container">
              <div className={`input-field ${showPasswordError ? "error" : ""}`}>
                <i className="fas fa-lock"></i>
                <div className="input-content">
                  <input
                    type={showRegisterPassword ? "text" : "password"}
                    placeholder=" "
                    className="input-login"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setShowPasswordError(false);
                    }}
                  />
                  <label className="placeholder-login" placeholder="Ingrese una contrasena..."></label>
                  <span className="password-span" onClick={() => setShowRegisterPassword(!showRegisterPassword)}>
                    <i className={`fas ${showRegisterPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </span>
                </div>
              </div>
              {showPasswordError && <div className="error-message">Contrasena requerida</div>}
            </div>
            <div className="input-container">
              <div className={`input-field ${showConfirmPasswordError ? "error" : ""}`}>
                <i className="fas fa-lock"></i>
                <div className="input-content">
                  <input
                    type={showRegisterConfirmPassword ? "text" : "password"}
                    placeholder=" "
                    className="input-login"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setShowConfirmPasswordError(false);
                    }}
                  />
                  <label className="placeholder-login" placeholder="Repetir Contrasena"></label>
                  <span className="password-span" onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}>
                    <i className={`fas ${showRegisterConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </span>
                </div>
              </div>
              {showConfirmPasswordError && <div className="error-message">{password !== confirmPassword ? "Las contrasenas no coinciden" : "Confirmacion requerida"}</div>}
            </div>
            <div className="button-login-container">
              <button
                type="submit"
                className={`button-login ${animateRegister ? "animate" : ""} ${loadingRegister ? "loading" : ""}`}
                disabled={loadingRegister}
              >
                {loadingRegister ? (
                  <span className="spinner"></span>
                ) : (
                  "Registrarse"
                )}
              </button>
            </div>
            {errorVisible && isRegister && <div className="login-error">{errorMessage}</div>}
            <p className="account-text">Ya tienes una cuenta? <a onClick={() => setIsRegister(false)}>Iniciar Sesion</a></p>
          </form>
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



