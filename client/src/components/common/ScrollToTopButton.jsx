import { useEffect, useState } from 'react';
import '../../styles/components/scrollToTop.css';

const SHOW_AFTER_PX = 320;

/**
 * ScrollToTopButton – כפתור צף שמופיע אחרי גלילה ומחזיר לראש העמוד.
 */
export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      className="scroll-to-top"
      onClick={handleClick}
      aria-label="חזרה לראש העמוד"
      title="חזרה לראש העמוד"
    >
      ↑
    </button>
  );
}
