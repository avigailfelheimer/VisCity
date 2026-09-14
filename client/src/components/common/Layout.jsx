import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import ScrollToTopButton from './ScrollToTopButton';

export default function Layout() {
  return (
    <div className="app-layout">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <ScrollToTopButton />
    </div>
  );
}
