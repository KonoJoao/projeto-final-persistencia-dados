import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Drawer,
  CssBaseline,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Container,
} from "@mui/material";

const drawerWidth = 240;

export default function Sidebar({ routes, children, base = "" }) {
  const navigate = useNavigate();
  const { path } = useParams();

  const [selected, setSelected] = useState("");

  useEffect(() => {
    const current = routes.find((r) => r.to.endsWith(`/${path}`));
    if (!current) return;

    setSelected(current.to || "");
  }, [path, routes]);

  const handleClick = (route) => {
    navigate(base + route.to);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <Drawer
        variant="permanent"
        sx={{
          zIndex: 998,
          width: drawerWidth,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            background: "#fafafaff",
            borderRight: "none",
          },
        }}
      >
        <Toolbar />

        <List>
          {routes.map((route) => (
            <ListItemButton
              sx={{
                m: 1,
                borderRadius: "10px",
                color: selected === route.to ? "#fff" : undefined,
              }}
              key={route.to}
              selected={selected === route.to}
              onClick={() => handleClick(route)}
            >
              <ListItemIcon
                sx={{ color: selected === route.to ? "#fff" : undefined }}
              >
                {route.icon}
              </ListItemIcon>
              <ListItemText primary={route.title} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: 3,
          width: `calc(100vw - ${drawerWidth + 16}px)`,
        }}
      >
        <Container maxWidth="md">{children} </Container>
      </Box>
    </Box>
  );
}
