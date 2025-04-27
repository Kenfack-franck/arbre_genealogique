// src/lib/models/Graph.ts
export interface Node {
    id: string;
    label: string;
    // Autres propriétés optionnelles
    [key: string]: any;
  }
  
  export interface Edge {
    source: string;
    target: string;
    // Autres propriétés optionnelles
    [key: string]: any;
  }
  
  /**
   * Classe représentant un graphe générique
   */
  export class Graph {
    private nodes: Map<string, Node> = new Map();
    private adjacencyList: Map<string, Set<string>> = new Map();
    private edges: Edge[] = [];
    directed: boolean;
    
    constructor(directed: boolean = false) {
      this.directed = directed;
    }
    
    /**
     * Ajoute un nœud au graphe
     */
    addNode(node: Node): void {
      this.nodes.set(node.id, node);
      if (!this.adjacencyList.has(node.id)) {
        this.adjacencyList.set(node.id, new Set());
      }
    }
    
    /**
     * Ajoute une arête au graphe
     */
    addEdge(edge: Edge): void {
      // Vérifier que les nœuds existent
      if (!this.nodes.has(edge.source) || !this.nodes.has(edge.target)) {
        throw new Error(`Les nœuds ${edge.source} ou ${edge.target} n'existent pas`);
      }
      
      // Ajouter l'arête
      this.edges.push(edge);
      
      // Mettre à jour la liste d'adjacence
      this.adjacencyList.get(edge.source)!.add(edge.target);
      
      // Si le graphe n'est pas dirigé, ajouter l'arête inverse
      if (!this.directed) {
        this.adjacencyList.get(edge.target)!.add(edge.source);
      }
    }
    
    /**
     * Récupère tous les nœuds du graphe
     */
    getNodes(): Node[] {
      return Array.from(this.nodes.values());
    }
    
    /**
     * Récupère toutes les arêtes du graphe
     */
    getEdges(): Edge[] {
      return this.edges;
    }
    
    /**
     * Récupère les voisins d'un nœud
     */
    getNeighbors(nodeId: string): Set<string> {
      return this.adjacencyList.get(nodeId) || new Set();
    }
    
    /**
     * Crée un graphe à partir d'une matrice d'adjacence
     */
    static fromAdjacencyMatrix(matrix: number[][], nodeLabels?: string[]): Graph {
      const graph = new Graph(true); // Par défaut dirigé
      
      // Créer les nœuds
      for (let i = 0; i < matrix.length; i++) {
        const label = nodeLabels && i < nodeLabels.length ? nodeLabels[i] : `Node ${i}`;
        graph.addNode({ id: i.toString(), label });
      }
      
      // Créer les arêtes
      for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
          if (matrix[i][j] !== 0) {
            graph.addEdge({ 
              source: i.toString(), 
              target: j.toString(),
              weight: matrix[i][j]
            });
          }
        }
      }
      
      return graph;
    }
    
    /**
     * Crée un graphe à partir d'une liste d'adjacence
     */
    static fromAdjacencyList(adjList: { [key: string]: string[] }, nodeLabels?: { [key: string]: string }): Graph {
      const graph = new Graph(true); // Par défaut dirigé
      
      // Créer les nœuds
      Object.keys(adjList).forEach(nodeId => {
        const label = nodeLabels ? nodeLabels[nodeId] : `Node ${nodeId}`;
        graph.addNode({ id: nodeId, label });
      });
      
      // S'assurer que tous les nœuds cibles existent également
      Object.values(adjList).flat().forEach(nodeId => {
        if (!graph.nodes.has(nodeId)) {
          const label = nodeLabels ? nodeLabels[nodeId] : `Node ${nodeId}`;
          graph.addNode({ id: nodeId, label });
        }
      });
      
      // Créer les arêtes
      Object.entries(adjList).forEach(([nodeId, neighbors]) => {
        neighbors.forEach(neighborId => {
          graph.addEdge({ source: nodeId, target: neighborId });
        });
      });
      
      return graph;
    }
  }