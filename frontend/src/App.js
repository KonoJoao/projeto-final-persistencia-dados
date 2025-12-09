import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Box, createTheme, ThemeProvider } from "@mui/material";
import { useState, useEffect } from "react";
import Navbar from "./Components/Navigation/Navbar";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import DashboardPage from "./Pages/Dashboard";
import ComentariosPage from "./Pages/Comentarios";

const theme = createTheme({
  palette: {
    force: { main: "#012FE5" },
    primary: { main: "#0195F7" },
    success: { main: "#23C45D" },
    secondary: { main: "#333" },
    warning: { main: "#E57F01" },
    quaternary: { main: "#A755F7" },
  },
});

const pages = {
  ADMIN: {
    "/": <Home />,
    "/login": <Login page="login" />,
    "/logon": <Login page="logon" />,
    "/dashboard/:path?/:id?": <DashboardPage />,
    "/comentarios/:id": <ComentariosPage />,
    "*": <Home />,
  },
  USER: {
    "/": <Home />,
    "/login": <Login page="login" />,
    "/logon": <Login page="logon" />,
    "*": <Home />,
  },
};

export default function App() {
  // state que controla quais páginas são usadas (atualiza ao logar/deslogar)
  const initialAccess = (localStorage.getItem("accessType") || "USER")
    .toString()
    .toUpperCase();
  const [userAccessType, setUserAccessType] = useState(initialAccess);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem("token");
    const access = (localStorage.getItem("accessType") || "").toString();
    return !!token && !!access;
  });

  // Atualiza state quando localStorage mudar (ou quando dispatcharmos 'authChanged')
  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem("token");
      const rawAccess = (localStorage.getItem("accessType") || "USER")
        .toString()
        .toUpperCase();
      setIsAuthenticated(!!token && !!rawAccess);
      setUserAccessType(rawAccess);
    };

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("authChanged", handleAuthChange);
    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("authChanged", handleAuthChange);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          {Object.entries(pages[userAccessType] || pages["USER"]).map(
            ([path, element]) => {
              const page = path.split("/")[1] || "home";
              return (
                <Route
                  key={path}
                  path={path}
                  element={
                    <>
                      <Navbar page={page} />
                      {element}
                    </>
                  }
                />
              );
            }
          )}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
