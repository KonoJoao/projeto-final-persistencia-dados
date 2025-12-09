import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import Sidebar from "../../Components/Navigation/Sidebar";
import PontosTuristicos from "./PontosTuristicos";
import { Attractions, Dashboard } from "@mui/icons-material";
import Profile from "./Profile";

const routes = [
  {
    to: "",
    title: "Dashboard",
    icon: <Dashboard />,
  },
  {
    to: "/pontos-turisticos",
    title: "Pontos Turísticos",
    icon: <Attractions />,
  },
];

export default function DashboardPage() {
  const { path } = useParams();
  const [page, setPage] = useState(null);

  useEffect(() => {
    setPage(pages[path || ""]);
  }, [path]);

  const pages = {
    "": <Profile />,
    "pontos-turisticos": <PontosTuristicos />,
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar routes={routes} base="/dashboard">
        {page}
      </Sidebar>
    </Box>
  );
}
