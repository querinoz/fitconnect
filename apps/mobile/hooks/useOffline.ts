import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

export function useOffline() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const sub = NetInfo.addEventListener((state) => {
      setOffline(!(state.isConnected && state.isInternetReachable !== false));
    });
    return () => sub();
  }, []);

  return offline;
}
