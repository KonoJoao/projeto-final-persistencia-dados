import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navigation/Navbar";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Manager from "./Pages/Manager";
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
        main: "#fff",
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
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/manager/:path" element={<Manager />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
