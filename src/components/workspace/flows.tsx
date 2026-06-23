import { ReactFlow, Background, Controls, MiniMap, MarkerType } from "@xyflow/react";
import type { Node, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMemo } from "react";
import type { Blueprint } from "@/lib/ai.server";

const KIND_COLORS: Record<string, { bg: string; border: string }> = {
  client:   { bg: "rgba(99, 102, 241, 0.18)", border: "#6366f1" },
  service:  { bg: "rgba(14, 165, 233, 0.18)", border: "#0ea5e9" },
  database: { bg: "rgba(34, 197, 94, 0.18)",  border: "#22c55e" },
  external: { bg: "rgba(244, 114, 182, 0.18)", border: "#f472b6" },
  queue:    { bg: "rgba(234, 179, 8, 0.18)",  border: "#eab308" },
  storage:  { bg: "rgba(168, 85, 247, 0.18)", border: "#a855f7" },
  ai:       { bg: "rgba(236, 72, 153, 0.18)", border: "#ec4899" },
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
          color: "#fff",
          padding: 10,
          width: 200,
          fontSize: 12,
        },
      };
    });
    const edges: Edge[] = (architecture?.edges ?? []).map((e, i) => ({
      id: `e${i}`,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: true,
      labelStyle: { fill: "#cbd5e1", fontSize: 10 },
      labelBgStyle: { fill: "rgba(2,6,23,0.7)" },
      style: { stroke: "rgba(148,163,184,0.6)" },
      markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(148,163,184,0.8)" },
    }));
    return { nodes, edges };
  }, [architecture]);

  return (
    <div className="h-[560px] w-full overflow-hidden rounded-xl border border-border/60 bg-background/40">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
      >
        <Background gap={16} color="rgba(148,163,184,0.15)" />
        <MiniMap pannable zoomable maskColor="rgba(2,6,23,0.6)" />
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
            <div className="border-b border-white/15 px-2 py-1.5 font-mono text-xs font-semibold text-emerald-300">
              {t.name}
            </div>
            <div className="max-h-[200px] overflow-auto px-2 py-1.5 text-[11px] font-mono leading-relaxed">
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
        background: "rgba(15, 23, 42, 0.9)",
        border: "1px solid rgba(34,197,94,0.4)",
        borderRadius: 10,
        color: "#fff",
        padding: 0,
        width: 260,
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
              labelStyle: { fill: "#a7f3d0", fontSize: 9 },
              labelBgStyle: { fill: "rgba(2,6,23,0.7)" },
              style: { stroke: "rgba(34,197,94,0.55)" },
              markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(34,197,94,0.7)" },
            });
          }
        }
      });
    });
    return { nodes, edges };
  }, [database]);

  return (
    <div className="h-[640px] w-full overflow-hidden rounded-xl border border-border/60 bg-background/40">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesConnectable={false}
      >
        <Background gap={16} color="rgba(148,163,184,0.15)" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
