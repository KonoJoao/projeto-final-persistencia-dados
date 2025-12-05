import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Rating,
  Alert,
  Snackbar,
  Avatar,
  Card,
  CardContent,
  IconButton,
  Grid,
} from "@mui/material";
import {
  ArrowBack,
  Send,
  Star,
  Person,
  CalendarToday,
} from "@mui/icons-material";
import { LoadingBox, CustomInput } from "../../Components/Custom";
import axios from "axios";

const API_URL = "http://localhost:3001/avaliacoes";
const PONTOS_API_URL = "http://localhost:3001/pontos-turisticos";

export default function ComentariosPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pontoTuristico, setPontoTuristico] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    comentario: "",
    nota: 0,
  });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pontoResponse, comentariosResponse] = await Promise.all([
        axios.get(`${PONTOS_API_URL}/${id}`),
        axios.get(`${API_URL}?pontoId=${id}`),
      ]);
      setPontoTuristico(pontoResponse.data);
      setComentarios(comentariosResponse.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      showSnackbar("Erro ao carregar dados", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.comentario.trim()) {
      newErrors.comentario = "O comentário é obrigatório";
    } else if (formData.comentario.trim().length < 10) {
      newErrors.comentario = "O comentário deve ter pelo menos 10 caracteres";
    }

    if (!formData.nota || formData.nota < 1 || formData.nota > 5) {
      newErrors.nota = "A avaliação deve ser entre 1 e 5 estrelas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");

      if (!token) {
        showSnackbar("Você precisa estar autenticado para comentar", "error");
        return;
      }

      await axios.post(
        API_URL,
        {
          ponto_id: id,
          comentario: formData.comentario.trim(),
          nota: formData.nota,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showSnackbar("Comentário cadastrado com sucesso!", "success");
      setFormData({ comentario: "", nota: 5 });
      fetchData();
    } catch (error) {
      console.error("Erro ao cadastrar comentário:", error);
      const message =
        error.response?.data?.message || "Erro ao cadastrar comentário";
      showSnackbar(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const calcularMediaNotas = () => {
    if (comentarios.length === 0) return 0;
    const soma = comentarios.reduce((acc, c) => acc + (c.nota || 0), 0);
    return (soma / comentarios.length).toFixed(1);
  };

  if (loading) {
    return <LoadingBox />;
  }

  if (!pontoTuristico) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Ponto turístico não encontrado</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Header - Full Width */}
        <Grid size={12}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              {pontoTuristico.nome}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                mb: 2,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {" "}
                <Typography variant="h6" fontWeight="bold">
                  {calcularMediaNotas()}
                </Typography>
                <Rating
                  value={parseFloat(calcularMediaNotas())}
                  precision={0.1}
                  readOnly
                  size="large"
                />
              </Box>
              <Typography variant="body1" color="text.secondary">
                {comentarios.length}{" "}
                {comentarios.length === 1 ? "avaliação" : "avaliações"}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Formulário de Novo Comentário - Sidebar em telas grandes */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "grey.300",
              borderRadius: "10px",
            }}
          >
            <Typography variant="h6" gutterBottom fontWeight="medium">
              Deixe sua avaliação
            </Typography>
            <Box sx={{ height: 1, bgcolor: "grey.300", my: 2 }} />
            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <Rating
                  value={formData.nota}
                  onChange={(event, newValue) => handleChange("nota", newValue)}
                  size="large"
                />
                {errors.nota && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ display: "block", mt: 1 }}
                  >
                    {errors.nota}
                  </Typography>
                )}
              </Box>

              <CustomInput
                fullWidth
                multiline
                rows={6}
                placeholder="Conte sua experiência neste lugar..."
                value={formData.comentario}
                onChange={(e) => handleChange("comentario", e.target.value)}
                sx={{ mb: 3 }}
              />
              <Typography
                sx={{
                  display: "flex",
                  justifyContent: "end",
                  alignItems: "center",
                }}
              >
                {" "}
                <Button
                  disableElevation
                  type="submit"
                  variant="text"
                  size="large"
                  disabled={submitting}
                  sx={{ px: 4 }}
                >
                  {submitting ? "Enviando..." : "Enviar Avaliação"}
                </Button>
              </Typography>
            </form>
          </Paper>
        </Grid>

        {/* Lista de Comentários - Área principal */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Box>
            {comentarios.length === 0 ? (
              <Paper
                elevation={0}
                className="show-box"
                sx={{
                  p: 6,
                  textAlign: "center",
                }}
              >
                <Typography variant="h6">Nenhuma avaliação ainda</Typography>
              </Paper>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {comentarios.map((comentario) => (
                  <Card
                    key={comentario.id}
                    elevation={0}
                    sx={{
                      borderRadius: "10px",
                      transition: "all 0.2s",
                      border: "1px solid",
                      borderColor: "grey.300",
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          alignItems: "flex-start",
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: "primary.main",
                            width: 48,
                            height: 48,
                            fontSize: "1.25rem",
                            flexShrink: 0,
                          }}
                        >
                          {comentario.usuario?.login?.[0]?.toUpperCase() || (
                            <Person />
                          )}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body1">
                            {comentario.usuario?.login || "Usuário"}
                            <Typography variant="body2" color="text.secondary">
                              {new Date(
                                comentario.created_at
                              ).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Typography>
                            <Rating
                              value={comentario.nota || 5}
                              readOnly
                              size="small"
                              sx={{ ml: "-3px" }}
                            />{" "}
                            <Typography variant="body1" sx={{}}>
                              {comentario.comentario}
                            </Typography>
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
