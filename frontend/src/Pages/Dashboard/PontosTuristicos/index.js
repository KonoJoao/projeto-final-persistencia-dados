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
  Card,
  CardMedia,
  Tooltip,
  Chip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Edit,
  Delete,
  PhotoCamera,
  Add,
  Close,
  Comment,
  Star,
  Hotel,
  FileDownload,
  FileUpload,
} from "@mui/icons-material";
import {
  CustomInput,
  LoadingBox,
  CustomSelect,
} from "../../../Components/Custom";
import { Modal } from "../../../Components/Modal";
import ImageUploader from "../../../Components/ImageUploader";
import ComentariosManager from "./comentarios";
import AvaliacoesManager from "./avaliacoes";
import HospedagensManager from "./hospedagens";
import estadosCidadesData from "../../../Assets/Home/cidades-estados.json";
import axios from "axios";

const API_URL = "http://localhost:3001/pontos-turisticos";
const FOTOS_API_URL = "http://localhost:3001/fotos";

export default function PontosTuristicos() {
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPhotoModal, setOpenPhotoModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openDeletePhotoModal, setOpenDeletePhotoModal] = useState(false);
  const [openComentariosModal, setOpenComentariosModal] = useState(false);
  const [openAvaliacoesModal, setOpenAvaliacoesModal] = useState(false);
  const [openHospedagensModal, setOpenHospedagensModal] = useState(false);
  const [openImportModal, setOpenImportModal] = useState(false);
  const [openExportModal, setOpenExportModal] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importFormat, setImportFormat] = useState("csv");
  const [exporting, setExporting] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    format: "csv",
    nome: "",
    cidade: "",
    estado: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const fileInputRef = useRef(null);

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

  const [cidadesDisponiveis, setCidadesDisponiveis] = useState([]);

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

  // Funções para gerenciar fotos
  const fetchPhotos = async (pontoId) => {
    try {
      setLoadingPhotos(true);
      console.log("Buscando fotos para o ponto:", pontoId);
      const response = await axios.get(`${FOTOS_API_URL}/ponto/${pontoId}`);
      console.log("Fotos recebidas:", response.data);
      setPhotos(response.data);
    } catch (error) {
      console.error("Erro ao buscar fotos:", error);
      showSnackbar("Erro ao carregar fotos", "error");
    } finally {
      setLoadingPhotos(false);
    }
  };

  const handleUploadSuccess = async (response) => {
    showSnackbar("Fotos enviadas com sucesso!", "success");
    if (selectedAttraction) {
      await fetchPhotos(selectedAttraction.id);
    }
  };

  const handleUploadError = (error) => {
    showSnackbar(`Erro ao fazer upload: ${error.message}`, "error");
  };

  const handleDeletePhoto = (photoId) => {
    setSelectedPhoto(photoId);
    setOpenDeletePhotoModal(true);
  };

  const confirmDeletePhoto = async () => {
    if (!selectedPhoto) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${FOTOS_API_URL}/${selectedPhoto}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      showSnackbar("Foto excluída com sucesso!", "success");

      // Atualizar lista de fotos
      if (selectedAttraction) {
        await fetchPhotos(selectedAttraction.id);
      }
    } catch (error) {
      console.error("Erro ao excluir foto:", error);
      const message = error.response?.data?.message || "Erro ao excluir foto";
      showSnackbar(message, "error");
    } finally {
      setOpenDeletePhotoModal(false);
      setSelectedPhoto(null);
    }
  };

  const handleCloseDeletePhotoModal = () => {
    setOpenDeletePhotoModal(false);
    setSelectedPhoto(null);
  };

  // Handlers para modais
  const handleOpenPhotoModal = async (attraction) => {
    setSelectedAttraction(attraction);
    setOpenPhotoModal(true);
    await fetchPhotos(attraction.id);
  };

  const handleClosePhotoModal = () => {
    setOpenPhotoModal(false);
  };

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
  };

  const handleOpenComentariosModal = (attraction) => {
    setSelectedAttraction(attraction);
    setOpenComentariosModal(true);
  };

  const handleCloseComentariosModal = () => {
    setOpenComentariosModal(false);
  };

  const handleOpenAvaliacoesModal = (attraction) => {
    setSelectedAttraction(attraction);
    setOpenAvaliacoesModal(true);
  };

  const handleCloseAvaliacoesModal = () => {
    setOpenAvaliacoesModal(false);
  };

  const handleOpenHospedagens = (attraction) => {
    setSelectedAttraction(attraction);
    setOpenHospedagensModal(true);
  };

  const handleCloseHospedagens = () => {
    setOpenHospedagensModal(false);
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
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Atualizar cidades quando estado mudar
    if (field === "estado") {
      const estadoSelecionado = estadosCidadesData.estados.find(
        (estado) => estado.nome === value
      );
      setCidadesDisponiveis(estadoSelecionado?.cidades || []);
      setFormData((prev) => ({ ...prev, cidade: "" }));
    }
  };

  // CRUD Operations
  const handleCreate = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
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
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
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

  const handleOpenImportModal = () => {
    setOpenImportModal(true);
    setImportFile(null);
    setImportFormat("csv");
  };

  const handleCloseImportModal = () => {
    setOpenImportModal(false);
    setImportFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Determinar formato baseado na extensão
      const extension = file.name.split(".").pop().toLowerCase();
      const validExtensions = {
        json: "json",
        csv: "csv",
        xml: "xml",
        xls: "csv",
        xlsx: "csv",
      };

      if (!validExtensions[extension]) {
        showSnackbar(
          "Formato de arquivo inválido. Use arquivos .json, .csv, .xml, .xls ou .xlsx",
          "error"
        );
        return;
      }

      setImportFormat(validExtensions[extension]);
      setImportFile(file);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      showSnackbar("Selecione um arquivo para importar", "warning");
      return;
    }

    try {
      setImporting(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", importFile);

      const response = await axios.post(
        `${API_URL}-exports/import?format=${importFormat}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      showSnackbar(
        `Importação concluída! ${
          response.data.imported || 0
        } ponto(s) turístico(s) importado(s)`,
        "success"
      );
      handleCloseImportModal();
      await fetchAttractions();
    } catch (error) {
      console.error("Erro ao importar:", error);
      const message =
        error.response?.data?.message || "Erro ao importar pontos turísticos";
      showSnackbar(message, "error");
    } finally {
      setImporting(false);
    }
  };

  const handleOpenExportModal = () => {
    setOpenExportModal(true);
    setExportFilters({
      format: "csv",
      nome: "",
      cidade: "",
      estado: "",
    });
  };

  const handleCloseExportModal = () => {
    setOpenExportModal(false);
  };

  const handleExportFilterChange = (field, value) => {
    setExportFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const token = localStorage.getItem("token");

      // Construir query params
      const params = new URLSearchParams();
      params.append("format", exportFilters.format);
      if (exportFilters.nome) params.append("nome", exportFilters.nome);
      if (exportFilters.cidade) params.append("cidade", exportFilters.cidade);
      if (exportFilters.estado) params.append("estado", exportFilters.estado);

      const response = await axios.get(`${API_URL}-exports/export?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });

      // Criar URL do blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Determinar extensão do arquivo baseado no formato
      const extensions = {
        json: "json",
        csv: "csv",
        xml: "xml",
        csv: "csv",
      };
      const extension = extensions[exportFilters.format] || "csv";

      // Nome do arquivo com data
      const fileName = `pontos-turisticos-${
        new Date().toISOString().split("T")[0]
      }.${extension}`;
      link.setAttribute("download", fileName);

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSnackbar("Arquivo exportado com sucesso!", "success");
      handleCloseExportModal();
    } catch (error) {
      console.error("Erro ao exportar:", error);
      const message =
        error.response?.data?.message || "Erro ao exportar pontos turísticos";
      showSnackbar(message, "error");
    } finally {
      setExporting(false);
    }
  };

  // DataGrid columns
  const columns = [
    { field: "nome", headerName: "Nome", flex: 1, minWidth: 200 },
    {
      field: "cidade",
      headerName: "Cidade",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "estado",
      headerName: "Estado",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "descricao",
      headerName: "Descrição",
      flex: 2,
      minWidth: 250,
    },
    {
      field: "acoes",
      headerName: "Ações",
      width: 350,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          <Tooltip title="Hospedagens" arrow>
            <IconButton
              onClick={() => handleOpenHospedagens(params.row)}
              size="small"
              color="success"
            >
              <Hotel fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ver comentários" arrow>
            <IconButton
              onClick={() => handleOpenComentariosModal(params.row)}
              size="small"
              color="info"
            >
              <Comment fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ver avaliações" arrow>
            <IconButton
              onClick={() => handleOpenAvaliacoesModal(params.row)}
              size="small"
              color="warning"
            >
              <Star fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ver fotos" arrow>
            <IconButton
              onClick={() => handleOpenPhotoModal(params.row)}
              size="small"
              color="default"
            >
              <PhotoCamera fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar" arrow>
            <IconButton
              onClick={() => handleOpenEditModal(params.row)}
              size="small"
              color="primary"
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir" arrow>
            <IconButton
              onClick={() => handleOpenDeleteModal(params.row)}
              size="small"
              color="error"
            >
              <Close fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
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

  const importFormatOptions = [
    { value: "json", label: "JSON" },
    { value: "csv", label: "CSV" },
    { value: "xml", label: "XML" },
  ];

  const formatOptions = [
    { value: "json", label: "JSON" },
    { value: "csv", label: "CSV" },
    { value: "xml", label: "XML" },
    { value: "csv", label: "Excel (csv)" },
  ];

  const estadosOptions = [
    { value: "", label: "Selecione um estado" },
    ...estadosCidadesData.estados.map((estado) => ({
      value: estado.nome,
      label: estado.nome,
    })),
  ];

  const cidadesOptions = [
    { value: "", label: "Selecione uma cidade" },
    ...cidadesDisponiveis.map((cidade) => ({
      value: cidade,
      label: cidade,
    })),
  ];

  return (
    <Box>
      {/* Filtros */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Grid container spacing={2}>
          <Grid
            size={12}
            sx={{ display: "flex", alignItems: "center", gap: 2, marginTop: 2 }}
          >
            {" "}
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
          </Grid>
          <Grid
            size={12}
            sx={{ display: "flex", alignItems: "center", gap: 2, marginTop: 2 }}
          >
            {" "}
            <Button
              variant="contained"
              disableElevation
              startIcon={<FileUpload />}
              size="large"
              onClick={handleOpenImportModal}
            >
              Importar
            </Button>
            <Button
              variant="contained"
              startIcon={<FileDownload />}
              size="large"
              color="success"
              disableElevation
              onClick={handleOpenExportModal}
              sx={{ color: "#fff" }}
            >
              Exportar
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              size="large"
              onClick={handleOpenAddModal}
              disableElevation
              sx={{ color: "#fff" }}
            >
              Cadastrar
            </Button>
          </Grid>
        </Grid>
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
        maxWidth="md"
        titulo="Fotos do Ponto Turístico"
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {selectedAttraction?.nome}
          </Typography>

          <ImageUploader
            endpoint={`${FOTOS_API_URL}/upload`}
            getFileName={(file, index) => {
              const extension = file.name.split(".").pop();
              const timestamp = Date.now();
              const slug = selectedAttraction?.nome
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-");
              return `${slug}_${timestamp}_${index}.${extension}`;
            }}
            maxFiles={10}
            acceptedFormats={["image/jpeg", "image/png", "image/webp"]}
            maxSizeMB={5}
            onSuccess={handleUploadSuccess}
            onError={handleUploadError}
            additionalData={{
              pontoId: selectedAttraction?.id,
              titulo: selectedAttraction?.nome,
            }}
            fieldName="fotos"
            token={localStorage.getItem("token")}
          />
        </Box>

        {/* Lista de Fotos */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Fotos Carregadas ({photos.length})
          </Typography>

          {loadingPhotos ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <Typography>Carregando fotos...</Typography>
            </Box>
          ) : photos.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: "center",
                bgcolor: "grey.50",
                border: "1px solid",
                borderColor: "grey.300",
                borderRadius: 2,
              }}
            >
              <Typography color="text.secondary">
                Nenhuma foto carregada ainda
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {photos.map((photo) => {
                const imageUrl = `${FOTOS_API_URL}/${photo._id}/download`;

                return (
                  <Grid size={{ xs: 12, md: 4 }} key={photo._id}>
                    <Card
                      elevation={0}
                      sx={{
                        position: "relative",
                        paddingTop: "100%",
                        overflow: "hidden",
                        border: "1px solid",
                        borderColor: "grey.300",
                        borderRadius: 2,
                        "&:hover .photo-overlay": { opacity: 1 },
                      }}
                    >
                      {/* 🔥 Agora a imagem usa <img>, permitindo onError */}
                      <img
                        src={imageUrl}
                        alt={photo.titulo || "Foto"}
                        onError={(e) => {
                          console.error("Erro ao carregar imagem:", imageUrl);
                          e.target.src = "/placeholder.jpg"; // opcional
                        }}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />

                      {/* Overlay */}
                      <Box
                        className="photo-overlay"
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          background:
                            "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          p: 1.5,
                          opacity: 0,
                          transition: "opacity 0.3s",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body1"
                            sx={{ color: "white", display: "block", mb: 0.5 }}
                          >
                            {photo.titulo || "Sem título"}
                          </Typography>
                        </Box>

                        <Box
                          sx={{ display: "flex", justifyContent: "flex-end" }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleDeletePhoto(photo._id)}
                          >
                            <Close />
                          </IconButton>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
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
            <CustomSelect
              fullWidth
              label="Estado"
              value={formData.estado}
              onChange={handleInputChange("estado")}
              options={estadosOptions}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CustomSelect
              fullWidth
              label="Cidade"
              value={formData.cidade}
              onChange={handleInputChange("cidade")}
              options={cidadesOptions}
              disabled={!formData.estado}
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
              inputProps={{ step: "any" }}
              helperText="Ex: -23.550520"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CustomInput
              fullWidth
              label="Longitude"
              type="number"
              value={formData.longitude}
              onChange={handleInputChange("longitude")}
              inputProps={{ step: "any" }}
              helperText="Ex: -46.633308"
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
            <CustomSelect
              fullWidth
              label="Estado"
              value={formData.estado}
              onChange={handleInputChange("estado")}
              options={estadosOptions}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CustomSelect
              fullWidth
              label="Cidade"
              value={formData.cidade}
              onChange={handleInputChange("cidade")}
              options={cidadesOptions}
              disabled={!formData.estado}
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
              inputProps={{ step: "any" }}
              helperText="Ex: -23.550520"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <CustomInput
              fullWidth
              label="Longitude"
              type="number"
              value={formData.longitude}
              onChange={handleInputChange("longitude")}
              inputProps={{ step: "any" }}
              helperText="Ex: -46.633308"
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

      {/* Modal de Confirmação de Exclusão de Foto */}
      <Modal
        open={openDeletePhotoModal}
        onClose={handleCloseDeletePhotoModal}
        maxWidth="xs"
        titulo="Confirmar Exclusão"
        buttons={[
          {
            title: "Cancelar",
            variant: "outlined",
            action: handleCloseDeletePhotoModal,
            color: "secondary",
          },
          {
            title: "Excluir Foto",
            variant: "contained",
            action: confirmDeletePhoto,
            color: "error",
          },
        ]}
      >
        <Typography variant="body1">
          Tem certeza que deseja excluir esta foto?
        </Typography>
      </Modal>

      {/* Modal de Comentários */}
      <Modal
        open={openComentariosModal}
        onClose={handleCloseComentariosModal}
        maxWidth="lg"
        titulo={`Comentários - ${selectedAttraction?.nome || ""}`}
        buttons={[
          {
            title: "Fechar",
            variant: "contained",
            action: handleCloseComentariosModal,
          },
        ]}
      >
        {selectedAttraction && (
          <ComentariosManager
            pontoId={selectedAttraction.id}
            pontoNome={selectedAttraction.nome}
          />
        )}
      </Modal>

      {/* Modal de Avaliações */}
      <Modal
        open={openAvaliacoesModal}
        onClose={handleCloseAvaliacoesModal}
        maxWidth="lg"
        titulo={`Avaliações - ${selectedAttraction?.nome || ""}`}
        buttons={[
          {
            title: "Fechar",
            variant: "contained",
            action: handleCloseAvaliacoesModal,
          },
        ]}
      >
        {selectedAttraction && (
          <AvaliacoesManager
            pontoId={selectedAttraction.id}
            pontoNome={selectedAttraction.nome}
          />
        )}
      </Modal>

      {/* Modal de Hospedagens */}
      <Modal
        open={openHospedagensModal}
        onClose={handleCloseHospedagens}
        maxWidth="lg"
        titulo={`Hospedagens - ${selectedAttraction?.nome || ""}`}
        buttons={[
          {
            title: "Fechar",
            variant: "contained",
            action: handleCloseHospedagens,
          },
        ]}
      >
        {selectedAttraction && (
          <HospedagensManager
            pontoId={selectedAttraction.id}
            pontoNome={selectedAttraction.nome}
          />
        )}
      </Modal>

      {/* Modal de Importação */}
      <Modal
        open={openImportModal}
        onClose={handleCloseImportModal}
        maxWidth="sm"
        titulo="Importar Pontos Turísticos"
        buttons={[
          {
            title: "Cancelar",
            variant: "outlined",
            action: handleCloseImportModal,
            disabled: importing,
          },
          {
            title: importing ? "Importando..." : "Importar",
            variant: "contained",
            action: handleImport,
            disabled: !importFile || importing,
          },
        ]}
      >
        <Box sx={{ py: 2 }}>
          <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
            Selecione o formato e o arquivo para importar pontos turísticos.
          </Typography>

          <Grid container spacing={3}>
            <Grid size={12}>
              <CustomSelect
                fullWidth
                label="Formato de Importação"
                value={importFormat}
                onChange={(e) => setImportFormat(e.target.value)}
                options={importFormatOptions}
              />
            </Grid>

            <Grid size={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: "2px dashed",
                  borderColor: importFile ? "success.main" : "grey.300",
                  borderRadius: 2,
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "grey.50",
                  },
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv,.xml,.xls,.xlsx"
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                />

                <FileUpload
                  sx={{
                    fontSize: 48,
                    color: importFile ? "success.main" : "grey.400",
                    mb: 2,
                  }}
                />

                {importFile ? (
                  <>
                    <Typography variant="h6" color="success.main" gutterBottom>
                      Arquivo Selecionado
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {importFile.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(importFile.size / 1024).toFixed(2)} KB
                    </Typography>
                    <Chip
                      label={importFormat.toUpperCase()}
                      size="small"
                      color="primary"
                      sx={{ mt: 1 }}
                    />
                  </>
                ) : (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Clique para selecionar
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ou arraste e solte o arquivo aqui
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: "block" }}
                    >
                      Formatos aceitos: .json, .csv, .xml, .xls, .xlsx
                    </Typography>
                  </>
                )}
              </Paper>
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Formato esperado:</strong> O arquivo deve conter os
              campos: nome, descricao, cidade, estado, pais, latitude,
              longitude, endereco
            </Typography>
          </Alert>
        </Box>
      </Modal>

      {/* Modal de Exportação */}
      <Modal
        open={openExportModal}
        onClose={handleCloseExportModal}
        maxWidth="sm"
        titulo="Exportar Pontos Turísticos"
        buttons={[
          {
            title: "Cancelar",
            variant: "outlined",
            action: handleCloseExportModal,
            disabled: exporting,
          },
          {
            title: exporting ? "Exportando..." : "Exportar",
            variant: "contained",
            action: handleExport,
            disabled: exporting,
            color: "success",
          },
        ]}
      >
        <Box sx={{ py: 2 }}>
          <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
            Selecione o formato e aplique filtros opcionais para exportar os
            pontos turísticos.
          </Typography>

          <Grid container spacing={3}>
            <Grid size={12}>
              <CustomSelect
                fullWidth
                label="Formato de Exportação"
                value={exportFilters.format}
                onChange={(e) =>
                  handleExportFilterChange("format", e.target.value)
                }
                options={formatOptions}
              />
            </Grid>

            <Grid size={12}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Filtros (Opcional)
              </Typography>
            </Grid>

            <Grid size={12}>
              <CustomInput
                fullWidth
                label="Nome"
                placeholder="Filtrar por nome..."
                value={exportFilters.nome}
                onChange={(e) =>
                  handleExportFilterChange("nome", e.target.value)
                }
              />
            </Grid>

            <Grid size={12}>
              <CustomInput
                fullWidth
                label="Cidade"
                placeholder="Filtrar por cidade..."
                value={exportFilters.cidade}
                onChange={(e) =>
                  handleExportFilterChange("cidade", e.target.value)
                }
              />
            </Grid>

            <Grid size={12}>
              <CustomInput
                fullWidth
                label="Estado"
                placeholder="Filtrar por estado..."
                value={exportFilters.estado}
                onChange={(e) =>
                  handleExportFilterChange("estado", e.target.value)
                }
              />
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Dica:</strong> Deixe os filtros vazios para exportar todos
              os pontos turísticos. Use os filtros para exportar apenas
              registros específicos.
            </Typography>
          </Alert>
        </Box>
      </Modal>

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
