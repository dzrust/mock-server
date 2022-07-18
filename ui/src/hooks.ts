import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./store";
import { useEffect, useState } from "react";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useWindowHeightAndWidth = () => {
  const [windowHeight, setWindowHeight] = useState(() => window.innerHeight);
  const [windowWidth, setWindowWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const windowResizeEvent = () => {
      setWindowHeight(window.innerHeight);
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", windowResizeEvent);
    return () => {
      window.removeEventListener("resize", windowResizeEvent);
    };
  }, []);

  return { windowHeight, windowWidth };
};
