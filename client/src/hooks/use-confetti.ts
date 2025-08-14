import { useState, useCallback } from "react";

export function useConfetti() {
  const [isActive, setIsActive] = useState(false);

  const trigger = useCallback(() => {
    setIsActive(true);
    setTimeout(() => setIsActive(false), 3000);
  }, []);

  return { isActive, trigger };
}
