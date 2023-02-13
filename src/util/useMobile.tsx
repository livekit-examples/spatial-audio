import { getSelectorsByUserAgent } from "react-device-detect";

export const useMobile = () => {
  if (typeof navigator === "undefined") return false;
  const { isMobile } = getSelectorsByUserAgent(navigator.userAgent);
  return isMobile;
};
