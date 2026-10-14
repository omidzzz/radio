"use client";

import { useMemo, useId } from "react";

interface NodeNetworkProps {
  /** Number of nodes */
  nodeCount?: number;
  /** Base node radius */
  nodeRadius?: number;
  /** Additional className */
  className?: string;
  /** Width of the SVG */
  width?: number;
  /** Height of the SVG */
  height?: number;
}

interface Node {
  id: number;
  cx: number;
  cy: number;
  r: number;
  delay: number;
  isHub: boolean;
}

interface Link {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay: number;
  isStrong: boolean;
}

/**
 * Premium node network visualization — sophisticated connectivity map.
 * Features gradient links, varied node sizes, hub nodes, and depth effects.
 * Pure CSS animation, GPU-accelerated.
 * Respects prefers-reduced-motion.
 */
export default function NodeNetwork({
  nodeCount = 12,
  nodeRadius = 3,
  className = "",
  width = 600,
  height = 400,
}: NodeNetworkProps) {
  const uniqueId = useId().replace(/:/g, "");

  const { nodes, links } = useMemo(() => {
    const padding = 60;
    const generatedNodes: Node[] = Array.from({ length: nodeCount }, (_, i) => ({
      id: i,
      cx: Math.round(padding + Math.random() * (width - padding * 2)),
      cy: Math.round(padding + Math.random() * (height - padding * 2)),
      r: nodeRadius + Math.random() * 3,
      delay: i * 0.2,
      isHub: i < 3, // First 3 nodes are "hubs"
    }));

    // Connect nodes with intelligent linking
    const generatedLinks: Link[] = [];
    let linkId = 0;
    generatedNodes.forEach((node, i) => {
      const distances = generatedNodes
        .filter((_, j) => j !== i)
        .map((other) => ({
          node: other,
          dist: Math.hypot(other.cx - node.cx, other.cy - node.cy),
        }))
        .sort((a, b) => a.dist - b.dist);

      // Hub nodes connect to more nodes
      const maxConnections = node.isHub ? 4 : 2;
      const connections = Math.min(maxConnections, distances.length);

      for (let k = 0; k < connections; k++) {
        const exists = generatedLinks.some(
          (l) =>
            (l.x1 === node.cx && l.y1 === node.cy &&
              l.x2 === distances[k].node.cx && l.y2 === distances[k].node.cy) ||
            (l.x2 === node.cx && l.y2 === node.cy &&
              l.x1 === distances[k].node.cx && l.y1 === distances[k].node.cy)
        );
        if (!exists) {
          generatedLinks.push({
            id: linkId++,
            x1: node.cx,
            y1: node.cy,
            x2: distances[k].node.cx,
            y2: distances[k].node.cy,
            delay: (linkId * 0.15) % 4,
            isStrong: distances[k].dist < 150,
          });
        }
      }
    });

    return { nodes: generatedNodes, links: generatedLinks };
  }, [nodeCount, width, height, nodeRadius]);

  return (
    <svg
      className={`absolute inset-0 h-full w-full ${className}`}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        {/* Gradient for links */}
        <linearGradient id={`link-grad-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(6, 182, 212, 0.1)" />
          <stop offset="50%" stopColor="rgba(34, 211, 238, 0.3)" />
          <stop offset="100%" stopColor="rgba(20, 184, 166, 0.1)" />
        </linearGradient>
        {/* Glow filter for nodes */}
        <filter id={`node-glow-${uniqueId}`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Radial gradient for hub nodes */}
        <radialGradient id={`hub-grad-${uniqueId}`}>
          <stop offset="0%" stopColor="rgba(34, 211, 238, 0.9)" />
          <stop offset="70%" stopColor="rgba(6, 182, 212, 0.6)" />
          <stop offset="100%" stopColor="rgba(6, 182, 212, 0.2)" />
        </radialGradient>
      </defs>

      {/* Links layer */}
      <g>
        {links.map((link) => (
          <line
            key={`link-${link.id}`}
            x1={link.x1}
            y1={link.y1}
            x2={link.x2}
            y2={link.y2}
            stroke={link.isStrong ? `url(#link-grad-${uniqueId})` : "rgba(6, 182, 212, 0.08)"}
            strokeWidth={link.isStrong ? 1.5 : 0.75}
            className="network-link"
            style={{
              animationDelay: `${link.delay}s`,
              opacity: link.isStrong ? 1 : 0.5,
            }}
          />
        ))}
      </g>

      {/* Nodes layer */}
      <g filter={`url(#node-glow-${uniqueId})`}>
        {nodes.map((node) => (
          <g key={`node-${node.id}`} className="network-node" style={{ animationDelay: `${node.delay}s` }}>
            {/* Outer glow ring for hub nodes */}
            {node.isHub && (
              <circle
                cx={node.cx}
                cy={node.cy}
                r={node.r * 2.5}
                fill="none"
                stroke="rgba(6, 182, 212, 0.15)"
                strokeWidth="1"
                className="network-ring"
              />
            )}
            {/* Main node */}
            <circle
              cx={node.cx}
              cy={node.cy}
              r={node.r}
              fill={node.isHub ? `url(#hub-grad-${uniqueId})` : "rgba(6, 182, 212, 0.5)"}
            />
            {/* Inner highlight */}
            <circle
              cx={node.cx - node.r * 0.3}
              cy={node.cy - node.r * 0.3}
              r={node.r * 0.4}
              fill="rgba(255, 255, 255, 0.4)"
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
