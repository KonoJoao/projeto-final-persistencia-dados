import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Paper,
  Alert,
  Snackbar,
  Tooltip,
  Grid,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Add, Edit, Delete, Close } from "@mui/icons-material";
import {
  LoadingBox,
  CustomInput,
  CustomSelect,
} from "../../../Components/Custom";
import { Modal } from "../../../Components/Modal";
import axios from "axios";

const API_URL = "http://localhost:3001/hospedagens";

export default function HospedagensManager({ pontoId, pontoNome }) {
  const [hospedagens, setHospedagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedHospedagem, setSelectedHospedagem] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    endereco: "",
    telefone: "",
    preco_medio: "",
    tipo: "hotel",
    link_reserva: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const tiposHospedagem = [
    { value: "hotel", label: "Hotel" },
    { value: "pousada", label: "Pousada" },
    { value: "hostel", label: "Hostel" },
  ];

  useEffect(() => {
    if (pontoId) {
      fetchHospedagens();
    }
  }, [pontoId]);

  const fetchHospedagens = async () => {
    try {
      setLoading(true);
      const { data: response } = await axios.get(
        `${API_URL}?pontoId=${pontoId}`
      );
      setHospedagens(response.data);
    } catch (error) {
      console.error("Erro ao buscar hospedagens:", error);
      showSnackbar("Erro ao carregar hospedagens", "error");
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

  const resetForm = () => {
    setFormData({
      nome: "",
      endereco: "",
      telefone: "",
      preco_medio: "",
      tipo: "hotel",
      link_reserva: "",
    });
  };

  const handleOpenAddModal = () => {
    resetForm();
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
  };

  const handleOpenEditModal = (hospedagem) => {
    setSelectedHospedagem(hospedagem);
    setFormData({
      nome: hospedagem.nome,
      endereco: hospedagem.endereco || "",
      telefone: hospedagem.telefone || "",
      preco_medio: hospedagem.preco_medio || "",
      tipo: hospedagem.tipo || "hotel",
      link_reserva: hospedagem.link_reserva || "",
    });
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedHospedagem(null);
  };

  const handleOpenDeleteModal = (hospedagem) => {
    setSelectedHospedagem(hospedagem);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    if (!formData.nome.trim()) {
      showSnackbar("O nome é obrigatório", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        API_URL,
        {
          ponto_id: pontoId,
          nome: formData.nome,
          endereco: formData.endereco,
          telefone: formData.telefone,
          preco_medio: formData.preco_medio
            ? parseFloat(formData.preco_medio)
            : null,
          tipo: formData.tipo,
          link_reserva: formData.link_reserva,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showSnackbar("Hospedagem criada com sucesso!");
      handleCloseAddModal();
      fetchHospedagens();
    } catch (error) {
      console.error("Erro ao criar hospedagem:", error);
      const message =
        error.response?.data?.message || "Erro ao criar hospedagem";
      showSnackbar(message, "error");
    }
  };

  const handleUpdate = async () => {
    if (!formData.nome.trim()) {
      showSnackbar("O nome é obrigatório", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_URL}/${selectedHospedagem.id}`,
        {
          nome: formData.nome,
          endereco: formData.endereco,
          telefone: formData.telefone,
          preco_medio: formData.preco_medio
            ? parseFloat(formData.preco_medio)
            : null,
          tipo: formData.tipo,
          link_reserva: formData.link_reserva,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showSnackbar("Hospedagem atualizada com sucesso!");
      handleCloseEditModal();
      fetchHospedagens();
    } catch (error) {
      console.error("Erro ao atualizar hospedagem:", error);
      const message =
        error.response?.data?.message || "Erro ao atualizar hospedagem";
      showSnackbar(message, "error");
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/${selectedHospedagem.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      showSnackbar("Hospedagem excluída com sucesso!");
      handleCloseDeleteModal();
      fetchHospedagens();
    } catch (error) {
      console.error("Erro ao excluir hospedagem:", error);
      const message =
        error.response?.data?.message || "Erro ao excluir hospedagem";
      showSnackbar(message, "error");
    }
  };

  const columns = [
    { field: "nome", headerName: "Nome", flex: 1, minWidth: 200 },
    { field: "endereco", headerName: "Endereço", flex: 1, minWidth: 200 },
    { field: "telefone", headerName: "Telefone", width: 150 },
    {
      field: "tipo",
      headerName: "Tipo",
      width: 120,
      renderCell: (params) => params.value || "hotel",
    },
    {
      field: "preco_medio",
      headerName: "Preço Médio",
      width: 130,
      renderCell: (params) =>
        params.value ? `R$ ${parseFloat(params.value).toFixed(2)}` : "N/A",
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          <Tooltip title="Editar" arrow>
            <IconButton
              size="small"
              onClick={() => handleOpenEditModal(params.row)}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir" arrow>
            <IconButton
              size="small"
              onClick={() => handleOpenDeleteModal(params.row)}
            >
              <Close fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  if (loading) {
    return <LoadingBox />;
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Button
          disableElevation
          size="large"
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenAddModal}
        >
          Adicionar
        </Button>
      </Box>

      {/* DataGrid */}
      <Paper
        elevation={0}
        sx={{ border: "1px solid", borderColor: "grey.300" }}
      >
        <DataGrid
          rows={hospedagens}
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
            noRowsLabel: "Nenhuma hospedagem encontrada",
            MuiTablePagination: {
              labelRowsPerPage: "Linhas por página:",
            },
          }}
          sx={{
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
          }}
        />
      </Paper>

      {/* Modal Adicionar */}
      <Modal
        open={openAddModal}
        onClose={handleCloseAddModal}
        maxWidth="md"
        titulo="Adicionar Hospedagem"
        buttons={[
          {
            title: "Cancelar",
            variant: "outlined",
            action: handleCloseAddModal,
          },
          {
            title: "Salvar",
            variant: "contained",
            action: handleCreate,
          },
        ]}
      >
        <Grid container spacing={3}>
          <Grid size={12}>
            <CustomInput
              fullWidth
              label="Nome da Hospedagem"
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              required
            />
          </Grid>
          <Grid size={12}>
            <CustomInput
              fullWidth
              label="Endereço"
              value={formData.endereco}
              onChange={(e) => handleInputChange("endereco", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomInput
              fullWidth
              label="Telefone"
              value={formData.telefone}
              onChange={(e) => handleInputChange("telefone", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomSelect
              fullWidth
              label="Tipo de Hospedagem"
              value={formData.tipo}
              onChange={(e) => handleInputChange("tipo", e.target.value)}
              options={tiposHospedagem}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomInput
              fullWidth
              type="number"
              label="Preço Médio (R$)"
              value={formData.preco_medio}
              onChange={(e) => handleInputChange("preco_medio", e.target.value)}
              inputProps={{ step: "0.01", min: "0" }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomInput
              fullWidth
              label="Link de Reserva"
              value={formData.link_reserva}
              onChange={(e) =>
                handleInputChange("link_reserva", e.target.value)
              }
              placeholder="https://..."
            />
          </Grid>
        </Grid>
      </Modal>

      {/* Modal Editar */}
      <Modal
        open={openEditModal}
        onClose={handleCloseEditModal}
        maxWidth="md"
        titulo="Editar Hospedagem"
        buttons={[
          {
            title: "Cancelar",
            variant: "outlined",
            action: handleCloseEditModal,
          },
          {
            title: "Salvar",
            variant: "contained",
            action: handleUpdate,
          },
        ]}
      >
        <Grid container spacing={3}>
          <Grid size={12}>
            <CustomInput
              fullWidth
              label="Nome da Hospedagem"
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              required
            />
          </Grid>
          <Grid size={12}>
            <CustomInput
              fullWidth
              label="Endereço"
              value={formData.endereco}
              onChange={(e) => handleInputChange("endereco", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomInput
              fullWidth
              label="Telefone"
              value={formData.telefone}
              onChange={(e) => handleInputChange("telefone", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomSelect
              fullWidth
              label="Tipo de Hospedagem"
              value={formData.tipo}
              onChange={(e) => handleInputChange("tipo", e.target.value)}
              options={tiposHospedagem}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomInput
              fullWidth
              type="number"
              label="Preço Médio (R$)"
              value={formData.preco_medio}
              onChange={(e) => handleInputChange("preco_medio", e.target.value)}
              inputProps={{ step: "0.01", min: "0" }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomInput
              fullWidth
              label="Link de Reserva"
              value={formData.link_reserva}
              onChange={(e) =>
                handleInputChange("link_reserva", e.target.value)
              }
              placeholder="https://..."
            />
          </Grid>
        </Grid>
      </Modal>

      {/* Modal Excluir */}
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
          Tem certeza que deseja excluir esta hospedagem?
        </Typography>
        {selectedHospedagem && (
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
            <Typography variant="body2" fontWeight="600">
              {selectedHospedagem.nome}
            </Typography>
            {selectedHospedagem.endereco && (
              <Typography variant="body2" color="text.secondary">
                {selectedHospedagem.endereco}
              </Typography>
            )}
          </Paper>
        )}
      </Modal>

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
    </Box>
  );
}
