import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import Sidebar from "../../Components/Navigation/Sidebar";
import AttractionsManager from "./Attractions";
import { Attractions, Dashboard } from "@mui/icons-material";

const routes = [
  {
    to: "/manager/dashboard",
    title: "Dashboard",
    icon: <Dashboard />,
  },
  {
    to: "/manager/attractions",
    title: "Pontos Turísticos",
    icon: <Attractions />,
  },
];

export default function Manager() {
  const { path } = useParams();
  const [page, setPage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!path || !pages[path]) {
      navigate("/manager/dashboard");
    } else {
      setPage(pages[path]);
    }
  }, [path]);

  const pages = {
    dashboard: <div>Dashboard em desenvolvimento</div>,
    attractions: <AttractionsManager />,
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar routes={routes} base="">
        {page || pages[path]}
      </Sidebar>
    </Box>
  );
}
