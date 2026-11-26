import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Typography,
  Button,
} from "@mui/material";

import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AccountTreeIcon from "@mui/icons-material/AccountTree";

import { useSearchParams } from "react-router-dom";

import { CommitHistoryAdapterBranchSupport } from "../../../modules/TDDCycles-Visualization/repository/CommitHistoryAdapterBranchSupport";

import { GetTopologyGraphBranchSupport } from "../../../modules/TDDCycles-Visualization/application/GetTopologyGraphBranchSupport";

import type {
  TopologyGraphResponseBranchSupport,
} from "../../../modules/TDDCycles-Visualization/domain/ITopologyGraphBranchSupport";

import {
  buildGitGraphLayout,
  type GitGraphNode,
} from "../../../utils/branchGraph.utils";

// =====================================================
// CONFIGURACIÓN
// =====================================================

interface GitTopologyChartProps {
  selectedBranch?: string;
}

// Instancia compartida del adaptador.
const repository = new CommitHistoryAdapterBranchSupport();

// Colores de los carriles.
const BRANCH_COLORS = [
  "#2563EB",
  "#16A34A",
  "#9333EA",
  "#EA580C",
  "#0891B2",
  "#DB2777",
  "#4F46E5",
  "#CA8A04",
];

function getBranchColor(index: number) {
  return BRANCH_COLORS[
    index % BRANCH_COLORS.length
  ];
}

function getCommitUrl(
  owner: string,
  repo: string,
  sha: string
) {
  return `https://github.com/${encodeURIComponent(
    owner
  )}/${encodeURIComponent(repo)}/commit/${encodeURIComponent(
    sha
  )}`;
}

function getConclusionLabel(
  conclusion: string | null
) {
  if (conclusion === "success") {
    return "Pruebas exitosas";
  }

  if (conclusion === "failure") {
    return "Pruebas fallidas";
  }

  if (conclusion === "cancelled") {
    return "Pruebas canceladas";
  }

  if (conclusion === "error") {
    return "Error de ejecución";
  }

  return "Sin resultado registrado";
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

function GitTopologyChart({
  selectedBranch = "",
}: Readonly<GitTopologyChartProps>) {

  const [searchParams] = useSearchParams();

  const owner = searchParams.get("repoOwner") ?? "";
  const repoName = searchParams.get("repoName") ?? "";

  const [topology, setTopology] =
    useState<TopologyGraphResponseBranchSupport | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [selectedSha, setSelectedSha] =
    useState<string | null>(null);

  // ===================================================
  // CONSULTA A BRANCH SUPPORT
  // ===================================================

  useEffect(() => {
    let active = true;

    const loadTopology = async () => {
      setLoading(true);
      setError(null);
      setTopology(null);
      setSelectedSha(null);

      if (!owner || !repoName) {
        setError(
          "No se ha identificado el repositorio."
        );
        setLoading(false);
        return;
      }

      try {
        const useCase =
          new GetTopologyGraphBranchSupport(
            repository
          );

        const result = await useCase.execute(
          owner,
          repoName
        );

        if (!active) return;

        setTopology(result);

      } catch (err: unknown) {
        if (!active) return;

        console.error(
          "Error loading Git topology:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "No fue posible cargar la topología."
        );

      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadTopology();

    return () => {
      active = false;
    };

  }, [owner, repoName]);

  // ===================================================
  // PREPARACIÓN DE LA GRÁFICA
  // ===================================================

  const layout = useMemo(() => {
    if (!topology) return null;

    return buildGitGraphLayout(topology);
  }, [topology]);

  const selectedCommit = useMemo(() => {
    if (!layout || !selectedSha) return null;

    return layout.nodes.find(
      (node) => node.sha === selectedSha
    ) ?? null;

  }, [layout, selectedSha]);

  // ===================================================
  // APARIENCIA SEGÚN LA RAMA
  // ===================================================

  const isNodeHighlighted = (
    node: GitGraphNode
  ) => {
    if (!selectedBranch || selectedBranch === "all") return true;

    return node.branches.includes(selectedBranch);
  };

  const isBranchSelected = (branch: string) =>
    selectedBranch === "all" || selectedBranch === branch;

  const getNodeColor = (
    node: GitGraphNode
  ) => {
    if (node.isMerge) {
      return "#EA580C";
    }

    if (node.conclusion === "failure") {
      return "#DC2626";
    }

    if (node.conclusion === "success") {
      return "#16A34A";
    }

    return getBranchColor(node.lane);
  };

  // ===================================================
  // ESTADOS DE CARGA Y ERROR
  // ===================================================

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 260,
          gap: 2,
        }}
      >
        <CircularProgress />

        <Typography>
          Cargando topología Git...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        data-testid="topology-error"
      >
        {error}
      </Alert>
    );
  }

  if (!layout || layout.nodes.length === 0) {
    return (
      <Alert
        severity="info"
        data-testid="topology-empty"
      >
        El repositorio no tiene commits disponibles
        para construir la topología.
      </Alert>
    );
  }

  // ===================================================
  // RENDERIZACIÓN
  // ===================================================

  return (
    <Box
      data-testid="git-topology-chart"
      sx={{
        width: "100%",
        marginTop: 3,
      }}
    >

      {/* Encabezado */}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          marginBottom: 2,
        }}
      >
        <AccountTreeIcon
          sx={{
            color: "#052845",
            fontSize: 30,
          }}
        />

        <Typography
          variant="h5"
          fontWeight="bold"
        >
          Topología de ramas Git
        </Typography>
      </Box>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ marginBottom: 2 }}
      >
        Cada círculo representa un commit.
        Las líneas representan relaciones
        padre-hijo. Los nodos naranjas
        representan commits con múltiples padres.
      </Typography>

      {/* Leyenda de ramas */}

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          marginBottom: 3,
        }}
      >
        {layout.branches.map(
          (branch, index) => (
            <Chip
              key={branch}
              label={branch}
              variant={isBranchSelected(branch) ? "filled" : "outlined"}
              sx={{
                borderColor: getBranchColor(index),
                color:
                  isBranchSelected(branch)
                    ? "#FFFFFF"
                    : getBranchColor(index),
                backgroundColor:
                  isBranchSelected(branch)
                    ? getBranchColor(index)
                    : "transparent",
              }}
            />
          )
        )}
      </Box>

      {/* Aviso sobre padres ausentes */}

      {layout.missingParents.length > 0 && (
        <Alert
          severity="warning"
          sx={{ marginBottom: 2 }}
        >
          Hay {layout.missingParents.length} commits
          padre que no están incluidos en la respuesta
          de la API. Sus conexiones no pueden dibujarse.
        </Alert>
      )}

      {/* ============================================
          GRÁFICA SVG
      ============================================ */}

      <Box
        sx={{
          width: "100%",
          overflowX: "auto",
          overflowY: "auto",
          border: "1px solid #E2E8F0",
          borderRadius: 1,
          backgroundColor: "#FFFFFF",
          padding: { xs: 0.5, sm: 1.5 },
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
        }}
      >
        <svg
          width={layout.width}
          height={layout.height}
          viewBox={
            `0 0 ${layout.width} ${layout.height}`
          }
          role="img"
          aria-label="Grafo de commits y ramas Git"
        >

          {/* Etiquetas de los carriles */}

          {layout.branches.map(
            (branch, index) => {
              const y = 90 + index * 90;

              return (
                <g key={`lane-${branch}`}>

                  <line
                    x1={80}
                    y1={y}
                    x2={layout.width - 30}
                    y2={y}
                    stroke={getBranchColor(index)}
                    strokeOpacity={0.16}
                    strokeDasharray="5 7"
                  />

                  <text
                    x={10}
                    y={y - 20}
                    fill={getBranchColor(index)}
                    fontSize="12"
                    fontWeight="bold"
                  >
                    {branch.length > 12
                      ? branch.substring(0, 12) + "…"
                      : branch}
                  </text>

                </g>
              );
            }
          )}

          {/* Conexiones entre commits */}

          {layout.edges.map((edge) => {
            const parent = layout.nodes.find(
              (node) =>
                node.sha === edge.parentSha
            );

            const child = layout.nodes.find(
              (node) =>
                node.sha === edge.childSha
            );

            if (!parent || !child) {
              return null;
            }

            const highlighted =
              isNodeHighlighted(parent) &&
              isNodeHighlighted(child);

            return (
              <path
                key={edge.id}
                d={edge.path}
                fill="none"
                stroke={
                  "#2563EB"
                }
                strokeWidth={
                  highlighted ? 2 : 1.5
                }
                strokeOpacity={
                  highlighted ? 0.8 : 0.12
                }
              />
            );
          })}

          {/* Nodos */}

          {layout.nodes.map((node) => {
            const highlighted =
              isNodeHighlighted(node);

            const isSelected =
              selectedSha === node.sha;

            return (
              <g
                key={node.sha}
                data-testid={
                  `topology-node-${node.sha}`
                }
                opacity={highlighted ? 1 : 0.2}
                style={{
                  cursor: "pointer",
                }}
                onClick={() =>
                  setSelectedSha(node.sha)
                }
              >

                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? 10 : 7}
                  fill={getNodeColor(node)}
                  stroke={
                    isSelected
                      ? "#111827"
                      : "#FFFFFF"
                  }
                  strokeWidth={isSelected ? 2.5 : 1.5}
                />

                <text
                  x={node.x}
                  y={node.y + 25}
                  fontSize="9"
                  textAnchor="middle"
                  fill="#334155"
                >
                  {node.shortSha}
                </text>

                <title>
                  {[
                    `Commit: ${node.sha}`,
                    `Mensaje: ${node.message}`,
                    `Autor: ${node.author}`,
                    `Ramas: ${node.branches.join(", ")}`,
                    `Tests: ${node.testRuns}`,
                  ].join("\n")}
                </title>

              </g>
            );
          })}

        </svg>
      </Box>

      {/* ============================================
          INFORMACIÓN DEL COMMIT SELECCIONADO
      ============================================ */}

      {selectedCommit && (
        <Card
          variant="outlined"
          sx={{
            marginTop: 3,
            borderRadius: 2,
          }}
        >
          <CardContent>

            <Typography
              variant="h6"
              gutterBottom
            >
              Detalles del commit
            </Typography>

            <Divider sx={{ marginBottom: 2 }} />

            <Typography
              variant="body2"
              sx={{ marginBottom: 1 }}
            >
              <strong>SHA:</strong>{" "}
              {selectedCommit.sha}
            </Typography>

            <Typography
              variant="body2"
              sx={{ marginBottom: 1 }}
            >
              <strong>Mensaje:</strong>{" "}
              {selectedCommit.message}
            </Typography>

            <Typography
              variant="body2"
              sx={{ marginBottom: 1 }}
            >
              <strong>Autor:</strong>{" "}
              {selectedCommit.author}
            </Typography>

            <Typography
              variant="body2"
              sx={{ marginBottom: 1 }}
            >
              <strong>Fecha:</strong>{" "}
              {selectedCommit.date.toLocaleString()}
            </Typography>

            <Typography
              variant="body2"
              sx={{ marginBottom: 1 }}
            >
              <strong>Ramas:</strong>{" "}
              {selectedCommit.branches.join(", ") ||
                "No especificadas"}
            </Typography>

            <Typography
              variant="body2"
              sx={{ marginBottom: 1 }}
            >
              <strong>Padres:</strong>{" "}
              {selectedCommit.parents.length > 0
                ? selectedCommit.parents
                    .map((sha) => sha.substring(0, 7))
                    .join(", ")
                : "Commit raíz"}
            </Typography>

            <Typography
              variant="body2"
              sx={{ marginBottom: 1 }}
            >
              <strong>Ejecuciones de pruebas:</strong>{" "}
              {selectedCommit.testRuns}
            </Typography>

            <Typography
              variant="body2"
              sx={{ marginBottom: 1 }}
            >
              <strong>Cobertura:</strong>{" "}
              {selectedCommit.coverage !== null
                ? `${selectedCommit.coverage}%`
                : "No disponible"}
            </Typography>

            <Typography
              variant="body2"
              sx={{ marginBottom: 2 }}
            >
              <strong>Resultado:</strong>{" "}
              {getConclusionLabel(
                selectedCommit.conclusion
              )}
            </Typography>

            {selectedCommit.isMerge && (
              <Chip
                label="Commit de merge"
                color="warning"
                size="small"
                sx={{ marginBottom: 2 }}
              />
            )}

            <Box>
              <Button
                variant="contained"
                startIcon={<OpenInNewIcon />}
                onClick={() => {
                  window.open(
                    getCommitUrl(
                      owner,
                      repoName,
                      selectedCommit.sha
                    ),
                    "_blank",
                    "noopener,noreferrer"
                  );
                }}
              >
                Ver commit en GitHub
              </Button>
            </Box>

          </CardContent>
        </Card>
      )}

      {/* Resumen */}

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          marginTop: 3,
        }}
      >
        <Chip
          label={`Commits: ${layout.nodes.length}`}
        />

        <Chip
          label={`Ramas: ${layout.branches.length}`}
        />

        <Chip
          label={`Relaciones: ${layout.edges.length}`}
        />

        <Chip
          label={
            `Merges: ${
              layout.nodes.filter(
                (node) => node.isMerge
              ).length
            }`
          }
        />
      </Box>

    </Box>
  );
}

export default GitTopologyChart;
