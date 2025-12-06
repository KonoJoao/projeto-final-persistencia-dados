import React, { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Typography,
  Paper,
  Alert,
  Snackbar,
  Tooltip,
  Collapse,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Close, Reply, ExpandMore, ExpandLess } from "@mui/icons-material";
import { LoadingBox, CustomInput } from "../../../Components/Custom";
import { Modal } from "../../../Components/Modal";
import axios from "axios";

const API_URL = "http://localhost:3001/comentarios";

export default function ComentariosManager({ pontoId, pontoNome }) {
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openReplyModal, setOpenReplyModal] = useState(false);
  const [selectedComentario, setSelectedComentario] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (pontoId) {
      fetchComentarios();
    }
  }, [pontoId]);

  const fetchComentarios = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}?pontoId=${pontoId}`);
      setComentarios(response.data);
    } catch (error) {
      console.error("Erro ao buscar comentários:", error);
      showSnackbar("Erro ao carregar comentários", "error");
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

  const handleOpenDeleteModal = (comentario) => {
    setSelectedComentario(comentario);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedComentario(null);
  };

  const handleOpenReplyModal = (comentario) => {
    setSelectedComentario(comentario);
    setReplyText(comentario.resposta || "");
    setOpenReplyModal(true);
  };

  const handleCloseReplyModal = () => {
    setOpenReplyModal(false);
    setSelectedComentario(null);
    setReplyText("");
  };

  const handleToggleExpand = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/${selectedComentario._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      showSnackbar("Comentário excluído com sucesso!", "success");
      handleCloseDeleteModal();
      fetchComentarios();
    } catch (error) {
      console.error("Erro ao excluir comentário:", error);
      const message =
        error.response?.data?.message || "Erro ao excluir comentário";
      showSnackbar(message, "error");
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      showSnackbar("A resposta não pode estar vazia", "error");
      return;
    }

    try {
      setSubmittingReply(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/${selectedComentario._id}/respostas`,
        {
          texto: replyText.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showSnackbar("Resposta adicionada com sucesso!", "success");
      handleCloseReplyModal();
      fetchComentarios();
    } catch (error) {
      console.error("Erro ao adicionar resposta:", error);
      const message =
        error.response?.data?.message || "Erro ao adicionar resposta";
      showSnackbar(message, "error");
    } finally {
      setSubmittingReply(false);
    }
  };

  const columns = [
    {
      field: "expand",
      headerName: "",
      width: 50,
      sortable: false,
      filterable: false,
      renderCell: (params) =>
        params.row.respostas?.length > 0 ? (
          <IconButton
            size="small"
            onClick={() => handleToggleExpand(params.row._id)}
          >
            {expandedRows[params.row._id] ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        ) : null,
    },
    {
      field: "usuarioId",
      headerName: "Usuário",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => params.row.usuarioId || "Usuário Anônimo",
    },
    {
      field: "texto",
      headerName: "Comentário",
      flex: 2,
      minWidth: 250,
      renderCell: (params) => (
        <Box sx={{ width: "100%", py: 1 }}>
          <Typography variant="body2">{params.value}</Typography>
          {params.row.respostas?.length > 0 && (
            <Collapse in={expandedRows[params.row._id]}>
              <Box
                sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 1 }}
              >
                {params.row.respostas.map((resposta, index) => (
                  <Paper
                    key={index}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: "10px",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ display: "block", mb: 0.5 }}
                    >
                      Resposta {index + 1}:
                    </Typography>
                    <Typography variant="body2">{resposta.texto}</Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 0.5 }}
                    >
                      {new Date(resposta.data).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Collapse>
          )}
        </Box>
      ),
    },
    {
      field: "createdAt",
      headerName: "Data",
      width: 160,
      renderCell: (params) =>
        new Date(params.value).toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Responder comentário" arrow>
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleOpenReplyModal(params.row)}
            >
              <Reply fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir comentário" arrow>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleOpenDeleteModal(params.row)}
            >
              <Close fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (loading) {
    return <LoadingBox />;
  }

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{ border: "1px solid", borderColor: "grey.300" }}
      >
        <DataGrid
          rows={comentarios}
          columns={columns}
          getRowId={(row) => row._id}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          disableRowSelectionOnClick
          autoHeight
          getRowHeight={() => "auto"}
          localeText={{
            noRowsLabel: "Nenhum comentário encontrado",
            MuiTablePagination: {
              labelRowsPerPage: "Linhas por página:",
            },
            footerRowSelected: (count) => `${count} linha(s) selecionada(s)`,
          }}
          sx={{
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
            "& .MuiDataGrid-cell": {
              py: 1.5,
            },
          }}
        />
      </Paper>

      {/* Modal de Resposta */}
      <Modal
        open={openReplyModal}
        onClose={handleCloseReplyModal}
        maxWidth="sm"
        titulo="Responder Comentário"
        buttons={[
          {
            title: "Cancelar",
            variant: "outlined",
            action: handleCloseReplyModal,
            disabled: submittingReply,
          },
          {
            title: "Enviar Resposta",
            variant: "contained",
            action: handleReply,
            color: "primary",
            disabled: submittingReply,
          },
        ]}
      >
        {selectedComentario && (
          <>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                bgcolor: "grey.50",
                border: "1px solid",
                borderColor: "grey.300",
                borderRadius: 1,
              }}
            >
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Comentário de{" "}
                <strong>
                  {selectedComentario.usuarioId || "Usuário Anônimo"}
                </strong>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {selectedComentario.texto}
              </Typography>
              {selectedComentario.respostas?.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    gutterBottom
                  >
                    Respostas anteriores:
                  </Typography>
                  {selectedComentario.respostas.map((resposta, index) => (
                    <Paper
                      key={index}
                      elevation={0}
                      sx={{
                        p: 1,
                        mt: 1,
                        bgcolor: "grey.100",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="caption">
                        {resposta.texto}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </Paper>

            <CustomInput
              fullWidth
              multiline
              rows={4}
              label="Sua resposta"
              placeholder="Digite sua resposta ao comentário..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              helperText={`${replyText.length} caracteres`}
            />
          </>
        )}
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        maxWidth="sm"
        titulo="Confirmar Exclusão"
        buttons={[
          {
            title: "Cancelar",
            variant: "outlined",
            action: handleCloseDeleteModal,
            color: "secondary",
          },
          {
            title: "Excluir",
            variant: "contained",
            action: handleDelete,
            color: "error",
          },
        ]}
      >
        <Typography sx={{ mb: 2 }}>
          Tem certeza que deseja excluir este comentário?
        </Typography>
        {selectedComentario && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: "grey.50",
              border: "1px solid",
              borderColor: "grey.300",
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Usuário:</strong>{" "}
              {selectedComentario.usuarioId || "Anônimo"}
            </Typography>
            <Typography variant="body2">{selectedComentario.texto}</Typography>
          </Paper>
        )}
        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
          Esta ação não pode ser desfeita.
        </Typography>
      </Modal>

      {/* Snackbar para mensagens */}
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
    </Box>
  );
}
