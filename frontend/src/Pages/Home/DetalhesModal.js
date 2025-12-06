import React, { useState, memo } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardMedia,
  Rating,
  Avatar,
  Paper,
  Divider,
  Chip,
  Button,
  IconButton,
  Collapse,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Directions,
  Star,
  Comment,
  CalendarToday,
  Person,
  LocationOn,
  Send,
  Reply,
  ExpandMore,
  ExpandLess,
  Map,
} from "@mui/icons-material";
import { Modal } from "../../Components/Modal";
import { LoadingBox, CustomInput } from "../../Components/Custom";
import axios from "axios";

const FOTOS_API_URL = "http://localhost:3001/fotos";
const COMENTARIOS_API_URL = "http://localhost:3001/comentarios";

const DetalhesModal = memo(function DetalhesModal({
  open,
  onClose,
  ponto,
  detalhes,
  loading,
  onComentarioAdicionado,
}) {
  const [tabValue, setTabValue] = useState(0);
  const [novoComentario, setNovoComentario] = useState("");
  const [respostas, setRespostas] = useState({});
  const [expandedReplies, setExpandedReplies] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submittingResp, setSubmittingResp] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  if (!ponto) return null;

  const calcularMediaAvaliacoes = (avaliacoes) => {
    if (!avaliacoes || avaliacoes.length === 0) return 0;
    const soma = avaliacoes.reduce((acc, av) => acc + (av.nota || 0), 0);
    return (soma / avaliacoes.length).toFixed(1);
  };

  const handleToggleReply = (comentarioId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [comentarioId]: !prev[comentarioId],
    }));
  };

  const handleReplyChange = (comentarioId, value) => {
    setRespostas((prev) => ({
      ...prev,
      [comentarioId]: value,
    }));
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmitComentario = async () => {
    if (!novoComentario.trim()) {
      showSnackbar("Digite um comentário", "warning");
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
        COMENTARIOS_API_URL,
        {
          pontoId: ponto.id,
          texto: novoComentario.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showSnackbar("Comentário enviado com sucesso!", "success");
      setNovoComentario("");
      if (onComentarioAdicionado) {
        onComentarioAdicionado();
      }
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
      const message =
        error.response?.data?.message || "Erro ao enviar comentário";
      showSnackbar(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitResposta = async (comentarioId) => {
    const respostaTexto = respostas[comentarioId];
    if (!respostaTexto?.trim()) {
      showSnackbar("Digite uma resposta", "warning");
      return;
    }

    try {
      setSubmittingResp(true);
      const token = localStorage.getItem("token");

      if (!token) {
        showSnackbar("Você precisa estar autenticado para responder", "error");
        return;
      }

      await axios.post(
        `${COMENTARIOS_API_URL}/${comentarioId}/respostas`,
        {
          texto: respostaTexto.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showSnackbar("Resposta enviada com sucesso!", "success");
      setRespostas((prev) => ({ ...prev, [comentarioId]: "" }));
      setExpandedReplies((prev) => ({ ...prev, [comentarioId]: false }));

      if (onComentarioAdicionado) {
        onComentarioAdicionado();
      }
    } catch (error) {
      console.error("Erro ao enviar resposta:", error);
      const message =
        error.response?.data?.message || "Erro ao enviar resposta";
      showSnackbar(message, "error");
    } finally {
      setSubmittingResp(false);
    }
  };

  const handleOpenMaps = () => {
    if (ponto.latitude && ponto.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${ponto.latitude},${ponto.longitude}`;
      window.open(url, "_blank");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidth="lg"
      titulo={ponto.nome}
      buttons={[
        {
          title: "Fechar",
          variant: "contained",
          action: onClose,
        },
      ]}
    >
      {loading ? (
        <LoadingBox />
      ) : (
        <Box>
          {/* Informações Básicas */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <LocationOn color="action" />
              <Typography variant="h6">
                {ponto.cidade}, {ponto.estado} - {ponto.pais}
              </Typography>
            </Box>
            {ponto.descricao && (
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {ponto.descricao}
              </Typography>
            )}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Rating
                value={parseFloat(calcularMediaAvaliacoes(detalhes.avaliacoes))}
                precision={0.1}
                readOnly
                size="large"
              />
              <Typography variant="h6" fontWeight="bold">
                {calcularMediaAvaliacoes(detalhes.avaliacoes)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ({detalhes.avaliacoes?.length || 0} avaliações)
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Tabs */}
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Como Chegar" />
            <Tab label={`Fotos (${detalhes.fotos?.length || 0})`} />
            <Tab label={`Avaliações (${detalhes.avaliacoes?.length || 0})`} />
            <Tab label={`Comentários (${detalhes.comentarios?.length || 0})`} />
          </Tabs>

          {/* Tab 0: Como Chegar */}
          {tabValue === 0 && (
            <Box>
              <Typography
                variant="h6"
                sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
              >
                <Directions color="primary" />
                Como Chegar
              </Typography>
              <Paper
                elevation={0}
                sx={{ p: 3, border: "1px solid", borderColor: "grey.300" }}
              >
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Endereço:
                    </Typography>
                    <Typography variant="body1" fontWeight="500">
                      {ponto.endereco || "Endereço não informado"}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Latitude:
                    </Typography>
                    <Typography variant="body1">
                      {ponto.latitude || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Longitude:
                    </Typography>
                    <Typography variant="body1">
                      {ponto.longitude || "N/A"}
                    </Typography>
                  </Grid>
                  {ponto.latitude && ponto.longitude && (
                    <Grid size={12}>
                      <Button
                        disableElevation
                        variant="contained"
                        startIcon={<Map />}
                        onClick={handleOpenMaps}
                        sx={{ mt: 2 }}
                      >
                        Abrir no Google Maps
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Box>
          )}

          {/* Tab 1: Fotos */}
          {tabValue === 1 && (
            <Box>
              {detalhes.fotos?.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    border: "1px solid",
                    borderColor: "grey.300",
                  }}
                >
                  <Typography color="text.secondary">
                    Nenhuma foto disponível
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={2}>
                  {detalhes.fotos?.map((foto) => {
                    const fotoId = foto._id || foto.id;
                    return (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={fotoId}>
                        <Card
                          elevation={0}
                          sx={{ border: "1px solid", borderColor: "grey.300" }}
                        >
                          <CardMedia
                            component="img"
                            height="200"
                            image={`${FOTOS_API_URL}/${fotoId}/download`}
                            alt={foto.titulo || "Foto"}
                            sx={{ objectFit: "cover" }}
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          )}

          {/* Tab 2: Avaliações */}
          {tabValue === 2 && (
            <Box>
              {detalhes.avaliacoes?.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    border: "1px solid",
                    borderColor: "grey.300",
                  }}
                >
                  <Typography color="text.secondary">
                    Nenhuma avaliação ainda
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {detalhes.avaliacoes?.map((avaliacao) => (
                    <Card
                      key={avaliacao.id}
                      elevation={0}
                      sx={{
                        border: "1px solid",
                        borderRadius: "10px",
                        borderColor: "grey.300",
                      }}
                    >
                      <Box sx={{ p: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 1,
                          }}
                        >
                          <Avatar sx={{ bgcolor: "primary.main" }}>
                            {avaliacao.usuario?.login?.[0]?.toUpperCase() || (
                              <Person />
                            )}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="600">
                              {avaliacao.usuario?.login || "Usuário"}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Rating
                                value={avaliacao.nota || 0}
                                size="small"
                                readOnly
                              />
                            </Box>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <CalendarToday
                              sx={{ fontSize: 14, color: "text.secondary" }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {new Date(
                                avaliacao.created_at
                              ).toLocaleDateString("pt-BR")}
                            </Typography>
                          </Box>
                        </Box>
                        {avaliacao.comentario && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {avaliacao.comentario}
                          </Typography>
                        )}
                      </Box>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {/* Tab 3: Comentários */}
          {tabValue === 3 && (
            <Grid container spacing={2}>
              <Grid size={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 3,
                    border: "1px solid",
                    borderColor: "grey.300",
                    borderRadius: "10px",
                  }}
                >
                  <CustomInput
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Escreva seu comentário..."
                    value={novoComentario}
                    onChange={(e) => setNovoComentario(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    size="large"
                    disableElevation
                    variant="contained"
                    endIcon={<Send />}
                    onClick={handleSubmitComentario}
                    disabled={submitting || !novoComentario.trim()}
                  >
                    {submitting ? "Enviando..." : "Enviar Comentário"}
                  </Button>
                </Paper>
              </Grid>
              <Grid size={6}>
                {/* Lista de Comentários */}
                {detalhes.comentarios?.length === 0 ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      textAlign: "center",
                      border: "1px solid",
                      borderColor: "grey.300",
                    }}
                  >
                    <Typography color="text.secondary">
                      Nenhum comentário ainda. Seja o primeiro a comentar!
                    </Typography>
                  </Paper>
                ) : (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {detalhes.comentarios?.map((comentario) => (
                      <Card
                        key={comentario._id}
                        elevation={0}
                        sx={{
                          border: "1px solid",
                          borderRadius: "10px",
                          borderColor: "grey.300",
                        }}
                      >
                        <Box sx={{ p: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 2,
                            }}
                          >
                            <Avatar sx={{ bgcolor: "primary.main" }}>
                              {comentario.usuarioId?.[0]?.toUpperCase() || (
                                <Person />
                              )}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mb: 0.5,
                                }}
                              >
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="600"
                                >
                                  {comentario.usuarioId || "Usuário Anônimo"}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  ·{" "}
                                  {new Date(
                                    comentario.createdAt
                                  ).toLocaleDateString("pt-BR")}
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                {comentario.texto}
                              </Typography>

                              {/* Respostas existentes */}
                              {comentario.respostas?.length > 0 && (
                                <Box
                                  sx={{
                                    mt: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1,
                                  }}
                                >
                                  {comentario.respostas.map(
                                    (resposta, index) => (
                                      <Paper
                                        key={index}
                                        elevation={0}
                                        sx={{
                                          p: 2,
                                          borderLeft: "1px solid #bdbdbdff",
                                          borderRadius: 0,
                                        }}
                                      >
                                        <Typography
                                          variant="body1"
                                          sx={{ display: "block", mb: 0.5 }}
                                        >
                                          {resposta.usuarioId}
                                          <Typography variant="body2">
                                            {resposta.texto}
                                          </Typography>
                                        </Typography>

                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          sx={{ display: "block", mt: 0.5 }}
                                        >
                                          {new Date(
                                            resposta.data
                                          ).toLocaleDateString("pt-BR")}
                                        </Typography>
                                      </Paper>
                                    )
                                  )}
                                </Box>
                              )}

                              {/* Botão para Responder */}
                              <Button
                                disableElevation
                                size="small"
                                startIcon={
                                  expandedReplies[comentario._id] ? (
                                    <ExpandLess />
                                  ) : (
                                    <Reply />
                                  )
                                }
                                onClick={() =>
                                  handleToggleReply(comentario._id)
                                }
                                sx={{ mt: 1 }}
                              >
                                {expandedReplies[comentario._id]
                                  ? "Cancelar"
                                  : "Responder todos"}
                              </Button>

                              {/* Formulário de Resposta */}
                              <Collapse
                                in={expandedReplies[comentario._id]}
                                timeout="auto"
                                unmountOnExit
                              >
                                <Box
                                  sx={{
                                    mt: 2,
                                    pl: 2,
                                    borderLeft: "2px solid",
                                    borderColor: "grey.300",
                                  }}
                                >
                                  <CustomInput
                                    fullWidth
                                    multiline
                                    rows={3}
                                    placeholder="Escreva sua resposta..."
                                    value={respostas[comentario._id] || ""}
                                    onChange={(e) =>
                                      handleReplyChange(
                                        comentario._id,
                                        e.target.value
                                      )
                                    }
                                    sx={{ mb: 1 }}
                                  />
                                  <Button
                                    disableElevation
                                    size="small"
                                    variant="contained"
                                    endIcon={<Send />}
                                    onClick={() =>
                                      handleSubmitResposta(comentario._id)
                                    }
                                    disabled={
                                      submittingResp ||
                                      !respostas[comentario._id]?.trim()
                                    }
                                  >
                                    {submittingResp
                                      ? "Enviando..."
                                      : "Enviar Resposta"}
                                  </Button>
                                </Box>
                              </Collapse>
                            </Box>
                          </Box>
                        </Box>
                      </Card>
                    ))}
                  </Box>
                )}
              </Grid>
            </Grid>
          )}
        </Box>
      )}

      {/* Snackbar para mensagens */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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
    </Modal>
  );
});

export default DetalhesModal;
