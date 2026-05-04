import { useEffect, useRef, useState } from "react";

export default function useMenu(props?: { startsOpen?: boolean }) {
  const { startsOpen = false } = props ?? {};

  const [isMenuOpen, setIsMenuOpen] = useState(startsOpen);

  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return {
    isMenuOpen,
    setIsMenuOpen,
    menuContainerRef,
    openMenu,
    closeMenu,
    toggleMenu,
  };
}
