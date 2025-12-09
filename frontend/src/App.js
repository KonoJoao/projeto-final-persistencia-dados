import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Box, createTheme, ThemeProvider } from "@mui/material";
import { useState } from "react";
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
  const [userAccessType, setUserAccessType] = useState(
    localStorage.getItem("accessType") || "USER"
  );

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          {Object.entries(pages[userAccessType]).map(([path, element]) => {
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
          })}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
