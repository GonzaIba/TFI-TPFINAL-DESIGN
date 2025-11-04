"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./avatarUser.module.css";
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

type Direction = 'top' | 'down' | 'left' | 'right';

interface AvatarUserProps {
  tagUser: string;
  imageUser?: string;
  descripcionCorta?: string;
  descripcionLarga?: string;
  nombreCompleto?: string;
  showDetails?: boolean;
  direction?: Direction;
  /** tamaño del avatar en px (ancho/alto). Default: 40 */
  size?: number;
  onClick?: () => void;
  ariaLabel?: string;
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
  direction,
  size = 40,
  onClick,
  ariaLabel,
}: AvatarUserProps) {
  const [avatarBg, setAvatarBg] = useState("#000");

  const HtmlTooltip = styled(
    ({ className, title, children, ...props }: any) => (
      <Tooltip
        {...props}
        classes={{ popper: className }}
        title={title}
        placement={direction}
        arrow
        leaveDelay={300}
      >
        {children}
      </Tooltip>
    )
  )(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      minWidth: 400,
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #dadde9',
    },
  }));

  useEffect(() => {
    setAvatarBg(getAvatarBackgroundColor(tagUser));
  }, [tagUser]);

  const isInteractive = typeof onClick === 'function';
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isInteractive || !onClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <>
    {showDetails ? (
      <HtmlTooltip
        title={
          <React.Fragment>
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
          </React.Fragment>
        }
      >
        <div
          className={styles.containerAvatar}
          onClick={onClick}
          onKeyDown={handleKeyDown}
          role={isInteractive ? 'button' : undefined}
          tabIndex={isInteractive ? 0 : undefined}
          aria-label={isInteractive ? (ariaLabel ?? nombreCompleto ?? tagUser) : undefined}
        >
          <div
            className={styles.profile}
            style={{
              backgroundImage: imageUser ? `url(${imageUser})` : undefined,
              backgroundColor: imageUser ? undefined : avatarBg,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: `${Math.max(12, Math.round(size * 0.4))}px`,
              color: "#fff",
            }}
          >
            {!imageUser && tagUser}
          </div>
        </div>
      </HtmlTooltip>
      ) : (
        <div
          className={styles.containerAvatar}
          onClick={onClick}
          onKeyDown={handleKeyDown}
          role={isInteractive ? 'button' : undefined}
          tabIndex={isInteractive ? 0 : undefined}
          aria-label={isInteractive ? (ariaLabel ?? nombreCompleto ?? tagUser) : undefined}
        >
          <div
            className={styles.profile}
            style={{
              backgroundImage: imageUser ? `url(${imageUser})` : undefined,
              backgroundColor: imageUser ? undefined : avatarBg,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: `${Math.max(12, Math.round(size * 0.4))}px`,
              color: "#fff",
            }}
          >
            {!imageUser && tagUser}
          </div>
        </div>
      )}
    </>
  );
}
