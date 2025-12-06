import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Box, createTheme, ThemeProvider } from "@mui/material";
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

const RouteWithNavbar = (path, element) => {
  const page = path.split("/")[1] || "home";

  return (
    <Route
      path={path}
      element={
        <>
          <Navbar page={page} />
          {element}
        </>
      }
    />
  );
};

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          {RouteWithNavbar("/", <Home />)}
          {RouteWithNavbar("/login", <Login page="login" />)}
          {RouteWithNavbar("/logon", <Login page="logon" />)}
          {RouteWithNavbar("/dashboard/:path?/:id?", <DashboardPage />)}
          {RouteWithNavbar("/comentarios/:id", <ComentariosPage />)}
          {RouteWithNavbar("*", <Home />)}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
