import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

export default function NotificationRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const notificationUrl = params.get("notificationUrl");

    if (!notificationUrl) {
      return;
    }

    // Remove the query parameter from the current history entry
    navigate("/home", { replace: true });

    // Push the actual destination as a new history entry
    const timer = window.setTimeout(() => {
      navigate(notificationUrl);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [location.search, navigate]);

  return null;
}
