"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./avatarUser.module.css";

interface AvatarUserProps {
  tagUser: string;
  imageUser?: string;
  descripcionCorta?: string;
  descripcionLarga?: string;
  nombreCompleto?: string;
  showDetails?: boolean;
}

const colors = [
  "#00AA55",
  "#009FD4",
  "#B381B3",
  "#939393",
  "#E3BC00",
  "#D47500",
  "#DC2A2A",
];

function getAvatarBackgroundColor(text: string): string {
  const number = numberFromText(text || "AD");
  return colors[number % colors.length];
}

function numberFromText(text: string): number {
  const charCodes = Array.from(text).map((c) => c.charCodeAt(0)).join("");
  return parseInt(charCodes);
}

export default function AvatarUser({
  tagUser,
  imageUser,
  descripcionCorta,
  descripcionLarga,
  nombreCompleto,
  showDetails = true,
}: AvatarUserProps) {
  const [avatarBg, setAvatarBg] = useState("#000");

  useEffect(() => {
    setAvatarBg(getAvatarBackgroundColor(tagUser));
  }, [tagUser]);

  return (
    <div className={styles.containerAvatar}>
      <div
        className={styles.profile}
        style={{
          backgroundImage: imageUser ? `url(${imageUser})` : undefined,
          backgroundColor: imageUser ? undefined : avatarBg,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: "16px",
          color: "#fff",
        }}
      >
        {!imageUser && tagUser}

        {/* Tooltip solo se renderiza si showDetails es true */}
        {showDetails && (
          <div className={styles.contentAvatar}>
            <div className={styles.header}>
              {imageUser ? (
                <img
                  className={styles.imageUser}
                  src={imageUser}
                  alt={tagUser}
                />
              ) : (
                <div
                  className={styles.avatarUser}
                  style={{ backgroundColor: avatarBg }}
                >
                  {tagUser}
                </div>
              )}
              <div className={styles.infos}>
                <h3 className={styles.name}>{nombreCompleto}</h3>
                <p className={styles.title}>{descripcionCorta}</p>
              </div>
            </div>
            <div className={styles.body}>
              <p>{descripcionLarga}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
