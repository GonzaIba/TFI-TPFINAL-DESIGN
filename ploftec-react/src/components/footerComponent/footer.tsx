import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./footer.module.css";
import logo from "@/images/ploftec-fluid.png";
import { ChevronUp, ChevronDown } from "lucide-react";

const Footer: React.FC = () => {

  const [isExpanded, setIsExpanded] = useState(false);

  const toggleFooter = () => setIsExpanded(!isExpanded);

  return (
    <footer className={styles.footerSection}>
      {/* Botón que sobresale */}
      <button onClick={toggleFooter} className={styles.toggleButton}>
        {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="footer-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <div className={styles.footerContainer}>
              <div className={styles.footerCta + " pt-3 pb-3"}>
                <div className={styles.footerRow}>
                  <div className={styles.singleCta}>
                    <i className="fas fa-map-marker-alt"></i>
                    <div className={styles.ctaText}>
                      <h4>Encontranos en</h4>
                      <span>Av. Falsa 24, CABA, Argentina</span>
                    </div>
                  </div>
                  <div className={styles.singleCta}>
                    <i className="fas fa-phone"></i>
                    <div className={styles.ctaText}>
                      <h4>Comunicate a</h4>
                      <span>11 1234-5678</span>
                    </div>
                  </div>
                  <div className={styles.singleCta}>
                    <i className="far fa-envelope-open"></i>
                    <div className={styles.ctaText}>
                      <h4>Envianos un mail a</h4>
                      <span>ploftec@gmail.com</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.footerContent + " pt-3 pb-3"}>
                <div className={styles.footerRow}>
                  <div className={styles.footerWidget}>
                    <div className={styles.footerLogo}>
                      <Image
                        src={logo}
                        alt="Logo PLOFTEC"
                        width={200}
                        height={70}
                      />
                    </div>
                    <div className={styles.footerText}>
                      <p>
                        <strong>Aprendé. Compartí. Crecé.</strong><br />
                        <span className={styles.singleLine}>
                          Este espacio existe para que encuentres respuestas, compartas tus ideas y sigas creciendo cada día.
                        </span><br />
                        Gracias por ser parte de esta comunidad.
                      </p>
                    </div>
                    <div className={styles.footerSocialIcon}>
                      <span>Seguinos en</span>
                      <a href="#"><i className={`fab fa-facebook-f ${styles.facebookBg}`}></i></a>
                      <a href="#"><i className={`fab fa-twitter ${styles.twitterBg}`}></i></a>
                      <a href="#"><i className={`fab fa-google-plus-g ${styles.googleBg}`}></i></a>
                    </div>
                  </div>

                  <div className={styles.footerWidget}>
                    <div className={styles.footerWidgetHeading}>
                      <h3>Links</h3>
                    </div>
                    <ul className={styles.footerUl}>
                      <li><a href="/">Home</a></li>
                      <li><a href="#">About</a></li>
                      <li><a href="#">Services</a></li>
                      <li><a href="#">Portfolio</a></li>
                      <li><a href="#">Contact</a></li>
                      <li><a href="#">About us</a></li>
                      <li><a href="#">Our Services</a></li>
                      <li><a href="#">Expert Team</a></li>
                      <li><a href="#">Contact us</a></li>
                      <li><a href="#">Latest News</a></li>
                    </ul>
                  </div>

                  <div className={styles.footerWidget}>
                    <div className={styles.footerWidgetHeading}>
                      <h3>Subscribete</h3>
                    </div>
                    <div className={`${styles.footerText} mb-25`}>
                      <p>¡No te pierdas de todos nuestros servicios que ofrecemos!</p>
                    </div>
                    <div className={styles.subscribeForm}>
                      <form action="#">
                        <input type="text" placeholder="Email Address" />
                        <button><i className="fab fa-telegram-plane"></i></button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.copyrightArea}>
        <div className={styles.footerContainer}>
          <div className={styles.footerRowFixed}>
            <div className={styles.copyrightText}>
              <p>
                Copyright &copy; 2025 Ploftec
              </p>
            </div>
            <div className={styles.footerMenu}>
              <ul className={styles.footerUl}>
                <li><a href="/">Home</a></li>
                <li><a href="#tyc">Términos</a></li>
                <li><a href="#privacy">Privacidad</a></li>
                <li><a href="#politics">Política</a></li>
                <li><a href="#whoare">¿Quienes Somos?</a></li>
                <li><a href="#contact">Contacto</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
