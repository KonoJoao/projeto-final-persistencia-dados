import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navigation/Navbar";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import DashboardPage from "./Pages/Dashboard";
import { createTheme, ThemeProvider } from "@mui/material";

export default function App() {
  const theme = createTheme({
    palette: {
      force: {
        main: "#012FE5",
      },
      primary: {
        main: "#0195F7",
      },
      success: {
        main: "#23C45D",
      },
      secondary: {
        main: "#333",
      },
      warning: {
        main: "#E57F01",
      },
      quaternary: {
        main: "#A755F7",
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login page="login" />} />
          <Route path="/logon" element={<Login page="logon" />} />
          <Route path="/dashboard/:path?/:id?" element={<DashboardPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
