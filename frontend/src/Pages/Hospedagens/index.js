import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid2 as Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Pagination,
  Chip,
  Divider,
} from "@mui/material";
import { Hotel, FilterList } from "@mui/icons-material";
import { CustomInput, CustomSelect, LoadingBox } from "../../Components/Custom";
import { Modal } from "../../Components/Modal";
import axios from "axios";

const API_URL = "http://localhost:3001/hospedagens";
const PONTOS_API_URL = "http://localhost:3001/pontos-turisticos";

export default function Hospedagens() {
  const [hospedagens, setHospedagens] = useState([]);
  const [pontosTuristicos, setPontosTuristicos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openFiltersModal, setOpenFiltersModal] = useState(false);

  const [filters, setFilters] = useState({
    pontoId: "",
    tipo: "",
    precoMin: "",
    precoMax: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const tiposHospedagem = [
    { value: "", label: "Todos os tipos" },
    { value: "hotel", label: "Hotel" },
    { value: "pousada", label: "Pousada" },
    { value: "hostel", label: "Hostel" },
  ];

  useEffect(() => {
    fetchPontosTuristicos();
  }, []);

  useEffect(() => {
    fetchHospedagens();
  }, [pagination.page, pagination.limit]);

  const fetchPontosTuristicos = async () => {
    try {
      const response = await axios.get(PONTOS_API_URL);
      setPontosTuristicos(response.data);
    } catch (error) {
      console.error("Erro ao buscar pontos turísticos:", error);
    }
  };

  const fetchHospedagens = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.pontoId) params.append("pontoId", filters.pontoId);
      if (filters.tipo) params.append("tipo", filters.tipo);
      if (filters.precoMin) params.append("precoMin", filters.precoMin);
      if (filters.precoMax) params.append("precoMax", filters.precoMax);

      const response = await axios.get(`${API_URL}?${params}`);

      setHospedagens(response.data.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 1,
      }));
    } catch (error) {
      console.error("Erro ao buscar hospedagens:", error);
      setHospedagens([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handlePageChange = (event, value) => {
    setPagination((prev) => ({ ...prev, page: value }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApplyFilters = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    setOpenFiltersModal(false);
    fetchHospedagens();
  };

  const handleClearFilters = () => {
    setFilters({
      pontoId: "",
      tipo: "",
      precoMin: "",
      precoMax: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchHospedagens();
  };

  const pontosOptions = [
    { value: "", label: "Todos os pontos turísticos" },
    ...pontosTuristicos.map((ponto) => ({
      value: ponto.id,
      label: ponto.nome,
    })),
  ];

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Hospedagens
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Encontre a hospedagem perfeita para sua viagem
        </Typography>
      </Box>

      {/* Filtros e Resultados */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setOpenFiltersModal(true)}
          >
            Filtros
          </Button>
          {hasActiveFilters && (
            <Chip
              label="Filtros ativos"
              color="primary"
              onDelete={handleClearFilters}
              size="small"
            />
          )}
        </Box>
        <Typography variant="body2" color="text.secondary">
          {pagination.total} hospedagens encontradas
        </Typography>
      </Box>

      {/* Lista de Hospedagens */}
      {loading ? (
        <LoadingBox />
      ) : hospedagens.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            border: "1px solid",
            borderColor: "grey.300",
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Nenhuma hospedagem encontrada
          </Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {hospedagens.map((hospedagem) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={hospedagem.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    border: "1px solid",
                    borderColor: "grey.300",
                    borderRadius: 2,
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "primary.main",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Hotel color="primary" sx={{ fontSize: 32 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="600" gutterBottom>
                          {hospedagem.nome}
                        </Typography>
                        <Chip
                          label={
                            hospedagem.tipo === "hotel"
                              ? "Hotel"
                              : hospedagem.tipo === "pousada"
                              ? "Pousada"
                              : "Hostel"
                          }
                          size="small"
                          color="primary"
                          sx={{ mb: 1 }}
                        />
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {hospedagem.ponto?.nome && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mb: 1 }}
                      >
                        📍 {hospedagem.ponto.nome}
                      </Typography>
                    )}

                    {hospedagem.endereco && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {hospedagem.endereco}
                      </Typography>
                    )}

                    {hospedagem.telefone && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        📞 {hospedagem.telefone}
                      </Typography>
                    )}

                    {hospedagem.preco_medio && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          A partir de
                        </Typography>
                        <Typography
                          variant="h6"
                          color="primary.main"
                          fontWeight="600"
                        >
                          R$ {parseFloat(hospedagem.preco_medio).toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          por noite
                        </Typography>
                      </Box>
                    )}

                    {hospedagem.link_reserva && (
                      <Button
                        variant="contained"
                        fullWidth
                        href={hospedagem.link_reserva}
                        target="_blank"
                        sx={{ mt: 2 }}
                      >
                        Reservar
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Paginação */}
          {pagination.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* Modal de Filtros */}
      <Modal
        open={openFiltersModal}
        onClose={() => setOpenFiltersModal(false)}
        titulo="Filtrar Hospedagens"
        maxWidth="sm"
        buttons={[
          {
            title: "Limpar",
            variant: "outlined",
            action: handleClearFilters,
          },
          {
            title: "Aplicar Filtros",
            variant: "contained",
            action: handleApplyFilters,
          },
        ]}
      >
        <Grid container spacing={3}>
          <Grid size={12}>
            <CustomSelect
              fullWidth
              label="Ponto Turístico"
              value={filters.pontoId}
              onChange={(e) => handleFilterChange("pontoId", e.target.value)}
              options={pontosOptions}
            />
          </Grid>

          <Grid size={12}>
            <CustomSelect
              fullWidth
              label="Tipo de Hospedagem"
              value={filters.tipo}
              onChange={(e) => handleFilterChange("tipo", e.target.value)}
              options={tiposHospedagem}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomInput
              fullWidth
              type="number"
              label="Preço Mínimo (R$)"
              value={filters.precoMin}
              onChange={(e) => handleFilterChange("precoMin", e.target.value)}
              inputProps={{ min: "0", step: "0.01" }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomInput
              fullWidth
              type="number"
              label="Preço Máximo (R$)"
              value={filters.precoMax}
              onChange={(e) => handleFilterChange("precoMax", e.target.value)}
              inputProps={{ min: "0", step: "0.01" }}
            />
          </Grid>
        </Grid>
      </Modal>
    </Container>
  );
}
