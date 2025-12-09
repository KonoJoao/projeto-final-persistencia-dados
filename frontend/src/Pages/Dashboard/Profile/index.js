import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Grid,
  Chip,
  Alert,
} from "@mui/material";
import { Person, Email, Badge, CalendarToday } from "@mui/icons-material";
import { LoadingBox } from "../../../Components/Custom";
import axios from "axios";

const API_URL = "http://localhost:3001/users";

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserData(response.data);
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
      setError("Erro ao carregar dados do perfil");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: "500px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LoadingBox />{" "}
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Box>
      <Typography variant="h4">
        Bem-vindo de volta, {userData?.login || "Usuário"}! 👋
      </Typography>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        {/* Card Principal */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              textAlign: "center",
            }}
          >
            <Avatar
              sx={{
                width: 120,
                height: 120,
                margin: "0 auto",
                mb: 2,
                bgcolor: "primary.main",
                fontSize: "3rem",
              }}
            >
              {getInitials(userData?.login)}
            </Avatar>
            <Typography variant="body1" gutterBottom>
              Administrador
            </Typography>
          </Paper>
        </Grid>

        {/* Informações */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "grey.300",
              borderRadius: "10px",
            }}
          >
            <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
              Informações do Perfil
            </Typography>

            <Grid container spacing={3}>
              <Grid size={12}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Person color="action" />
                  <Box>
                    <Typography variant="body2">
                      Nome de Usuário
                      <Typography variant="body1" color="text.secondary">
                        {userData?.login || "Não informado"}
                      </Typography>
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={12}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Email color="action" />
                  <Box>
                    <Typography variant="body2">
                      E-mail{" "}
                      <Typography variant="body1" color="text.secondary">
                        {userData?.email || "Não informado"}
                      </Typography>
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={12}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Badge color="action" />
                  <Box>
                    <Typography variant="body1">
                      Tipo de Conta{" "}
                      <Typography variant="body1" color="text.secondary">
                        {userData?.tipo === "ADMIN"
                          ? "Administrador"
                          : "Usuário Padrão"}
                      </Typography>
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {userData?.created_at && (
                <Grid size={12}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <CalendarToday color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Membro desde
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {new Date(userData.created_at).toLocaleDateString(
                          "pt-BR",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
