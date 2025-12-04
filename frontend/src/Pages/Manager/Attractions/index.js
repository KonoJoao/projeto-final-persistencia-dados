import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Paper,
  Alert,
  Snackbar,
  Grid,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Edit, Delete, PhotoCamera, Add } from "@mui/icons-material";
import { CustomInput, LoadingBox } from "../../../Components/Custom";
import { Modal } from "../../../Components/Modal";
import axios from "axios";

const API_URL = "http://localhost:3001/pontos-turisticos";

export default function AttractionsManager() {
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPhotoModal, setOpenPhotoModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    cidade: "",
    estado: "",
    pais: "Brasil",
    latitude: "",
    longitude: "",
    endereco: "",
  });

  // Fetch attractions
  useEffect(() => {
    fetchAttractions();
  }, []);

  const fetchAttractions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setAttractions(response.data);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Erro ao carregar pontos turísticos";
      showSnackbar("Erro ao carregar pontos turísticos: " + message, "error");
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

  // Handlers para modais
  const handleOpenPhotoModal = (attraction) => {
    setSelectedAttraction(attraction);
    setOpenPhotoModal(true);
  };
  const handleClosePhotoModal = () => setOpenPhotoModal(false);

  const handleOpenEditModal = (attraction) => {
    setSelectedAttraction(attraction);
    setFormData({
      nome: attraction.nome,
      descricao: attraction.descricao,
      cidade: attraction.cidade,
      estado: attraction.estado,
      pais: attraction.pais,
      latitude: attraction.latitude,
      longitude: attraction.longitude,
      endereco: attraction.endereco,
    });
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    resetForm();
  };

  const handleOpenAddModal = () => {
    resetForm();
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
    resetForm();
  };

  const handleOpenDeleteModal = (attraction) => {
    setSelectedAttraction(attraction);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedAttraction(null);
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      descricao: "",
      cidade: "",
      estado: "",
      pais: "Brasil",
      latitude: "",
      longitude: "",
      endereco: "",
    });
  };

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // CRUD Operations
  const handleCreate = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
      };
      await axios.post(API_URL, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchAttractions();
      showSnackbar("Ponto turístico criado com sucesso!");
      handleCloseAddModal();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Erro ao criar ponto turístico";
      showSnackbar("Erro ao criar ponto turístico: " + message, "error");
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
      };
      await axios.patch(`${API_URL}/${selectedAttraction.id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchAttractions();
      showSnackbar("Ponto turístico atualizado com sucesso!");
      handleCloseEditModal();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Erro ao atualizar ponto turístico";
      showSnackbar("Erro ao atualizar ponto turístico: " + message, "error");
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/${selectedAttraction.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchAttractions();
      showSnackbar("Ponto turístico deletado com sucesso!");
      handleCloseDeleteModal();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Erro ao deletar ponto turístico";
      showSnackbar("Erro ao deletar ponto turístico: " + message, "error");
    }
  };

  // DataGrid columns
  const columns = [
    { field: "nome", headerName: "Nome", flex: 1, minWidth: 200 },
    {
      field: "cidadeEstado",
      headerName: "Cidade/Estado",
      flex: 1,
      minWidth: 150,
      valueGetter: (value, row) => `${row.cidade}/${row.estado}`,
    },
    {
      field: "descricao",
      headerName: "Descrição",
      flex: 2,
      minWidth: 250,
      renderCell: (params) => params.row.descricao?.substring(0, 100) + "...",
    },
    {
      field: "acoes",
      headerName: "Ações",
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => handleOpenPhotoModal(params.row)}
            title="Fotos"
            color="primary"
            size="small"
          >
            <PhotoCamera />
          </IconButton>
          <IconButton
            onClick={() => handleOpenEditModal(params.row)}
            title="Editar"
            color="primary"
            size="small"
          >
            <Edit />
          </IconButton>
          <IconButton
            onClick={() => handleOpenDeleteModal(params.row)}
            title="Excluir"
            color="error"
            size="small"
          >
            <Delete />
          </IconButton>
        </Box>
      ),
    },
  ];

  // Filter attractions
  const filteredAttractions = attractions.filter((attraction) => {
    const matchesSearch = attraction.nome
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCity =
      filterCity === "" ||
      attraction.cidade.toLowerCase().includes(filterCity.toLowerCase());
    return matchesSearch && matchesCity;
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Filtros */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", gap: 2 }}>
          <CustomInput
            placeholder="Buscar por nome"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flex: 1 }}
          />
          <CustomInput
            placeholder="Filtrar por cidade"
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            sx={{ flex: 1 }}
          />
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          size="large"
          onClick={handleOpenAddModal}
          disableElevation
        >
          Cadastrar Ponto
        </Button>
      </Box>

      {/* DataGrid */}
      <Paper sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={filteredAttractions}
          columns={columns}
          loading={loading}
          pageSizeOptions={[5, 10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
          localeText={{
            noRowsLabel: "Nenhum ponto turístico encontrado",
            footerRowSelected: (count) => `${count} linha(s) selecionada(s)`,
          }}
          sx={{
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
          }}
        />
      </Paper>

      {/* Modal de Fotos */}
      <Modal
        open={openPhotoModal}
        onClose={handleClosePhotoModal}
        maxWidth="sm"
        titulo="Fotos do Ponto Turístico"
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Fotos de {selectedAttraction?.nome}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Funcionalidade de upload de fotos em desenvolvimento...
        </Typography>
      </Modal>

      {/* Modal de Edição */}
      <Modal
        open={openEditModal}
        onClose={handleCloseEditModal}
        maxWidth="md"
        titulo="Editar Ponto Turístico"
        buttons={[
          {
            title: "Cancelar",
            variant: "outlined",
            action: handleCloseEditModal,
            color: "secondary",
          },
          {
            title: "Salvar",
            variant: "contained",
            action: handleUpdate,
            color: "primary",
          },
        ]}
      >
        <Grid container spacing={4} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <CustomInput
              fullWidth
              label="Nome"
              value={formData.nome}
              onChange={handleInputChange("nome")}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CustomInput
              fullWidth
              label="Cidade"
              value={formData.cidade}
              onChange={handleInputChange("cidade")}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CustomInput
              fullWidth
              label="Estado"
              value={formData.estado}
              onChange={handleInputChange("estado")}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CustomInput
              fullWidth
              label="País"
              value={formData.pais}
              onChange={handleInputChange("pais")}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CustomInput
              fullWidth
              label="Latitude"
              type="number"
              value={formData.latitude}
              onChange={handleInputChange("latitude")}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CustomInput
              fullWidth
              label="Longitude"
              type="number"
              value={formData.longitude}
              onChange={handleInputChange("longitude")}
            />
          </Grid>
          <Grid size={12}>
            <CustomInput
              fullWidth
              label="Endereço"
              value={formData.endereco}
              onChange={handleInputChange("endereco")}
            />
          </Grid>
          <Grid size={12}>
            <CustomInput
              fullWidth
              label="Descrição"
              value={formData.descricao}
              onChange={handleInputChange("descricao")}
              multiline
              minRows={3}
            />
          </Grid>
        </Grid>
      </Modal>

      {/* Modal de Cadastro */}
      <Modal
        open={openAddModal}
        onClose={handleCloseAddModal}
        maxWidth="md"
        titulo="Cadastrar Novo Ponto Turístico"
        buttons={[
          {
            title: "Cancelar",
            variant: "outlined",
            action: handleCloseAddModal,
            color: "secondary",
          },
          {
            title: "Cadastrar",
            variant: "contained",
            action: handleCreate,
            color: "primary",
          },
        ]}
      >
        <Grid container spacing={4} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <CustomInput
              fullWidth
              label="Nome"
              value={formData.nome}
              onChange={handleInputChange("nome")}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CustomInput
              fullWidth
              label="Cidade"
              value={formData.cidade}
              onChange={handleInputChange("cidade")}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CustomInput
              fullWidth
              label="Estado"
              value={formData.estado}
              onChange={handleInputChange("estado")}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CustomInput
              fullWidth
              label="País"
              value={formData.pais}
              onChange={handleInputChange("pais")}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CustomInput
              fullWidth
              label="Latitude"
              type="number"
              value={formData.latitude}
              onChange={handleInputChange("latitude")}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CustomInput
              fullWidth
              label="Longitude"
              type="number"
              value={formData.longitude}
              onChange={handleInputChange("longitude")}
            />
          </Grid>
          <Grid size={12}>
            <CustomInput
              fullWidth
              label="Endereço"
              value={formData.endereco}
              onChange={handleInputChange("endereco")}
            />
          </Grid>
          <Grid size={12}>
            <CustomInput
              fullWidth
              label="Descrição"
              value={formData.descricao}
              onChange={handleInputChange("descricao")}
              multiline
              minRows={3}
            />
          </Grid>
        </Grid>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        titulo="Confirmar Exclusão"
        maxWidth="xs"
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
        <Typography sx={{ mb: 3 }}>
          Tem certeza que deseja excluir o ponto turístico{" "}
          <strong>{selectedAttraction?.nome}</strong>?
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
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
