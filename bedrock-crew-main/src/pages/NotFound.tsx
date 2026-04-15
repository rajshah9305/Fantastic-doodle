import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center animate-fade-in">
        <p className="text-8xl font-extrabold text-primary tracking-tight">404</p>
        <p className="mt-4 text-xl font-semibold text-black">Page not found</p>
        <p className="mt-2 text-sm text-black/45">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="inline-block mt-6 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-sm shadow-primary/30"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
