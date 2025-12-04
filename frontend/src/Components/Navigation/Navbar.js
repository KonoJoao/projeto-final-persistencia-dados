import { Search } from "@mui/icons-material";
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Stack,
  IconButton,
} from "@mui/material";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ bgcolor: "transparent", color: "#000", zIndex: 999 }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ color: "inherit", textDecoration: "none" }}
        >
          TT
        </Typography>

        <Stack direction="horizontal" spacing={4}>
          <Button color="inherit">Login</Button>
          <Button color="inherit">Dashboard</Button>
          <IconButton>
            <Search />
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
