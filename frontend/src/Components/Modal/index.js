import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import { Container, Typography } from "@mui/material";
import { isMobile } from "../Functions";
import { LoadingBox } from "../Custom";

const full = {
  [undefined]: { xs: false, md: false, sec: false },
  all: { xs: true, md: true, sec: true },
  xs: { xs: true, md: false, sec: isMobile },
  md: { xs: false, md: true, sec: !isMobile },
};

export const Modal = ({
  open,
  onClose,
  children,
  maxWidth = "md",
  titulo,
  fullScreen,
  loading = false,
  buttons = [],
  sx,
  paperProps = {},
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      fullScreen={full[fullScreen].sec}
      PaperProps={{
        sx: {
          ...sx,
          borderRadius: full[fullScreen].sec ? 0 : "10px",
          position: "relative",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {titulo && <Typography variant="h6">{titulo}</Typography>}

        {onClose && (
          <IconButton aria-label="close" onClick={onClose} color="GrayText">
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      {loading ? (
        <Container
          maxWidth={maxWidth}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            minHeight: "200px",
            zIndex: 1,
          }}
        >
          <LoadingBox message="Carregando..." />
        </Container>
      ) : (
        <>
          <DialogContent style={paperProps.style}>
            <Container
              maxWidth={maxWidth}
              sx={{
                height: "100%",
                py: 2,
                px: 0,
                borderRadius: { xs: 0, md: "0" },
              }}
            >
              {children}
            </Container>
          </DialogContent>{" "}
          {buttons.length ? (
            <DialogActions
              sx={{
                display: "flex",
                alignItems: "start",
                justifyContent: "end",
                flexWrap: { xs: "wrap", md: "nowrap" },
                gap: 1,
                m: 1,
              }}
            >
              {buttons &&
                buttons.map((button) => (
                  <Button
                    size="large"
                    color={button.color || "primary"}
                    disableElevation
                    disabled={button.disabled}
                    onClick={button.action}
                    icon={button.icon}
                    variant={button.variant ? button.variant : "outlined"}
                    sx={button.sx}
                  >
                    {button.titulo || button.title}
                  </Button>
                ))}
            </DialogActions>
          ) : null}
        </>
      )}
    </Dialog>
  );
};
