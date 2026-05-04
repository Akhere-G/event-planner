import { useEffect, useRef, useState } from "react";

export default function useMenu(props?: {
  startsOpen?: boolean;
  closeOnClick?: boolean;
}) {
  const { startsOpen = false, closeOnClick = false } = props ?? {};

  const [isMenuOpen, setIsMenuOpen] = useState(startsOpen);

  const menuContainerRef = useRef<HTMLDivElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        !openButtonRef.current?.contains(event.target as Node) &&
        (!menuContainerRef.current?.contains(event.target as Node) ||
          closeOnClick)
      ) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen)
      document.addEventListener("click", handleClickOutside, false);
    return () =>
      document.removeEventListener("click", handleClickOutside, false);
  }, [isMenuOpen, closeOnClick]);

  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return {
    isMenuOpen,
    setIsMenuOpen,
    menuContainerRef,
    openButtonRef,
    openMenu,
    closeMenu,
    toggleMenu,
  };
}
