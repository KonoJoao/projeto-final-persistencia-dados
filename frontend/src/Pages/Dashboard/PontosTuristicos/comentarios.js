import React, { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Typography,
  Paper,
  Alert,
  Snackbar,
  Tooltip,
  Chip,
  Avatar,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Close, Delete } from "@mui/icons-material";
import { LoadingBox } from "../../../Components/Custom";
import { Modal } from "../../../Components/Modal";
import axios from "axios";

const API_URL = "http://localhost:3001/avaliacoes";

export default function ComentariosManager({ pontoId, pontoNome }) {
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedComentario, setSelectedComentario] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch comentários
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

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("authToken");
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

  const columns = [
    {
      field: "usuario",
      headerName: "Usuário",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => params.row.usuarioNome || "Usuário",
    },
    {
      field: "comentario",
      headerName: "Comentário",
      flex: 2,
      minWidth: 300,
      renderCell: (params) => params.value,
    },
    {
      field: "created_at",
      headerName: "Data",
      width: 180,
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
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Tooltip title="Excluir comentário" arrow>
          <IconButton
            size="small"
            onClick={() => handleOpenDeleteModal(params.row)}
          >
            <Close />
          </IconButton>
        </Tooltip>
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
          getRowId={(row) => row.id}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          disableRowSelectionOnClick
          autoHeight
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
          }}
        />
      </Paper>

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
              {selectedComentario.usuarioNome || "Desconhecido"}
            </Typography>
            <Typography variant="body2">
              {selectedComentario.comentario}
            </Typography>
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
