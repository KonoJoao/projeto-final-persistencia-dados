import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardMedia,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Typography,
  Chip,
  Alert,
} from "@mui/material";
import { CloudUpload, Delete, Clear } from "@mui/icons-material";
import axios from "axios";

const ImageUploader = ({
  endpoint,
  getFileName,
  maxFiles = 10,
  acceptedFormats = ["image/jpeg", "image/png", "image/webp"],
  maxSizeMB = 5,
  onSuccess,
  onError,
  additionalData = {},
  fieldName = "fotos",
  token,
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // Validar arquivo
  const validateFile = (file) => {
    if (!acceptedFormats.includes(file.type)) {
      return `Formato não aceito: ${file.type}. Use ${acceptedFormats.join(
        ", "
      )}`;
    }
    if (file.size > maxSizeBytes) {
      return `Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(
        2
      )}MB. Máximo: ${maxSizeMB}MB`;
    }
    return null;
  };

  // Manipular seleção de arquivos
  const handleFileSelect = (event) => {
    setError(null);
    const files = Array.from(event.target.files);

    if (selectedFiles.length + files.length > maxFiles) {
      setError(`Você pode enviar no máximo ${maxFiles} fotos`);
      return;
    }

    const validFiles = [];
    const errors = [];
    let loadedCount = 0;

    files.forEach((file, index) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
        return;
      }

      validFiles.push(file);

      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreview = {
          file,
          preview: reader.result,
          name: getFileName
            ? getFileName(file, selectedFiles.length + index)
            : file.name,
        };

        loadedCount++;

        // Atualizar previews usando função callback para garantir estado correto
        setPreviews((prev) => [...prev, newPreview]);

        // Quando todos os arquivos forem carregados, atualizar selectedFiles
        if (loadedCount === validFiles.length) {
          setSelectedFiles((prev) => [...prev, ...validFiles]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (errors.length > 0) {
      setError(errors.join("\n"));
    }
  };

  // Remover arquivo
  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  // Fazer upload
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError("Selecione pelo menos uma imagem");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();

      // Adicionar arquivos renomeados
      selectedFiles.forEach((file, index) => {
        const fileName = getFileName ? getFileName(file, index) : file.name;
        const renamedFile = new File([file], fileName, { type: file.type });
        formData.append(fieldName, renamedFile);
      });

      // Adicionar dados adicionais
      Object.keys(additionalData).forEach((key) => {
        formData.append(key, additionalData[key]);
      });

      // Fazer requisição com token
      const headers = {};
      console.log(token);
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const { data } = await axios.post(endpoint, formData, {
        headers,
      });

      setUploadProgress(100);

      // Limpar estado
      setSelectedFiles([]);
      setPreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (onSuccess) {
        onSuccess(data);
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      setError(error.message);
      if (onError) {
        onError(error);
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const clearAll = () => {
    setSelectedFiles([]);
    setPreviews([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip
            label={`Máximo: ${maxFiles} fotos`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={acceptedFormats
              .map((f) => f.split("/")[1])
              .join(", ")
              .toUpperCase()}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`Até ${maxSizeMB}MB cada`}
            size="small"
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Upload Area */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: "center",
          border: "2px dashed",
          borderRadius: "10px",
          borderColor:
            uploading || selectedFiles.length >= maxFiles
              ? "grey.300"
              : "primary.main",
          bgcolor:
            uploading || selectedFiles.length >= maxFiles
              ? "grey.50"
              : "background.paper",
          cursor:
            uploading || selectedFiles.length >= maxFiles
              ? "not-allowed"
              : "pointer",
          transition: "all 0.3s",
          "&:hover": {
            borderColor:
              uploading || selectedFiles.length >= maxFiles
                ? "grey.300"
                : "primary.dark",
            bgcolor:
              uploading || selectedFiles.length >= maxFiles
                ? "grey.50"
                : "primary.50",
          },
        }}
        onClick={() =>
          !uploading &&
          selectedFiles.length < maxFiles &&
          fileInputRef.current?.click()
        }
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(",")}
          onChange={handleFileSelect}
          disabled={uploading || selectedFiles.length >= maxFiles}
          style={{ display: "none" }}
        />

        <CloudUpload sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />

        <Typography variant="body1" color="text.secondary">
          {selectedFiles.length >= maxFiles
            ? "Limite de fotos atingido"
            : "Clique para selecionar ou arraste as imagens para upload"}
        </Typography>
      </Paper>

      {/* Preview Grid */}
      {previews.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Imagens selecionadas ({selectedFiles.length}/{maxFiles})
          </Typography>

          <Grid container spacing={2}>
            {previews.map((item, index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    position: "relative",
                    paddingTop: "100%",
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "grey.300",
                    borderRadius: 2,
                    "&:hover .preview-overlay": {
                      opacity: 1,
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    image={item.preview}
                    alt={`Preview ${index + 1}`}
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />

                  <Box
                    className="preview-overlay"
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
                      p: 1,
                      opacity: 0,
                      transition: "opacity 0.3s",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "white",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={item.name}
                    >
                      {item.name}
                    </Typography>

                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <IconButton
                        size="small"
                        onClick={() => removeFile(index)}
                        disabled={uploading}
                        sx={{
                          bgcolor: "error.main",
                          color: "white",
                          "&:hover": {
                            bgcolor: "error.dark",
                          },
                          "&:disabled": {
                            bgcolor: "grey.400",
                            color: "grey.600",
                          },
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Progress */}
      {uploading && (
        <Box sx={{ mt: 3 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 1 }}
          >
            Enviando...
          </Typography>
        </Box>
      )}

      {/* Action Buttons */}
      {selectedFiles.length > 0 && (
        <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "center" }}>
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={handleUpload}
            disabled={uploading}
            size="large"
            disableElevation
          >
            {uploading ? "Enviando..." : `Fazer Upload`}
          </Button>

          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={clearAll}
            disabled={uploading}
            size="large"
          >
            Limpar
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ImageUploader;
