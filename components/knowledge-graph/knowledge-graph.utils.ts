"use client";

import * as d3 from "d3";

import { GraphData, Link, Node } from "./knowledge-graph.types";

const getNodeById = (
  graphData: GraphData,
  nodeId: string
): Node | undefined => {
  return graphData.nodes.find((n) => n.id === nodeId);
};

export const getRelationships = (
  graphData: GraphData,
  nodeId: string
): Array<{ link: Link; targetNode: Node; isOutgoing: boolean }> => {
  const relationships: Array<{
    link: Link;
    targetNode: Node;
    isOutgoing: boolean;
  }> = [];

  graphData.links.forEach((link) => {
    const sourceId =
      typeof link.source === "object" ? link.source.id : link.source;
    const targetId =
      typeof link.target === "object" ? link.target.id : link.target;

    if (sourceId === nodeId) {
      const targetNode = getNodeById(graphData, targetId);
      if (targetNode) {
        relationships.push({ link, targetNode, isOutgoing: true });
      }
    }

    if (targetId === nodeId) {
      const sourceNode = getNodeById(graphData, sourceId);
      if (sourceNode) {
        relationships.push({ link, targetNode: sourceNode, isOutgoing: false });
      }
    }
  });

  return relationships;
};
