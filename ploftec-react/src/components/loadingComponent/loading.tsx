"use client";

import styles from "./loading.module.css";
import { HashLoader } from "react-spinners";

interface LoadingProps {
  show: boolean;
}

export default function Loading({ show }: LoadingProps) {

  return (
    <div className={`${styles.overlay} ${show ? styles.show : styles.fadeOut}`}>
      <div className={styles.centered}>
        <HashLoader size={120} color="#007bff" />
      </div>
    </div>
  );
}
