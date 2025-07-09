import React from "react";
import Image from "next/image"; // Usá esto si estás en Next.js.
import styles from "./footer.module.css";

const Footer: React.FC = () => {
  return (
    <footer className={styles.footerSection}>
      <div className="container">
        <div className={styles.footerCta + " pt-3 pb-3"}>
          <div className="row">
            <div className="col-xl-4 col-md-4 mb-30">
              <div className={styles.singleCta}>
                <i className="fas fa-map-marker-alt"></i>
                <div className={styles.ctaText}>
                  <h4>Find us</h4>
                  <span>1010 Avenue, sw 54321, chandigarh</span>
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-md-4 mb-30">
              <div className={styles.singleCta}>
                <i className="fas fa-phone"></i>
                <div className={styles.ctaText}>
                  <h4>Call us</h4>
                  <span>9876543210 0</span>
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-md-4 mb-30">
              <div className={styles.singleCta}>
                <i className="far fa-envelope-open"></i>
                <div className={styles.ctaText}>
                  <h4>Mail us</h4>
                  <span>mail@info.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footerContent + " pt-3 pb-3"}>
          <div className="row">
            <div className="col-xl-4 col-lg-4 mb-50">
              <div className={styles.footerWidget}>
                <div className={styles.footerLogo}>
                  <a href="/">
                    <Image
                      src="/images/ploftec-fluid.png"
                      alt="Logo PLOFTEC"
                      width={200}
                      height={70}
                    />
                  </a>
                </div>
                <div className={styles.footerText}>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
                    eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                </div>
                <div className={styles.footerSocialIcon}>
                  <span>Follow us</span>
                  <a href="#"><i className={`fab fa-facebook-f ${styles.facebookBg}`}></i></a>
                  <a href="#"><i className={`fab fa-twitter ${styles.twitterBg}`}></i></a>
                  <a href="#"><i className={`fab fa-google-plus-g ${styles.googleBg}`}></i></a>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-lg-4 col-md-6 mb-30">
              <div className={styles.footerWidget}>
                <div className={styles.footerWidgetHeading}>
                  <h3>Useful Links</h3>
                </div>
                <ul className={styles.footerUl}>
                  <li><a href="#">Home</a></li>
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
            </div>

            <div className="col-xl-4 col-lg-4 col-md-6 mb-50">
              <div className={styles.footerWidget}>
                <div className={styles.footerWidgetHeading}>
                  <h3>Subscribe</h3>
                </div>
                <div className={`${styles.footerText} mb-25`}>
                  <p>Don’t miss to subscribe to our new feeds, kindly fill the form below.</p>
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
      </div>

      <div className={styles.copyrightArea}>
        <div className="container">
          <div className="row">
            <div className="col-xl-6 col-lg-6 text-center text-lg-left">
              <div className={styles.copyrightText}>
                <p>
                  Copyright &copy; 2018, All Right Reserved{" "}
                  <a href="https://codepen.io/anupkumar92/">Anup</a>
                </p>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 d-none d-lg-block text-right">
              <div className={styles.footerMenu}>
                <ul className={styles.footerUl}>
                  <li><a href="#">Home</a></li>
                  <li><a href="#">Terms</a></li>
                  <li><a href="#">Privacy</a></li>
                  <li><a href="#">Policy</a></li>
                  <li><a href="#">Contact</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
