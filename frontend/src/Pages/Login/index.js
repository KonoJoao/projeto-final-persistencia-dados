import { Button, TextField, Box, Grid, Stack, Typography } from "@mui/material";
import Banner from "../../Assets/Login/banner.png";
import { CustomInput } from "../../Components/Custom";
import { useState } from "react";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

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
        <Box className="show-box-outlined">
          <Stack spacing={4} sx={{ p: "16px 8px", minWidth: "300px" }}>
            <Typography variant="h6" sx={{ textAlign: "center", pb: 5 }}>
              Acesse sua conta
            </Typography>
            <CustomInput label="Email" fullWidth />
            <CustomInput label="Senha" type="password" fullWidth />
            <Button disableElevation variant="contained" fullWidth size="large">
              Entrar
            </Button>{" "}
          </Stack>
        </Box>
      </Grid>
    </Grid>
  );
}
