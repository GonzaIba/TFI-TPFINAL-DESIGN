"use client";

import { useState } from "react";
import styles from "./button.module.css";

interface ButtonProps {
  executeFunction?: () => Promise<void>;
  onCompleted?: () => Promise<void>;
  iconClass?: string;
  iconColor?: string;
  displayText?: string;
  textExecuting?: string;
  textCompleteExecuting?: string;
  colorBackground?: string;
  bordered?: boolean;
  borderedWithoutRadius?: boolean;
  transparentContainer?: boolean;
  useIcon?: boolean;
  useExecutingInteraction?: boolean;
  width?: string;
}

export default function ButtonPloftec({
  executeFunction,
  onCompleted,
  iconClass = "bx bx-cloud-download",
  iconColor = "#fff",
  displayText = "Descargar",
  textExecuting = "Ejecutando...",
  textCompleteExecuting = "Completado!",
  colorBackground = "#644bff",
  bordered = false,
  borderedWithoutRadius = false,
  transparentContainer = false,
  useIcon = true,
  useExecutingInteraction = false,
  width = "170px",
}: ButtonProps) {
  const [currentText, setCurrentText] = useState(displayText);
  const [currentIcon, setCurrentIcon] = useState(iconClass);

  const execute = async () => {
    if (!executeFunction) return;

    if (useExecutingInteraction) {
      setCurrentIcon("bx bx-loader bx-spin");
      setCurrentText(textExecuting);
      await executeFunction();
      setCurrentIcon("bx bx-check-circle");
      setCurrentText(textCompleteExecuting);

      setTimeout(() => {
        setCurrentIcon("bx bx-cloud-download");
        setCurrentText(displayText);
        onCompleted?.();
      }, 2000);
    } else {
      await executeFunction();
    }
  };

  const buttonClass = `${styles.buttonPloftec} ${
    bordered ? styles.bordered : borderedWithoutRadius ? styles.borderedWithoutRadius : ""
  }`;

  const containerStyle = {
    background: transparentContainer ? "transparent" : colorBackground,
    border: bordered || borderedWithoutRadius ? "2px solid #644bff" : "none",
    width,
  };

  return (
    <div className={styles.buttonPloftecContainer}>
      <div className={buttonClass} onClick={execute} style={containerStyle}>
        <div
          className={styles.contentPloftec}
          style={{ justifyContent: useIcon ? "" : "center" }}
        >
          {useIcon && (
            <div className={styles.iconButtonPloftec}>
              <i className={currentIcon} style={{ color: iconColor }}></i>
            </div>
          )}
          <div className={styles.buttonPloftecText}>
            <span>{currentText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
