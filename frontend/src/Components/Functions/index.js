import validator from "validator";

export const match = () => window.innerWidth <= 600;

export const isMobile = match();

export const diferencaEmTimestamp = (dataInicial, dataFinal) => {
  try {
    const inicio = new Date(dataInicial).getTime();
    const fim = new Date(dataFinal).getTime();

    if (isNaN(inicio) || isNaN(fim)) {
      throw new Error("Data inválida");
    }

    return fim - inicio;
  } catch (error) {
    return 0;
  }
};

export const toUTC = ({
  data: dataISO,
  onlyDate = false,
  onlyHours = false,
  offsetHoras = 0,
  format = "pt",
}) => {
  try {
    if (!dataISO) return "Data inválida";

    const data = new Date(dataISO);

    if (!isNaN(offsetHoras) && offsetHoras !== 0) {
      data.setHours(data.getHours() + offsetHoras);
    }

    const dataLocal = data.toISOString();
    if (format === "en") return dataLocal.split("T")[0];

    return dataLocal
      .split("T")
      .map((item, i) =>
        i === 0
          ? item.split("-").reverse().join("/")
          : item.split(":").slice(0, 2).join(":")
      )
      .filter((_, index) => (onlyHours ? index === 1 : true))
      .filter((_, index) => (onlyDate ? index === 0 : true))
      .join(" ");
  } catch (error) {
    return "Data inválida";
  }
};

export function orderBy(array, campo, ordem = "asc") {
  return array.sort((a, b) => {
    if (a[campo] < b[campo]) return ordem === "asc" ? -1 : 1;
    if (a[campo] > b[campo]) return ordem === "asc" ? 1 : -1;
    return 0;
  });
}

export function corPorLetra(letra) {
  const cores = [
    "#F44336", // vermelho
    "#E91E63", // rosa
    "#9C27B0", // roxo
    "#673AB7", // roxo escuro
    "#3F51B5", // azul
    "#2196F3", // azul claro
    "#03A9F4", // ciano
    "#009688", // verde água
    "#4CAF50", // verde
    "#8BC34A", // verde limão
    "#FFC107", // amarelo
    "#FF9800", // laranja
    "#FF5722", // laranja escuro
    "#795548", // marrom
    "#607D8B", // azul acinzentado
  ];

  if (!letra || typeof letra !== "string") return "#999";

  const index = letra.toUpperCase().charCodeAt(0) % cores.length;
  return cores[index];
}

export const formatarData = (dataISO, timeZone = "rio_branco") => {
  const data = new Date(dataISO);

  // Adiciona 3 horas à data
  data.setHours(data.getHours() + 3);

  const titulo = data.toLocaleTimeString("pt-BR", {
    //timeZone: timezones[timeZone],
    hour: "2-digit",
    minute: "2-digit",
  });

  const subtitulo = data.toLocaleDateString("pt-BR", {
    // timeZone: timezones[timeZone],
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return {
    id: new Date(dataISO).getTime(),
    titulo,
    subtitulo,
  };
};

export function formatarHorario(horario) {
  const [hh, mm, ss] = horario.split(":").map(Number);
  let partes = [];

  if (hh > 0) partes.push(`${hh} hora${hh > 1 ? "s" : ""}`);
  if (mm > 0) partes.push(`${mm} minuto${mm > 1 ? "s" : ""}`);
  if (ss > 0) partes.push(`${ss} segundo${ss > 1 ? "s" : ""}`);

  if (partes.length === 0) return "0 segundos";
  if (partes.length === 1) return partes[0];

  return partes.slice(0, -1).join(", ") + " e " + partes[partes.length - 1];
}

export const formatTime = (valorant, valor) => {
  let numeros = valor.replace(/\D/g, "");

  if (numeros === "") return "";
  numeros = numeros.slice(0, 4);

  if (
    numeros.slice(0, 2).padEnd(2, "0") === 24 &&
    +numeros.slice(2, 4).padEnd(2, "0") > 0
  )
    return valor.slice(0, -1);
  if (numeros.slice(0, 2).padEnd(2, "0") > 24) return valor.slice(0, -1);
  if (numeros.slice(2, 4).padEnd(2, "0") > 59) return valor.slice(0, -1);
  return numeros
    .replace(/(\d{2})(\d{1})/, "$1:$2")
    .replace(/(\d{2})(\d{2})/, "$1:$2");
};

export const formatDate = (valor) => {
  if (!valor) return "";
  if (valor.length > 2) {
    valor = valor.replace(/^(\d{2})(\d)/g, "$1/$2");
  }
  if (valor.length > 5) {
    valor = valor.replace(/^(\d{2})\/(\d{2})(\d)/g, "$1/$2/$3");
  }
  return valor.substring(0, 10);
};

export const formatMoney = (valor, type = "normal") => {
  if (!valor) return "0.00";

  const numeros = valor.toString().replace(/\D/g, "");

  const numeroFormatado = (parseInt(numeros, 10) / 100).toFixed(2);

  return type === "normal"
    ? numeroFormatado
    : `R$ ${numeroFormatado}`.replace(".", ",");
};

export const formatCNPJ = (value) => {
  // Remove tudo que não for número
  let digits = value?.replace(/\D/g, "");
  if (!value) return "";

  // Limita ao formato máximo (14 dígitos para CNPJ)
  digits = digits.slice(0, 14);

  // Aplica a formatação XX.XXX.XXX/XXXX-XX
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2") // Adiciona o primeiro ponto
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3") // Adiciona o segundo ponto
    .replace(/\.(\d{3})(\d)/, ".$1/$2") // Adiciona a barra
    .replace(/(\d{4})(\d)/, "$1-$2"); // Adiciona o hífen
};

export const formatCEP = (value) => {
  // Remove tudo que não for número
  let digits = value?.replace(/\D/g, "");
  if (!value) return "";

  // Limita ao formato máximo (8 dígitos para CEP)
  digits = digits.slice(0, 8);

  // Aplica a formatação XXXXX-XXX
  return digits.replace(/(\d{5})(\d)/, "$1-$2");
};

export const formatCPF = (value) => {
  // Remove tudo que não for número
  let digits = value?.replace(/\D/g, "");
  if (!value) return "";

  // Limita ao formato máximo (11 dígitos para CPF)
  digits = digits.slice(0, 11);

  // Aplica a formatação XXX.XXX.XXX-XX
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2") // primeiro ponto
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3") // segundo ponto
    .replace(/\.(\d{3})(\d)/, ".$1-$2"); // hífen
};

export const formatPhone = (value) => {
  // Remove tudo que não for número
  let digits = value?.replace(/\D/g, "");
  if (!value) return "";
  // Garante que o número tenha o código do país
  if (!digits.startsWith("5")) {
    digits = "55" + digits;
  }

  // Limita ao formato máximo (+55 99 99999 9999)
  digits = digits.slice(0, 13);

  // Aplica a formatação
  return digits
    .replace(/^(\d{2})(\d)/, "+$1 $2") // Adiciona o código do país e separa DDD
    .replace(/(\d{2}) (\d{2})(\d)/, "$1 $2 $3") // Separa o DDD
    .replace(/(\d{5})(\d{1,4})$/, "$1 $2"); // Separa os últimos dígitos
};

export const formatCardInfo = (value, campo = "numero") => {
  if (!value) return "";

  let digits = value.replace(/\D/g, ""); // Remove caracteres não numéricos

  if (campo === "numero") {
    digits = digits.slice(0, 16); // Limita a 16 dígitos
    return digits.replace(/(\d{4})/g, "$1 ").trim(); // Formato 0000 0000 0000 0000
  }

  if (campo === "data") {
    digits = digits.slice(0, 4); // Limita a 4 dígitos (MMYY)

    // Permite apagar corretamente sem travar no "/"
    if (value.length < digits.length) return value;

    if (digits.length >= 2) {
      let month = parseInt(digits.slice(0, 2), 10);
      if (month < 1 || month > 12) return digits.slice(0, 1); // Evita meses inválidos
    }

    if (digits.length === 4) {
      let year = parseInt(digits.slice(2, 4), 10);
      const attYear = new Date().getFullYear() % 100; // Ano atual (últimos 2 dígitos)
      if (year < attYear) return value.slice(0, value.length - 1); // Evita anos passados
    }

    return digits.length > 2
      ? `${digits.slice(0, 2)}/${digits.slice(2)}`
      : digits; // Formato MM/YY
  }

  return digits; // Retorna apenas os números caso `campo` seja inválido
};

export const Saudacao = () => {
  const hora = new Date().getHours();

  if (hora < 12) {
    return "Bom dia!";
  } else if (hora < 18) {
    return "Boa tarde!";
  } else {
    return "Boa noite!";
  }
};

export const formatNumberToWords = (num) => {
  if (num < 100) return "vários";
  if (num < 1000) return "centenas";

  if (num < 10000) {
    return `${Math.floor(num / 1000)} mil`;
  }

  if (num < 1000000) {
    return `${(num / 1000).toFixed(0)} mil`;
  }

  if (num < 1000000000) {
    return `${(num / 1000000).toFixed(0)} milhões`;
  }
};

export const setLocalItem = (key, value) => {
  if (typeof value === "object" || Array.isArray(value)) {
    value = JSON.stringify(value); // Serializa se for um objeto ou array
  } else if (typeof value === "boolean" || typeof value === "number") {
    value = String(value); // Converte booleanos e números para string
  }
  window.localStorage.setItem(key, value); // Armazena o item como uma string no localStorage
};

export const getLocalItem = (key) => {
  const item = window.localStorage.getItem(key);
  if (item === null || item === "/login") return null;

  try {
    const parsed = JSON.parse(item);
    return parsed; // Retorna o valor parseado se for possível
  } catch (e) {
    return item; // Retorna o item original se o parse falhar (string, número ou booleano)
  }
};
export const removeLocalItem = (key) => {
  window.localStorage.removeItem(key);
};

export const primeiraMaiuscula = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export function isAllUppercase(str) {
  const onlyLetters = str.replace(/[^a-zA-Z]/g, "");
  return onlyLetters === onlyLetters.toUpperCase();
}

export function diferencaEmMinutos(dataInicial, dataFinal) {
  const inicio = new Date(dataInicial);
  const fim = new Date(dataFinal);

  const diffMs = fim - inicio;
  const diffMin = Math.floor(diffMs / 1000 / 60);
  return diffMin;
}

export const getStatus = (status) => {
  switch (status) {
    case "PENDING":
      return {
        color: "primary",
        valor: "Agendado",
        hexa: "#1976d2",
      };
    case "NOT_ATTEND":
      return {
        color: "error",
        valor: "Não Compareceu",
        hexa: "#d32f2f",
      };
    case "CANCELLED":
      return {
        color: "warning",
        valor: "Cancelado",
        hexa: "#ed6c02",
      };
    case "OK":
      return {
        color: "success",
        valor: "Concluído",
        hexa: "#2e7d32",
      };
    default:
      return {
        hexa: "#1976d2",
        color: "warning",
        valor: "Não atendido",
      };
  }
};

export function normalizeHour(horario, direcao = "up") {
  const [horaStr, minutoStr] = horario.split(":");
  const hora = parseInt(horaStr, 10);
  const minuto = parseInt(minutoStr, 10);

  if (direcao === "up") {
    return minuto > 0 ? hora + 1 : hora;
  } else if (direcao === "down") {
    return hora;
  }

  throw new Error('Parâmetro "direcao" deve ser "up" ou "down"');
}

export function formatDataToString(dataISO, allow) {
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
  const data = new Date(dataISO);

  data.setHours(data.getHours() - 3);
  const [ano, mes, dia] = data.toISOString().split("T")[0].split("-");
  const temp = {
    ano,
    mes: meses[parseInt(mes, 10) - 1],
    dia,
  };
  if (!allow)
    return `${dia} de ${meses[parseInt(mes, 10) - 1].slice(0, 3)}. de ${ano}`;
  return allow.map((item) => temp[item]).join(" de ");
}

export function gerarGradient(hex) {
  // Função auxiliar para converter HEX para RGBA
  function hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  const cor1 = hexToRgba("#363636", 0.4); // cor de fundo escura
  const cor2 = hexToRgba(hex, 0.4); // cor base com opacidade
  const cor3 = hexToRgba(hex, 0.3); // mesma cor com mais opacidade

  return `linear-gradient(-90deg, ${cor1} 0%, ${cor2} 85%, ${cor3} 100%)`;
}

export function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

export const getDominantColorFromURL = (imageUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        ).data;

        let r = 0,
          g = 0,
          b = 0,
          count = 0;

        for (let i = 0; i < imageData.length; i += 40) {
          r += imageData[i];
          g += imageData[i + 1];
          b += imageData[i + 2];
          count++;
        }

        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        const hex = `#${[r, g, b]
          .map((x) => x.toString(16).padStart(2, "0"))
          .join("")}`;
        resolve(hex);
      } catch (err) {
        console.warn("Erro ao acessar pixels (possível CORS)", err);
        resolve("#363636"); // fallback se CORS bloquear
      }
    };

    img.onerror = (err) => {
      console.warn("Erro ao carregar imagem (URL quebrada ou bloqueada)", err);
      resolve("#363636"); // fallback se imagem quebrar
    };
  });
};

export async function validarCampos(tipo, dados, componentValidations) {
  const regras = componentValidations[tipo];

  if (!regras) throw new Error("Tipo inválido");

  for (const { campo, validacoes, label } of regras) {
    const valor = dados[campo];
    const listaValidacoes = validacoes.split(",").map((v) => v.trim());

    for (const v of listaValidacoes) {
      if (
        v === "required" &&
        (valor === undefined || valor === "" || valor === null)
      ) {
        throw new Error(`${label || primeiraMaiuscula(campo)} é obrigatório.`);
      }

      if (v.startsWith("minLength(")) {
        const min = parseInt(v.match(/\d+/)[0], 10);
        if (!valor || valor.length < min) {
          throw new Error(
            `${
              label || primeiraMaiuscula(campo)
            } deve ter no mínimo ${min} caracteres.`
          );
        }
      }
      if (v === "email" && valor && !validator.isEmail(valor)) {
        throw new Error(`${label || primeiraMaiuscula(campo)} inválido`);
      }

      if (
        v === "telefone" &&
        valor &&
        !validator.isMobilePhone(valor.replace(/\D/g, ""), "pt-BR")
      ) {
        throw new Error(`${label || primeiraMaiuscula(campo)} inválido`);
      }

      if (v.startsWith("equal(")) {
        const outroCampo = v.match(/\(([^)]+)\)/)[1];
        if (valor !== dados[outroCampo]) {
          throw new Error(
            `${primeiraMaiuscula(label || campo)} deve ser igual a ${(
              regras.find((r) => r.campo === outroCampo)?.label || outroCampo
            ).toLowerCase()}.`
          );
        }
      }
    }
  }
}
