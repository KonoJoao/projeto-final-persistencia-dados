import React, { useEffect, useState } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import {
  Badge,
  Box,
  Button,
  Card,
  CardActionArea,
  Grid,
  Tooltip,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import notFounImage from "./not-found.png";

export const Rows = ({
  items = [],
  avatarProps = {},
  onSelect,
  selectedItems,
  multipleSelect = false,
  onDelete,
  deleteMessage,
  oneTapMode, // não persiste a seleção, apenas clique
  sx,
  unSelectMode = false,
  styleSelect,
  actions,
  disabled = false,
  collapse = false,
  distribution = items.length ?? 1,
  focusInItem = true,
  checkmode = true,
}) => {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (Array.isArray(selectedItems) && selectedItems.length)
      setSelected(selectedItems || []);
    else setSelected([]);
  }, [selectedItems]);

  const handleSelect = async (item, campo) => {
    try {
      let updatedSelection;
      if (multipleSelect) {
        updatedSelection = selected.some((op) => op.id === item.id)
          ? selected.filter((op) => op.id !== item.id)
          : [...selected, item];
      } else {
        updatedSelection =
          unSelectMode &&
          Array.isArray(selected) &&
          selected?.some((op) => op.id === item.id)
            ? []
            : [item];
      }
      if (oneTapMode) onSelect(item, campo);

      if (onSelect && !oneTapMode)
        await onSelect(multipleSelect ? updatedSelection : item, campo);
      if (!selectedItems && !oneTapMode) setSelected(updatedSelection);
    } catch (error) {}
  };

  return (
    <List
      sx={{
        m: 0,
        p: 0,
      }}
    >
      <Grid container spacing={1} sx={{ display: "flex", flexWrap: "wrap" }}>
        {items.map((item) => (
          <Grid
            size={collapse ? { xs: 12, md: 12 / distribution } : 12}
            key={item.id}
          >
            <Badge
              badgeContent={item.notification ?? null}
              sx={{ width: "100%" }}
            >
              <CardActionArea
                key={item.id}
                disabled={disabled || item.disabled}
                sx={{ borderRadius: "10px !important" }}
              >
                <Card
                  onClick={() =>
                    item.action ? item.action() : handleSelect(item, item.campo)
                  }
                  elevation={0}
                  sx={{
                    ...sx,
                    ...item.sx,
                    ...(Array.isArray(selected) &&
                    selected?.some((opcao) => opcao.id === item.id)
                      ? {
                          ...(styleSelect
                            ? {
                                ...styleSelect,
                                border: "1px solid transparent",
                              }
                            : {
                                border: "1px solid rgb(134, 134, 134)",
                                background: "rgba(256,256,256,0.05)",
                              }),
                        }
                      : { border: "1px solid transparent" }),
                    position: "relative",
                  }}
                >
                  {Array.isArray(selected) &&
                    checkmode &&
                    focusInItem &&
                    selected?.some((opcao) => opcao.id === item.id) && (
                      <CheckCircleIcon
                        sx={{
                          position: "absolute",
                          top: "50%",
                          right: 15,
                          transform: "translateY(-50%)",
                        }}
                      />
                    )}
                  <ListItem
                    sx={{
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    {(item.icon || item.imagem) && (
                      <ListItemAvatar>
                        <Avatar
                          src={
                            item?.imagem?.includes("undefined")
                              ? notFounImage
                              : item.imagem
                          }
                          sx={{
                            bgcolor: "transparent",
                            color: "#fff !important",
                            width: 50,
                            height: 50,
                            ...avatarProps,
                            ...(item.avatarProps || {}),
                            mr: 2,
                          }}
                        >
                          {item.icon}
                        </Avatar>
                      </ListItemAvatar>
                    )}

                    <ListItemText
                      primary={
                        <Typography sx={{ fontSize: "18px" }}>
                          {item.titulo}
                        </Typography>
                      }
                      secondary={
                        <Typography sx={{ fontSize: "16px", mr: 3 }}>
                          {item.subtitulo}
                        </Typography>
                      }
                    />

                    {!checkmode &&
                      actions &&
                      actions.map((actionItem, index) =>
                        !actionItem.icon ? (
                          <Button
                            key={index}
                            color={actionItem.color || "primary"}
                            disableElevation
                            onClick={(e) => {
                              e.stopPropagation();
                              actionItem.action(item.id);
                            }}
                            variant="outlined"
                            sx={{
                              m: "0 5px",
                              border: "1px solid #484848",
                            }}
                          >
                            {actionItem.titulo}
                          </Button>
                        ) : (
                          <IconButton
                            key={index}
                            edge="end"
                            onClick={(e) => {
                              e.stopPropagation();
                              actionItem.action(item.id);
                            }}
                            sx={{
                              m: "0 5px",
                            }}
                          >
                            {actionItem.icon}
                          </IconButton>
                        )
                      )}

                    {onDelete && !item.noDelete && (
                      <Tooltip title={deleteMessage || "Remover"}>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item.id, item);
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </ListItem>
                </Card>
              </CardActionArea>
            </Badge>
            {item.renderDetails && (
              <Box
                sx={{
                  mt: 1.8,
                  height:
                    Array.isArray(selected) &&
                    selected.some((op) => op.id === item.id)
                      ? 240
                      : 0, // Ajuste o valor conforme necessário
                  overflow: "hidden",
                  width: "100%",
                  transition: "height 0.3s ease-in-out",
                }}
              >
                {item.renderDetails}
              </Box>
            )}
          </Grid>
        ))}
      </Grid>
    </List>
  );
};
