import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Banner from "../../Assets/Home/banner.png";
import {
  Box,
  Grid,
  Paper,
  Typography,
  IconButton,
  Divider,
  Container,
  Card,
  CardMedia,
  CardContent,
  Rating,
  CardActionArea,
} from "@mui/material";
import { Search, LocationOn, Business } from "@mui/icons-material";
import { Modal } from "../../Components/Modal";
import { CustomInput, CustomSelect, LoadingBox } from "../../Components/Custom";
import estadosCidadesData from "../../Assets/Home/cidades-estados.json";
import DetalhesModal from "./DetalhesModal";
import axios from "axios";

const API_URL = "http://localhost:3001/pontos-turisticos";
const FOTOS_API_URL = "http://localhost:3001/fotos";
const AVALIACOES_API_URL = "http://localhost:3001/avaliacoes";
const COMENTARIOS_API_URL = "http://localhost:3001/comentarios";
const HOSPEDAGENS_API_URL = "http://localhost:3001/hospedagens";

export default function Home() {
  const navigate = useNavigate();

  const [openModal, setOpenModal] = useState({
    nome: false,
    estado: false,
    cidade: false,
    detalhes: false,
  });

  const [filters, setFilters] = useState({
    nome: "",
    estado: "",
    cidade: "",
  });

  const [cidadesDisponiveis, setCidadesDisponiveis] = useState([]);
  const [pontosTuristicos, setPontosTuristicos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fotosPontos, setFotosPontos] = useState({}); // Cache de fotos por ponto
  const [selectedPonto, setSelectedPonto] = useState(null);
  const [pontoDetalhes, setPontoDetalhes] = useState({
    fotos: [],
    avaliacoes: [],
    comentarios: [],
    hospedagens: [],
  });
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);

  // Buscar pontos turísticos apenas ao carregar a página
  useEffect(() => {
    fetchPontosTuristicos();
  }, []); // Array vazio para executar apenas uma vez

  const fetchPontosTuristicos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.nome) params.append("nome", filters.nome);
      if (filters.estado) params.append("estado", filters.estado);
      if (filters.cidade) params.append("cidade", filters.cidade);

      const response = await axios.get(`${API_URL}?${params}`);
      const pontos = response.data;
      setPontosTuristicos(pontos);

      // Buscar fotos para cada ponto
      await fetchFotosPontos(pontos);
    } catch (error) {
      console.error("Erro ao buscar pontos turísticos:", error);
      setPontosTuristicos([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFotosPontos = async (pontos) => {
    try {
      const fotosMap = {};

      // Buscar fotos para cada ponto em paralelo
      await Promise.all(
        pontos.map(async (ponto) => {
          try {
            const response = await axios.get(
              `${FOTOS_API_URL}/ponto/${ponto.id}`
            );
            fotosMap[ponto.id] = response.data;
          } catch (error) {
            console.error(`Erro ao buscar fotos do ponto ${ponto.id}:`, error);
            fotosMap[ponto.id] = [];
          }
        })
      );

      setFotosPontos(fotosMap);
    } catch (error) {
      console.error("Erro ao buscar fotos dos pontos:", error);
    }
  };

  const fetchPontoDetalhes = async (pontoId) => {
    try {
      setLoadingDetalhes(true);
      const [fotosRes, avaliacoesRes, comentariosRes, hospedagensRes] =
        await Promise.all([
          axios.get(`${FOTOS_API_URL}/ponto/${pontoId}`),
          axios.get(`${AVALIACOES_API_URL}?ponto_id=${pontoId}`),
          axios.get(`${COMENTARIOS_API_URL}?pontoId=${pontoId}`),
          axios.get(`${HOSPEDAGENS_API_URL}/ponto/${pontoId}`),
        ]);

      setPontoDetalhes({
        fotos: fotosRes.data,
        avaliacoes: avaliacoesRes.data,
        comentarios: comentariosRes.data,
        hospedagens: hospedagensRes.data.data || hospedagensRes.data, // Trata resposta paginada
      });
    } catch (error) {
      console.error("Erro ao buscar detalhes:", error);
    } finally {
      setLoadingDetalhes(false);
    }
  };

  const handleOpenModal = (modalName) => {
    setOpenModal((prev) => ({ ...prev, [modalName]: true }));
  };

  const handleCloseModal = (modalName) => {
    setOpenModal((prev) => ({ ...prev, [modalName]: false }));
  };

  const handleFilterChange = (field, value) => {
    // Não atualizar filtros diretamente durante o estado
    if (field === "estado") {
      const estadoSelecionado = estadosCidadesData.estados.find(
        (e) => e.sigla === value
      );
      setCidadesDisponiveis(estadoSelecionado?.cidades || []);
      setFilters((prev) => ({ ...prev, [field]: value, cidade: "" }));
    } else {
      setFilters((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSearch = () => {
    fetchPontosTuristicos();
  };

  const handleCardClick = async (ponto) => {
    setSelectedPonto(ponto);
    handleOpenModal("detalhes");
    await fetchPontoDetalhes(ponto.id);
  };

  const handleCloseDetalhes = () => {
    handleCloseModal("detalhes");
    setSelectedPonto(null);
    setPontoDetalhes({
      fotos: [],
      avaliacoes: [],
      comentarios: [],
      hospedagens: [],
    });
  };

  const calcularMediaAvaliacoes = (avaliacoes) => {
    if (!avaliacoes || avaliacoes.length === 0) return 0;
    const soma = avaliacoes.reduce((acc, av) => acc + (av.nota || 0), 0);
    return (soma / avaliacoes.length).toFixed(1);
  };

  const getPrimeiraFoto = (pontoId) => {
    const fotos = fotosPontos[pontoId];
    if (!fotos || fotos.length === 0) {
      return "https://via.placeholder.com/400x300?text=Sem+Foto";
    }

    const primeiraFoto = fotos[0];
    const fotoId = primeiraFoto._id || primeiraFoto.id;
    return `${FOTOS_API_URL}/${fotoId}/download`;
  };

  // Estados para o select
  const estadosOptions = [
    { value: "", label: "Selecione um estado" },
    ...estadosCidadesData.estados.map((estado) => ({
      value: estado.sigla,
      label: estado.nome,
    })),
  ];

  // Cidades para o select
  const cidadesOptions = [
    {
      value: "",
      label: filters.estado
        ? "Selecione uma cidade"
        : "Selecione um estado primeiro",
    },
    ...cidadesDisponiveis.map((cidade) => ({
      value: cidade,
      label: cidade,
    })),
  ];

  // ------------------------------
  // CAMPOS RENDERIZÁVEIS
  // ------------------------------
  const searchFields = [
    {
      id: "nome",
      label: "Nome",
      valueKey: "nome",
      placeholder: "Digite o nome",
      icon: <Search color="action" />,
      size: 4,
      onClick: () => handleOpenModal("nome"),
    },
    {
      id: "estado",
      label: "Estado",
      valueKey: "estado",
      placeholder: "Selecione",
      size: 2,
      icon: <LocationOn color="action" sx={{ fontSize: 20 }} />,
      onClick: () => handleOpenModal("estado"),
      formatter: (v) => {
        const estado = estadosCidadesData.estados.find((e) => e.sigla === v);
        return estado ? estado.nome : v;
      },
    },
    {
      id: "cidade",
      label: "Cidade",
      valueKey: "cidade",
      size: 4,
      placeholder: "Selecione",
      icon: <LocationOn color="action" sx={{ fontSize: 20 }} />,
      onClick: () => handleOpenModal("cidade"),
    },
    {
      size: 1,
      id: "searchButton",
      type: "button",
    },
  ];

  return (
    <Box sx={{ position: "relative" }}>
      {/* Banner */}
      <Box
        sx={{
          background: `url('${Banner}') no-repeat center center`,
          backgroundSize: "cover",
          width: "100%",
          height: "70vh",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          pt: 8,
        }}
      />

      {/* SEARCH BOX */}
      <Box
        sx={{
          position: "absolute",
          top: "70vh",
          left: "15vw",
          right: "15vw",
          width: "70vw",
          zIndex: 10,
        }}
      >
        <Paper
          elevation={1}
          sx={{ px: 5, py: 3, borderRadius: 5, bgcolor: "white" }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Encontre os melhores pontos turísticos
          </Typography>
          <Grid
            container
            spacing={2}
            alignItems="center"
            sx={{
              borderRadius: "500px",
              p: 1,
              border: "1px solid #E0E0E0",
            }}
          >
            {searchFields.map((field, index) => (
              <React.Fragment key={field.id}>
                <Grid
                  size={field.size}
                  sx={{
                    pl: 1,
                    ...(field.type === "button" && {
                      display: "flex",
                      justifyContent: "end",
                    }),
                  }}
                >
                  {field.type === "button" ? (
                    <IconButton
                      color="primary"
                      onClick={handleSearch}
                      sx={{
                        bgcolor: "primary.main",
                        color: "white",
                        width: 45,
                        height: 45,
                        "&:hover": { bgcolor: "primary.dark" },
                      }}
                    >
                      <Search />
                    </IconButton>
                  ) : (
                    <Box
                      onClick={field.onClick}
                      sx={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        cursor: "pointer",
                        borderRadius: 2,
                        transition: "all 0.2s",
                        "&:hover": { bgcolor: "grey.50" },
                      }}
                    >
                      {field.icon}

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2">
                          {field.label}{" "}
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                          >
                            {field.value ||
                              (filters[field.valueKey]
                                ? field.formatter
                                  ? field.formatter(filters[field.valueKey])
                                  : filters[field.valueKey]
                                : field.placeholder)}
                          </Typography>
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Grid>

                {/* Divider entre os itens */}
                {index < searchFields.length - 2 && (
                  <Grid size={0.25} sx={{ flex: 1 }}>
                    <Divider
                      orientation="vertical"
                      flexItem
                      sx={{
                        mx: 1,
                        height: "40px",
                        display: { xs: "none", md: "block" },
                      }}
                    />
                  </Grid>
                )}
              </React.Fragment>
            ))}
          </Grid>
        </Paper>
      </Box>

      <Box sx={{ height: 150 }} />

      {/* LISTAGEM DE PONTOS TURÍSTICOS */}
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
          Pontos Turísticos
        </Typography>

        {loading ? (
          <LoadingBox />
        ) : pontosTuristicos.length === 0 ? (
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
              Nenhum ponto turístico encontrado
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {pontosTuristicos.map((ponto) => {
              const fotoUrl = getPrimeiraFoto(ponto.id);
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={ponto.id}>
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      border: "1px solid",
                      borderColor: "grey.300",
                      borderRadius: "10px",
                      cursor: "pointer",
                      ":hover": {
                        opacity: 0.9,
                        boxShadow: 3,
                      },
                    }}
                    onClick={() => handleCardClick(ponto)}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={fotoUrl}
                      alt={ponto.nome}
                      sx={{ objectFit: "cover" }}
                      loading="lazy"
                      onError={(e) => {
                        if (
                          e.target.src !==
                          "https://via.placeholder.com/400x300?text=Sem+Foto"
                        ) {
                          e.target.src =
                            "https://via.placeholder.com/400x300?text=Sem+Foto";
                        }
                      }}
                    />
                    <CardContent>
                      <Typography
                        variant="h6"
                        fontWeight="600"
                        gutterBottom
                        noWrap
                      >
                        {ponto.nome}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <LocationOn fontSize="small" color="action" />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                        >
                          {ponto.cidade}, {ponto.estado}
                        </Typography>
                      </Box>
                      {ponto.descricao && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            minHeight: 40,
                          }}
                        >
                          {ponto.descricao}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>

      {/* MODAIS DE FILTRO */}
      <Modal
        open={openModal.nome}
        onClose={() => handleCloseModal("nome")}
        titulo="Filtrar por Nome"
        maxWidth="sm"
        buttons={[
          {
            title: "Limpar",
            variant: "outlined",
            action: () => handleFilterChange("nome", ""),
          },
          {
            title: "Aplicar",
            variant: "contained",
            action: () => {
              handleCloseModal("nome");
              handleSearch();
            },
          },
        ]}
      >
        <CustomInput
          fullWidth
          label="Nome do Ponto Turístico"
          placeholder="Digite o nome..."
          value={filters.nome}
          onChange={(e) => handleFilterChange("nome", e.target.value)}
          startIcon={<Search />}
        />
      </Modal>

      <Modal
        open={openModal.estado}
        onClose={() => handleCloseModal("estado")}
        titulo="Filtrar por Estado"
        maxWidth="sm"
        buttons={[
          {
            title: "Limpar",
            variant: "outlined",
            action: () => {
              handleFilterChange("estado", "");
              setCidadesDisponiveis([]);
            },
          },
          {
            title: "Aplicar",
            variant: "contained",
            action: () => {
              handleCloseModal("estado");
              handleSearch();
            },
          },
        ]}
      >
        <CustomSelect
          fullWidth
          label="Estado"
          value={filters.estado}
          onChange={(e) => handleFilterChange("estado", e.target.value)}
          options={estadosOptions}
          startIcon={<LocationOn />}
        />
      </Modal>

      <Modal
        open={openModal.cidade}
        onClose={() => handleCloseModal("cidade")}
        titulo="Filtrar por Cidade"
        maxWidth="sm"
        buttons={[
          {
            title: "Limpar",
            variant: "outlined",
            action: () => handleFilterChange("cidade", ""),
          },
          {
            title: "Aplicar",
            variant: "contained",
            action: () => {
              handleCloseModal("cidade");
              handleSearch();
            },
          },
        ]}
      >
        <CustomSelect
          fullWidth
          label="Cidade"
          value={filters.cidade}
          onChange={(e) => handleFilterChange("cidade", e.target.value)}
          options={cidadesOptions}
          disabled={!filters.estado}
          startIcon={<LocationOn />}
        />
        {!filters.estado && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            Selecione um estado primeiro para visualizar as cidades.
          </Typography>
        )}
      </Modal>

      {/* MODAL DE DETALHES */}
      <DetalhesModal
        open={openModal.detalhes}
        onClose={handleCloseDetalhes}
        ponto={selectedPonto}
        detalhes={pontoDetalhes}
        loading={loadingDetalhes}
      />
    </Box>
  );
}
