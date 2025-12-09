import { Search } from "@mui/icons-material";
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Stack,
  IconButton,
  Box,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../Assets/All/logo.png";

export default function Navbar({ page }) {
  const navigate = useNavigate();
  const pages =
    {
      USER: [{ name: "Home", path: "/home" }],
      ADMIN: [
        { name: "Dashboard", path: "/dashboard" },
        { name: "Home", path: "/home" },
      ],
    }[localStorage.getItem("accessType") || "USER"] || [];

  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <>
      <AppBar
        position={"fixed"}
        elevation={0}
        sx={{
          color: "#000 !important",
          bgcolor: "#fff !important",
          zIndex: 999,
          borderBottom: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ color: "inherit", textDecoration: "none" }}
          >
            <img
              src={Logo}
              style={{
                height: "38px",
                marginLeft: "-36px",
                marginTop: "10px",
              }}
            />
          </Typography>

          <Stack direction="row" spacing={1}>
            {isLoggedIn && (
              <Button
                variant="text"
                color="inherit"
                onClick={() => {
                  localStorage.clear();
                  navigate("/login");
                }}
              >
                Sair
              </Button>
            )}
            {pages
              .filter(({ name }) => {
                if (name === "Login" && isLoggedIn) return false;
                return name.toLowerCase() !== page;
              })
              .reverse()
              .map((p, i) => (
                <Button
                  key={p.name}
                  variant={i == 0 ? "outlined" : "text"}
                  sx={{
                    border: i == 0 ? "1.5px solid #333" : "text",
                  }}
                  color="inherit"
                  onClick={() => navigate(p.path)}
                >
                  {p.name}
                </Button>
              ))}
            <IconButton color="inherit">
              <Search />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>
      <Box sx={{ height: "80px", width: "100%" }}></Box>
    </>
  );
}
