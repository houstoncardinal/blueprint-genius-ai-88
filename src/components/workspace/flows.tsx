import { ReactFlow, Background, Controls, MiniMap, MarkerType } from "@xyflow/react";
import type { Node, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMemo } from "react";
import type { Blueprint } from "@/lib/ai.server";

const KIND_COLORS: Record<string, { bg: string; border: string; fg: string }> = {
  client:   { bg: "#eef2ff", border: "#6366f1", fg: "#1e1b4b" },
  service:  { bg: "#e0f2fe", border: "#0ea5e9", fg: "#0c4a6e" },
  database: { bg: "#dcfce7", border: "#16a34a", fg: "#14532d" },
  external: { bg: "#fce7f3", border: "#db2777", fg: "#831843" },
  queue:    { bg: "#fef3c7", border: "#d97706", fg: "#78350f" },
  storage:  { bg: "#f3e8ff", border: "#9333ea", fg: "#581c87" },
  ai:       { bg: "#ffe4e6", border: "#e11d48", fg: "#881337" },
};

export function ArchitectureFlow({ architecture }: { architecture: Blueprint["architecture"] }) {
  const { nodes, edges } = useMemo(() => {
    const ns = architecture?.nodes ?? [];
    const cols = Math.ceil(Math.sqrt(Math.max(ns.length, 1)));
    const nodes: Node[] = ns.map((n, i) => {
      const c = KIND_COLORS[n.kind] ?? KIND_COLORS.service;
      return {
        id: n.id,
        position: { x: (i % cols) * 240 + 40, y: Math.floor(i / cols) * 160 + 40 },
        data: { label: (
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-wider opacity-70">{n.kind}</div>
            <div className="font-semibold leading-tight">{n.label}</div>
            <div className="mt-1 text-[11px] opacity-80 leading-snug">{n.description}</div>
          </div>
        ) },
        style: {
          background: c.bg,
          border: `1px solid ${c.border}`,
          borderRadius: 12,
          color: c.fg,
          padding: 10,
          width: 200,
          fontSize: 12,
          boxShadow: "0 4px 14px -6px rgba(15,23,42,0.10)",
        },
      };
    });
    const edges: Edge[] = (architecture?.edges ?? []).map((e, i) => ({
      id: `e${i}`,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: true,
      labelStyle: { fill: "#475569", fontSize: 10 },
      labelBgStyle: { fill: "rgba(255,255,255,0.9)" },
      style: { stroke: "#94a3b8" },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#64748b" },
    }));
    return { nodes, edges };
  }, [architecture]);

  return (
    <div className="h-[560px] w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
      >
        <Background gap={16} color="rgba(15,23,42,0.06)" />
        <MiniMap pannable zoomable maskColor="rgba(241,245,249,0.85)" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

export function DatabaseFlow({ database }: { database: Blueprint["database"] }) {
  const { nodes, edges } = useMemo(() => {
    const tables = database?.tables ?? [];
    const cols = Math.ceil(Math.sqrt(Math.max(tables.length, 1)));
    const nodes: Node[] = tables.map((t, i) => ({
      id: t.name,
      position: { x: (i % cols) * 300 + 40, y: Math.floor(i / cols) * 280 + 40 },
      data: {
        label: (
          <div className="text-left">
            <div className="border-b border-emerald-200 bg-emerald-50 px-2 py-1.5 font-mono text-xs font-semibold text-emerald-700">
              {t.name}
            </div>
            <div className="max-h-[200px] overflow-auto bg-white px-2 py-1.5 text-[11px] font-mono leading-relaxed text-slate-700">
              {t.columns.map((c) => (
                <div key={c.name} className="flex items-center justify-between gap-2">
                  <span className="truncate">
                    {c.pk ? "🔑 " : c.fk ? "🔗 " : ""}
                    {c.name}
                  </span>
                  <span className="opacity-60">{c.type}</span>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      style: {
        background: "#ffffff",
        border: "1px solid rgba(16,185,129,0.35)",
        borderRadius: 10,
        color: "#0f172a",
        padding: 0,
        width: 260,
        boxShadow: "0 6px 18px -8px rgba(15,23,42,0.12)",
      },
    }));
    const edges: Edge[] = [];
    tables.forEach((t) => {
      t.columns.forEach((c) => {
        if (c.fk) {
          const target = c.fk.split(".")[0];
          if (tables.some((tt) => tt.name === target)) {
            edges.push({
              id: `${t.name}-${c.name}-${target}`,
              source: t.name,
              target,
              label: c.name,
              labelStyle: { fill: "#047857", fontSize: 9 },
              labelBgStyle: { fill: "rgba(255,255,255,0.9)" },
              style: { stroke: "#10b981" },
              markerEnd: { type: MarkerType.ArrowClosed, color: "#059669" },
            });
          }
        }
      });
    });
    return { nodes, edges };
  }, [database]);

  return (
    <div className="h-[640px] w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesConnectable={false}
      >
        <Background gap={16} color="rgba(15,23,42,0.06)" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
