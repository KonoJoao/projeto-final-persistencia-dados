import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  IconButton,
  Typography,
  Grid,
  Box,
} from "@mui/material";
import { format, addMonths, subMonths, isToday, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { toUTC } from "../Functions";

export const Calendar = ({ onSelect, all = false, data = null }) => {
  const [mesAtual, setMesAtual] = useState(new Date());
  const [dataSelecionada, setDataSelecionada] = useState(null);

  useEffect(() => setDataSelecionada(data), [data]);

  const intervaloDesabilitadoInicio = new Date(2024, 9, 10);
  const intervaloDesabilitadoFim = new Date(2024, 9, 15);

  const isDataDesabilitada = (info) => {
    if (all) return false;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataSemHorario = new Date(info);
    dataSemHorario.setHours(0, 0, 0, 0);

    return (
      dataSemHorario < hoje ||
      (dataSemHorario >= intervaloDesabilitadoInicio &&
        dataSemHorario <= intervaloDesabilitadoFim)
    );
  };

  const handleCliqueData = (data) => {
    if (!isDataDesabilitada(data)) {
      setDataSelecionada(data);
      onSelect(data);
    }
  };

  const renderizaDias = () => {
    const diasNoMes = new Date(
      mesAtual.getFullYear(),
      mesAtual.getMonth() + 1,
      0
    ).getDate();
    const diaInicial = new Date(
      mesAtual.getFullYear(),
      mesAtual.getMonth(),
      1
    ).getDay();

    const dias = [];
    for (let i = 0; i < diaInicial; i++) {
      dias.push(
        <Grid size={{ xs: 12 / 7 }} key={`vazio-${i}`}>
          <Box />
        </Grid>
      );
    }
    const isSelectedDay = (ds, d) =>
      toUTC({ data: d, onlyDate: true }) ===
      toUTC({ data: ds, onlyDate: true });

    for (let dia = 1; dia <= diasNoMes; dia++) {
      const mes = ("00" + (mesAtual.getMonth() + 1)).slice(-2);
      const ano = mesAtual.getFullYear();

      const data = parse([dia, mes, ano].join("/"), "dd/MM/yyyy", new Date(), {
        locale: ptBR,
      }).toISOString();

      dias.push(
        <Grid
          size={{ xs: 12 / 7 }}
          key={dia}
          sx={{ display: "flex", justifyContent: "center" }}
        >
          <IconButton
            onClick={() => handleCliqueData(data)}
            disabled={isDataDesabilitada(data)}
            sx={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              bgcolor: isSelectedDay(data, dataSelecionada)
                ? "primary.main"
                : isDataDesabilitada(data)
                ? "grey.300"
                : isToday(data)
                ? "grey.900"
                : "inherit",
              color: isSelectedDay(data, dataSelecionada) ? "white" : "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "&:hover": {
                bgcolor: isSelectedDay(data, dataSelecionada)
                  ? "primary.dark"
                  : isDataDesabilitada(data)
                  ? "grey.300"
                  : "inherit",
              },
            }}
          >
            <Typography variant="body2">{dia}</Typography>
          </IconButton>
        </Grid>
      );
    }
    return dias;
  };

  const handleMesAnterior = () => {
    setMesAtual(subMonths(mesAtual, 1));
  };

  const handleProximoMes = () => {
    setMesAtual(addMonths(mesAtual, 1));
  };
  const capitalizarPrimeiraLetra = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const diasDaSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <Card
      sx={{ borderRadius: "10px", background: "transparent" }}
      variant="outlined"
    >
      <CardContent>
        <Grid container spacing={1} sx={{ minHeight: "58.5vh" }}>
          <Grid size={{ xs: 12 }}>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <IconButton onClick={handleMesAnterior}>
                <ArrowBack />
              </IconButton>
              <Typography variant="h6" align="center">
                {capitalizarPrimeiraLetra(
                  format(mesAtual, "MMMM yyyy", { locale: ptBR })
                )}
              </Typography>
              <IconButton onClick={handleProximoMes}>
                <ArrowForward />
              </IconButton>
            </Box>
          </Grid>
          <Grid container spacing={1} sx={{ width: "100%", height: "15px" }}>
            {diasDaSemana.map((dia, index) => (
              <Grid
                size={12 / 7}
                key={index}
                sx={{
                  maxHeight: "10px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  {dia}
                </Typography>
              </Grid>
            ))}
          </Grid>
          {renderizaDias()}
        </Grid>
      </CardContent>
    </Card>
  );
};
