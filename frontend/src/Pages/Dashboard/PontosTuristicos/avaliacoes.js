import React, { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Typography,
  Paper,
  Alert,
  Snackbar,
  Tooltip,
  Rating,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Close, Star } from "@mui/icons-material";
import { LoadingBox } from "../../../Components/Custom";
import { Modal } from "../../../Components/Modal";
import axios from "axios";

const API_URL = "http://localhost:3001/avaliacoes";

export default function AvaliacoesManager({ pontoId, pontoNome }) {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedAvaliacao, setSelectedAvaliacao] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (pontoId) {
      fetchAvaliacoes();
    }
  }, [pontoId]);

  const fetchAvaliacoes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}?pontoId=${pontoId}`);
      setAvaliacoes(response.data);
    } catch (error) {
      console.error("Erro ao buscar avaliações:", error);
      showSnackbar("Erro ao carregar avaliações", "error");
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

  const handleOpenDeleteModal = (avaliacao) => {
    setSelectedAvaliacao(avaliacao);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/${selectedAvaliacao.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      showSnackbar("Avaliação excluída com sucesso!", "success");
      handleCloseDeleteModal();
      fetchAvaliacoes();
    } catch (error) {
      console.error("Erro ao excluir avaliação:", error);
      const message =
        error.response?.data?.message || "Erro ao excluir avaliação";
      showSnackbar(message, "error");
    }
  };

  const calcularMediaNotas = () => {
    if (avaliacoes.length === 0) return 0;
    const soma = avaliacoes.reduce((acc, av) => acc + (av.nota || 0), 0);
    return (soma / avaliacoes.length).toFixed(1);
  };

  const columns = [
    {
      field: "usuario",
      headerName: "Usuário",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => params.row.usuario?.login || "Usuário",
    },
    {
      field: "nota",
      headerName: "Avaliação",
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Rating value={params.value || 0} readOnly size="small" />
          <Typography variant="body2" fontWeight="600">
            ({params.value})
          </Typography>
        </Box>
      ),
    },
    {
      field: "comentario",
      headerName: "Comentário",
      flex: 2,
      minWidth: 300,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {params.value || "Sem comentário"}
        </Typography>
      ),
    },
    {
      field: "created_at",
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
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Tooltip title="Excluir avaliação" arrow>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleOpenDeleteModal(params.row)}
          >
            <Close fontSize="small" />
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
      {/* Estatísticas */}
      <Box sx={{ mb: 3, display: "flex", gap: 3, alignItems: "center" }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            border: "1px solid",
            borderColor: "grey.300",
            display: "flex",
            alignItems: "center",
            gap: 2,
            borderRadius: "10px",
          }}
        >
          <Star sx={{ fontSize: 40, color: "primary.main" }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {calcularMediaNotas()}{" "}
              <Typography variant="body2" color="text.secondary">
                Média de avaliações
              </Typography>
            </Typography>
          </Box>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            border: "1px solid",
            borderColor: "grey.300",
            borderRadius: "10px",
          }}
        >
          <Typography variant="h4" fontWeight="bold">
            {avaliacoes.length}{" "}
            <Typography variant="body2" color="text.secondary">
              Total de avaliações
            </Typography>
          </Typography>
        </Paper>
      </Box>

      {/* DataGrid */}
      <Paper
        elevation={0}
        sx={{ border: "1px solid", borderColor: "grey.300" }}
      >
        <DataGrid
          rows={avaliacoes}
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
          getRowHeight={() => "auto"}
          localeText={{
            noRowsLabel: "Nenhuma avaliação encontrada",
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
          Tem certeza que deseja excluir esta avaliação?
        </Typography>
        {selectedAvaliacao && (
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Usuário:</strong>{" "}
                {selectedAvaliacao.usuario?.login || "Desconhecido"}
              </Typography>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Rating
                value={selectedAvaliacao.nota || 0}
                readOnly
                size="small"
              />
            </Box>
            <Typography variant="body2">
              {selectedAvaliacao.comentario || "Sem comentário"}
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
