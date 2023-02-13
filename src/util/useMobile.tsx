import { useDeviceSelectors } from "react-device-detect";

export const useMobile = () => {
  const [selectors] = useDeviceSelectors(navigator.userAgent || "SSR");
  return selectors.isMobile;
};
