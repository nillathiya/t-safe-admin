import { useEffect } from "react";
import useLocalStorage from "./useLocalStorage";

const useColorMode = (): ["light" | "dark", (mode: "light" | "dark") => void] => {
  const [colorMode, setColorMode] = useLocalStorage<"light" | "dark">("color-theme", "light");

  useEffect(() => {
    const className = "dark";
    const bodyClass = window.document.documentElement.classList;

    if (colorMode === "dark") {
      bodyClass.add(className);
    } else {
      bodyClass.remove(className);
    }
  }, [colorMode]);

  return [colorMode, setColorMode];
};

export default useColorMode;
