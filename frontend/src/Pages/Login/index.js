import {
  Button,
  Box,
  Grid,
  Stack,
  Typography,
  Alert,
  Snackbar,
  Tabs,
  Tab,
} from "@mui/material";
import Banner from "../../Assets/Login/banner.png";
import { CustomInput } from "../../Components/Custom";
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001/users";

export default function Login({ page }) {
  const navigate = useNavigate();
  const [loginForm, setLoginForm] = useState({
    identifier: "joao@example.com",
    senha: "senha123",
  });
  const [registerForm, setRegisterForm] = useState({
    login: "",
    email: "",
    senha: "",
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleLoginInputChange = (field, value) => {
    setLoginForm({ ...loginForm, [field]: value });
  };

  const handleRegisterInputChange = (field, value) => {
    setRegisterForm({ ...registerForm, [field]: value });
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/login`, loginForm);

      if (response.data.access_token) {
        localStorage.setItem("accessType", response.data.role);
        localStorage.setItem("token", response.data.access_token);
        showSnackbar("Login realizado com sucesso!");
        setTimeout(() => {
          navigate("/dashboard/pontos-turisticos");
          setLoading(false);
        }, 1500);
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Erro ao fazer login. Verifique suas credenciais.";
      showSnackbar(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/register`, registerForm);

      if (response.data.access_token) {
        localStorage.setItem("accessType", response.data.role);
        localStorage.setItem("token", response.data.access_token);
        showSnackbar("Cadastro realizado com sucesso!");
        setTimeout(() => {
          navigate("/");
          setLoading(false);
        }, 1500);
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Erro ao fazer cadastro. Tente novamente.";
      showSnackbar(message, "error");
    }
  };

  return (
    <Grid container>
      <Grid
        size={{ xs: 0, md: 7 }}
        sx={{
          justifyContent: "center",
          display: { xs: "none", md: "flex" },
          alignItems: "center",
        }}
      >
        <img src={Banner} style={{ borderRadius: "10px" }} />
      </Grid>
      <Grid
        size={{ xs: 12, md: 5 }}
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          className="show-box-outlined"
          sx={{ minWidth: { xs: "90%", md: "350px" } }}
        >
          {page === "login" ? (
            <Stack spacing={3} sx={{ p: "36px 24px", pb: 4 }}>
              <Typography variant="h6" sx={{ textAlign: "center", pb: 4 }}>
                Acesse sua conta
              </Typography>
              <CustomInput
                placeholder="Email ou Login"
                fullWidth
                value={loginForm.identifier}
                onChange={(e) =>
                  handleLoginInputChange("identifier", e.target.value)
                }
              />
              <CustomInput
                placeholder="Senha"
                type="password"
                fullWidth
                value={loginForm.senha}
                onChange={(e) =>
                  handleLoginInputChange("senha", e.target.value)
                }
              />

              <Typography variant="body2" sx={{ mb: 3 }}>
                <Link to="/logon">Não possui uma conta? Crie uma</Link>
              </Typography>
              <Button
                disableElevation
                variant="contained"
                fullWidth
                size="large"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </Stack>
          ) : (
            <Stack spacing={3} sx={{ p: "16px 24px", pb: 4 }}>
              <Typography variant="h6" sx={{ textAlign: "center", pb: 2 }}>
                Crie sua conta
              </Typography>
              <CustomInput
                label="Nome de usuário"
                fullWidth
                value={registerForm.login}
                onChange={(e) =>
                  handleRegisterInputChange("login", e.target.value)
                }
              />
              <CustomInput
                label="Email"
                fullWidth
                value={registerForm.email}
                onChange={(e) =>
                  handleRegisterInputChange("email", e.target.value)
                }
              />
              <CustomInput
                label="Senha"
                type="password"
                fullWidth
                value={registerForm.senha}
                onChange={(e) =>
                  handleRegisterInputChange("senha", e.target.value)
                }
              />
              <Typography variant="body2" sx={{ mb: 3 }}>
                <Link to="/login">Já possui uma conta? Acesse-a</Link>
              </Typography>
              <Button
                disableElevation
                variant="contained"
                fullWidth
                size="large"
                onClick={handleRegister}
                disabled={loading}
              >
                {loading ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </Stack>
          )}
        </Box>
      </Grid>

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
    </Grid>
  );
}
