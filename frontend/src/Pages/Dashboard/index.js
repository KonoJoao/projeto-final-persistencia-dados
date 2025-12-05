import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import Sidebar from "../../Components/Navigation/Sidebar";
import PontosTuristicos from "./PontosTuristicos";
import { Attractions, Dashboard, Star } from "@mui/icons-material";
import ComentariosManager from "./PontosTuristicos/comentarios";

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
    "": <div>Dashboard em desenvolvimento</div>,
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
