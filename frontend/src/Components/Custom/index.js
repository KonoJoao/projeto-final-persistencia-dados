import React, { useEffect, useState } from "react";
import {
  TextField,
  MenuItem,
  InputAdornment,
  Box,
  IconButton,
  CircularProgress,
  Typography,
  Button,
  Paper,
} from "@mui/material";
import { styled } from "@mui/system";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { format, isValid, parse, set } from "date-fns";
import { ptBR } from "date-fns/locale";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { Calendar } from "../Calendar";
import { formatDate } from "../Functions";
import { Modal } from "../Modal";
import { Rows } from "../List/Rows";

const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const CustomTextField = styled(TextField)(({ disableElevation }) => ({
  "& .MuiOutlinedInput-root": {
    backgroundColor: disableElevation ? "transparent" : "rgba(0, 0, 0, 0.1)",
    borderRadius: 8,
    border: "none",
    color: "#000 !important",
    "& fieldset": { border: "none" },
    "&:hover fieldset": { border: "none" },
    "&.Mui-focused fieldset": { border: "none" },
  },
  "& .MuiInputLabel-root": {
    color: "#000",
    left: "-10px",
    transform: "translate(14px, -23px) scale(1)", // Mantém o label sempre acima
  },
  "& .MuiInputLabel-shrink": {
    color: "#000",
    transform: "translate(14px, -23px) scale(1)", // Evita movimentação do label
  },
  "& .MuiInputBase-input": {
    color: "#000",
    height: "15px",
    "&::placeholder": {
      opacity: 1, // Mantém o placeholder visível
      color: "rgba(0,0,0,0.7)",
    },
  },
}));

export const CustomInput = ({
  placeholder,
  startIcon,
  endIcon,
  label,
  multiline,
  minRows,
  sx,
  ...props
}) => {
  return (
    <CustomTextField
      {...props}
      variant="outlined"
      label={label}
      minRows={minRows}
      multiline={multiline}
      placeholder={placeholder || label}
      InputLabelProps={{ shrink: true }}
      InputProps={{
        sx: sx,
        startAdornment: startIcon ? (
          <InputAdornment position="start">{startIcon}</InputAdornment>
        ) : null,
        endAdornment: endIcon ? (
          <InputAdornment position="end">{endIcon}</InputAdornment>
        ) : null,
      }}
    />
  );
};

export const CustomSelect = ({
  options,
  startIcon,
  endIcon,
  children,
  label,
  placeholder,
  sx,
  ...props
}) => {
  return (
    <CustomTextField
      {...props}
      select
      variant="outlined"
      label={label} // Mantendo o label vindo da props
      InputLabelProps={{ shrink: true }}
      displayEmpty
      sx={sx}
      SelectProps={{
        displayEmpty: true, // Permite exibir o placeholder
        renderValue: (selected) =>
          selected
            ? options.find((opt) => opt.value === selected)?.label
            : placeholder, // Mostra o placeholder se nada estiver selecionado
        sx: {
          height: "47px", // Ajusta a altura do Select (área onde o valor selecionado é exibido)
        },
      }}
      InputProps={{
        startAdornment: startIcon ? (
          <InputAdornment position="start">{startIcon}</InputAdornment>
        ) : null,
        endAdornment: endIcon ? (
          <InputAdornment position="end">{endIcon}</InputAdornment>
        ) : null,
      }}
    >
      {options &&
        options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}

      {children}
    </CustomTextField>
  );
};

export default function CustomDateInput({ value, onChange, label, ...props }) {
  const [dados, _setDados] = useState({
    open: false,
    dataSelecionada: null,
    dataFormatada: "",
    dataEscrita: "",
  });
  const setDados = (prop, value) =>
    _setDados((prev) => ({ ...prev, [prop]: value }));

  useEffect(() => {
    setDados("dataSelecionada", value);
  }, [value]);

  const handleTextChange = (e) => {
    try {
      if (e.target.value.length > 10) return;

      const parsed = parse(e.target.value, "dd/MM/yyyy", new Date(), {
        locale: ptBR,
      });

      if (isValid(parsed) && e.target.value.toString().length === 10) {
        _setDados((prev) => ({
          ...prev,
          dataSelecionada: parsed,
          dataFormatada: format(parsed, "dd/MM/yyyy"),
        }));

        return onChange(parsed, true);
      } else {
        setDados("dataFormatada", formatDate(e.target.value));
        onChange(formatDate(e.target.value), false);
      }
    } catch (error) {
      alert("Erro ao formatar a data: " + error.message);
    }
  };

  const handleDateSelect = (data) => {
    _setDados((prev) => ({
      ...prev,
      open: false,
      dataSelecionada: data,
      dataFormatada: format(data, "dd/MM/yyyy"),
    }));
    onChange(data, true);
  };
  return (
    <>
      <CustomInput
        fullWidth
        placeholder={"dd/mm/aaaa"}
        label={label}
        value={
          dados.dataFormatada || (value ? format(value, "dd/MM/yyyy") : "")
        }
        onChange={handleTextChange}
        startIcon={
          <IconButton onClick={() => setDados("open", true)}>
            <CalendarTodayIcon />
          </IconButton>
        }
        {...props}
      />

      <Modal
        open={dados.open}
        onClose={() => setDados("open", false)}
        maxWidth="xs"
        titulo="Selecione uma data"
      >
        <Calendar
          onSelect={handleDateSelect}
          data={dados.dataSelecionada}
          all={true}
        />
      </Modal>
    </>
  );
}

export const LoadingBox = ({ message }) => {
  return (
    <Box
      sx={{
        width: "100%",
        textAlign: "center",
        p: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
      }}
    >
      <CircularProgress size={25} />
      <Typography variant={"body1"}>{message}</Typography>
    </Box>
  );
};

export function CustomMonthSelector({ selected, onSelect }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Box
        component={Paper}
        elevation={0}
        onClick={() => setOpen(true)}
        sx={{
          width: "100%",
          background: "rgba(0, 0, 0, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: "8px",
          px: 2,
          py: "7px",
          cursor: "pointer",
        }}
      >
        <Typography>
          {selected[0]?.titulo || meses[selected[0]?.id] || "Selecione o mês"}
        </Typography>
        <IconButton size="small">
          <ExpandMoreIcon />
        </IconButton>
      </Box>

      <Modal
        open={open}
        hadleClose={() => setOpen(false)}
        maxWidth="xs"
        titulo="Selecione o mês"
      >
        <Rows
          items={meses.map((mes, index) => ({
            id: index,
            titulo: mes,
          }))}
          selectedItems={selected || []}
          onSelect={(item) => {
            onSelect(item);
            setOpen(false);
          }}
        />
      </Modal>
    </>
  );
}

export function CustomYearSelector({ selected, onSelect, range = 15 }) {
  const [open, setOpen] = useState(false);

  const anos = Array.from({ length: range }, (_, i) => {
    const ano = new Date().getFullYear() - 5 + i;
    return { id: ano, titulo: ano.toString() };
  });

  return (
    <>
      <Box
        onClick={() => setOpen(true)}
        sx={{
          background: "rgba(0, 0, 0, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: "8px",
          px: 2,
          py: "8px",
          cursor: "pointer",
        }}
      >
        <Typography>
          {selected?.length ? selected[0].titulo : "Selecione o ano"}
        </Typography>
        <IconButton size="small">
          <ExpandMoreIcon />
        </IconButton>
      </Box>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        titulo="Selecione o ano"
      >
        <Rows
          items={anos}
          selectedItems={selected || []}
          onSelect={(item) => {
            onSelect(item);
            setOpen(false);
          }}
        />
      </Modal>
    </>
  );
}
