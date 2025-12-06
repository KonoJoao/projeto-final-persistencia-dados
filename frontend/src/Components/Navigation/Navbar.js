import { Search } from "@mui/icons-material";
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Stack,
  IconButton,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ page }) {
  const navigate = useNavigate();
  const pages = [
    { name: "Login", path: "/login" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Home", path: "/home" },
  ];

  return (
    <AppBar
      position={page === "home" ? "fixed" : "static"}
      elevation={0}
      sx={{
        color: "#000 !important",
        bgcolor: "#fff !important",
        zIndex: 999,
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ color: "inherit", textDecoration: "none" }}
        >
          Hospeda Nest
        </Typography>

        <Stack direction="row" spacing={2}>
          {pages
            .filter(({ name }) => name.toLowerCase() != page)
            .map((p, i) => (
              <Button
                key={p.name}
                variant={i == 1 ? "outlined" : "text"}
                sx={{
                  border: i == 1 ? "1.5px solid #333" : "text",
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
  );
}
