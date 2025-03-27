import { Suspense, useState, useEffect } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import LandingPage from "./components/dashboard/LandingPage";
import POSSystem from "./components/dashboard/POSSystem";
import KitchenDisplay from "./components/dashboard/KitchenDisplay";
import Login from "./components/dashboard/Login";
import CDSLogin from "./components/dashboard/CDSLogin";
import CDSInterface from "./components/dashboard/CDSInterface";
import routes from "tempo-routes";
import { supabase } from "./lib/supabase";

function App() {
  const [cdsDevice, setCdsDevice] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        setIsAuthenticated(!!data.session);

        // Store user info in localStorage if available
        if (data.session?.user) {
          if (data.session.user.id) {
            localStorage.setItem("userId", data.session.user.id);
          }
          if (data.session.user.email) {
            localStorage.setItem("userEmail", data.session.user.email);
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        // In preview mode, consider the user authenticated
        if (import.meta.env.VITE_TEMPO === "true") {
          setIsAuthenticated(true);
          // Set demo user data for preview
          localStorage.setItem("userName", "Demo User");
          localStorage.setItem("userEmail", "demo@example.com");
          localStorage.setItem("userId", "demo-user-id");
        } else {
          setIsAuthenticated(false);
        }
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, !!session);
        setIsAuthenticated(!!session);

        // Update localStorage on login/signup
        if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          if (session?.user) {
            if (session.user.id) {
              localStorage.setItem("userId", session.user.id);
            }
            if (session.user.email) {
              localStorage.setItem("userEmail", session.user.email);
              const name = session.user.email.split("@")[0];
              localStorage.setItem("userName", name);
            }
          }
        }

        // Clear localStorage on logout
        if (event === "SIGNED_OUT") {
          localStorage.removeItem("userId");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("userName");
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleCDSLogin = (deviceId: string, deviceName: string) => {
    setCdsDevice({ id: deviceId, name: deviceName });
  };

  // Redirect to landing page when app first loads
  useEffect(() => {
    // Always redirect to landing page when accessing the root URL
    if (window.location.pathname === "/" && !import.meta.env.VITE_TEMPO) {
      // Redirect to landing page
      window.location.href = "/landing";
    }
  }, []);

  // Skip authentication check in preview mode or after 5 seconds to prevent infinite loading
  const [authTimeout, setAuthTimeout] = useState(false);

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timer = setTimeout(() => {
      if (isAuthenticated === null) {
        console.warn(
          "Authentication check timed out, proceeding as authenticated",
        );
        setAuthTimeout(true);
        setIsAuthenticated(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  if (
    isAuthenticated === null &&
    !authTimeout &&
    import.meta.env.VITE_TEMPO !== "true"
  ) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          Loading...
        </div>
      }
    >
      <>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route
            path="/"
            element={
              isAuthenticated || import.meta.env.VITE_TEMPO === "true" ? (
                <Home />
              ) : (
                <Navigate to="/landing" />
              )
            }
          />
          <Route
            path="/pos-terminal"
            element={
              isAuthenticated ? (
                <POSSystem menuItems={[]} />
              ) : (
                <Navigate to="/login" state={{ destination: "pos" }} />
              )
            }
          />
          <Route
            path="/kitchen-display"
            element={
              isAuthenticated ? (
                <KitchenDisplay />
              ) : (
                <Navigate to="/login" state={{ destination: "kitchen" }} />
              )
            }
          />
          <Route path="/login" element={<Login />} />
          <Route
            path="/cds-login"
            element={<CDSLogin onLogin={handleCDSLogin} />}
          />
          <Route
            path="/cds-interface"
            element={
              cdsDevice ? (
                <CDSInterface
                  deviceId={cdsDevice.id}
                  deviceName={cdsDevice.name}
                />
              ) : (
                <Navigate to="/cds-login" />
              )
            }
          />
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" />
          )}
        </Routes>
      </>
    </Suspense>
  );
}

export default App;
