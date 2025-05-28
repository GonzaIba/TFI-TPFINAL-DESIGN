import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type VoteNumberProps = {
  value: number;
};

export function VoteNumber({ value }: VoteNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [direction, setDirection] = useState<"up" | "down">("up");
  const [hasMounted, setHasMounted] = useState(false);

  const prevValue = useRef(value);

  useEffect(() => {
    // Esto se ejecuta después del primer render
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted) {
      if (value > prevValue.current) {
        setDirection("up");
      } else if (value < prevValue.current) {
        setDirection("down");
      }
      setDisplayValue(value);
      prevValue.current = value;
    }
  }, [value, hasMounted]);

  return (
    <div
      style={{
        position: "relative",
        height: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
        fontWeight: "bold",
        color: "white",
      }}
    >
      <span style={{ visibility: "hidden" }}>{displayValue}</span>

      <AnimatePresence mode="wait">
        {hasMounted ? (
          <motion.div
            key={displayValue}
            initial={{ y: direction === "up" ? 20 : -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: direction === "up" ? -20 : 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "absolute",
            }}
          >
            {displayValue}
          </motion.div>
        ) : (
          <div
            style={{
              position: "absolute",
            }}
          >
            {displayValue}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
