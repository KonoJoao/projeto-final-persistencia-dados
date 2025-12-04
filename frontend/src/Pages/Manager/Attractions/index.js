import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Paper,
  Alert,
  Snackbar,
  Grid,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Edit, Delete, PhotoCamera, Add } from "@mui/icons-material";
import { CustomInput, LoadingBox } from "../../../Components/Custom";
import { Modal } from "../../../Components/Modal";

const API_URL = "http://localhost:3000/pontos-turisticos";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  minWidth: 500,
  maxHeight: "90vh",
  overflow: "auto",
};

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
    latitude: 0,
    longitude: 0,
    endereco: "",
  });

  // Fetch attractions
  useEffect(() => {
    fetchAttractions();
  }, []);

  const fetchAttractions = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Erro ao buscar pontos turísticos");
      const data = await response.json();
      setAttractions(data);
    } catch (error) {
      showSnackbar(
        "Erro ao carregar pontos turísticos: " + error.message,
        "error"
      );
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
      latitude: 0,
      longitude: 0,
      endereco: "",
    });
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // CRUD Operations
  const handleCreate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Erro ao criar ponto turístico");

      await fetchAttractions();
      showSnackbar("Ponto turístico criado com sucesso!");
      handleCloseAddModal();
    } catch (error) {
      showSnackbar("Erro ao criar ponto turístico: " + error.message, "error");
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/${selectedAttraction.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Erro ao atualizar ponto turístico");

      await fetchAttractions();
      showSnackbar("Ponto turístico atualizado com sucesso!");
      handleCloseEditModal();
    } catch (error) {
      showSnackbar(
        "Erro ao atualizar ponto turístico: " + error.message,
        "error"
      );
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/${selectedAttraction.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erro ao deletar ponto turístico");

      await fetchAttractions();
      showSnackbar("Ponto turístico deletado com sucesso!");
      handleCloseDeleteModal();
    } catch (error) {
      showSnackbar(
        "Erro ao deletar ponto turístico: " + error.message,
        "error"
      );
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
      valueGetter: (params) => `${params.row.cidade}/${params.row.estado}`,
    },
    {
      field: "descricao",
      headerName: "Descrição",
      flex: 2,
      minWidth: 250,
      renderCell: (params) => params.value?.substring(0, 100) + "...",
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

  const FormFields = () => (
    <Grid container spacing={4} sx={{ mt: 1 }}>
      <Grid size={{ xs: 12, md: 4 }}>
        <CustomInput
          fullWidth
          label="Nome"
          value={formData.nome}
          onChange={(e) => handleInputChange("nome", e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <CustomInput
          fullWidth
          label="Cidade"
          value={formData.cidade}
          onChange={(e) => handleInputChange("cidade", e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <CustomInput
          fullWidth
          label="Estado"
          value={formData.estado}
          onChange={(e) => handleInputChange("estado", e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <CustomInput
          fullWidth
          label="País"
          value={formData.pais}
          onChange={(e) => handleInputChange("pais", e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <CustomInput
          fullWidth
          label="Latitude"
          type="number"
          value={formData.latitude}
          onChange={(e) =>
            handleInputChange("latitude", parseFloat(e.target.value))
          }
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <CustomInput
          fullWidth
          label="Longitude"
          type="number"
          value={formData.longitude}
          onChange={(e) =>
            handleInputChange("longitude", parseFloat(e.target.value))
          }
        />
      </Grid>
      <Grid size={12}>
        <CustomInput
          fullWidth
          label="Endereço"
          value={formData.endereco}
          onChange={(e) => handleInputChange("endereco", e.target.value)}
        />
      </Grid>{" "}
      <Grid size={12}>
        <CustomInput
          fullWidth
          label="Descrição"
          value={formData.descricao}
          onChange={(e) => handleInputChange("descricao", e.target.value)}
          multiline
          minRows={3}
        />
      </Grid>
    </Grid>
  );

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
      <Modal open={openPhotoModal} onClose={handleClosePhotoModal}>
        <Box sx={style}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Fotos de {selectedAttraction?.nome}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Funcionalidade de upload de fotos em desenvolvimento...
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={handleClosePhotoModal}>
              Fechar
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Modal de Edição */}
      <Modal
        open={openEditModal}
        handleClose={handleCloseEditModal}
        maxWidth="md"
        titulo="Editar Ponto Turístico"
        buttons={[
          {
            title: "Cancelar",
            variant: "outlined",
            onClick: handleCloseEditModal,
            color: "secondary",
          },
          {
            title: "Salvar",
            variant: "contained",
            onClick: handleUpdate,
            color: "primary",
          },
        ]}
      >
        <FormFields />
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
            onClick: handleCloseAddModal,
            color: "secondary",
          },
          {
            title: "Cadastrar",
            variant: "contained",
            onClick: handleCreate,
            color: "primary",
          },
        ]}
      >
        <FormFields />
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        titulo="Confirmar Exclusão"
        buttons={[
          {
            title: "Cancelar",
            variant: "outlined",
            onClick: handleCloseDeleteModal,
            color: "secondary",
          },
          {
            title: "Excluir",
            variant: "contained",
            onClick: handleDelete,
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
