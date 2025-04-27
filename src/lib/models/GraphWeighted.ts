// src/lib/models/GraphWeighted.ts
export interface Node {
    id: string;
    label: string;
    // Autres propriétés optionnelles
    [key: string]: any;
  }
  
  export interface Edge {
    source: string;
    target: string;
    weight: number;
    // Autres propriétés optionnelles
    [key: string]: any;
  }
  
  /**
   * Classe représentant un graphe pondéré
   */
  export class GraphWeighted {
    private nodes: Map<string, Node> = new Map();
    private adjacencyList: Map<string, Map<string, number>> = new Map();
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
        this.adjacencyList.set(node.id, new Map());
      }
    }
    
    /**
     * Ajoute une arête au graphe avec un poids
     */
    addEdge(edge: Edge): void {
      // Vérifier que les nœuds existent
      if (!this.nodes.has(edge.source) || !this.nodes.has(edge.target)) {
        throw new Error(`Les nœuds ${edge.source} ou ${edge.target} n'existent pas`);
      }
      
      // Ajouter l'arête
      this.edges.push(edge);
      
      // Mettre à jour la liste d'adjacence avec le poids
      this.adjacencyList.get(edge.source)!.set(edge.target, edge.weight);
      
      // Si le graphe n'est pas dirigé, ajouter l'arête inverse
      if (!this.directed) {
        this.adjacencyList.get(edge.target)!.set(edge.source, edge.weight);
      }
    }
    
    /**
     * Vérifie si une arête existe entre deux nœuds
     */
    hasEdge(sourceId: string, targetId: string): boolean {
      return this.adjacencyList.get(sourceId)?.has(targetId) || false;
    }
    
    /**
     * Récupère le poids d'une arête entre deux nœuds
     */
    getEdgeWeight(sourceId: string, targetId: string): number | undefined {
      return this.adjacencyList.get(sourceId)?.get(targetId);
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
     * Récupère les voisins d'un nœud avec leurs poids
     */
    getNeighborsWithWeights(nodeId: string): Map<string, number> {
      return this.adjacencyList.get(nodeId) || new Map();
    }
    
    /**
     * Récupère juste les IDs des voisins d'un nœud
     */
    getNeighbors(nodeId: string): string[] {
      return Array.from(this.adjacencyList.get(nodeId)?.keys() || []);
    }
    
    /**
     * Crée un graphe à partir d'une matrice d'adjacence pondérée
     */
    static fromAdjacencyMatrix(matrix: number[][], nodeLabels?: string[]): GraphWeighted {
      const graph = new GraphWeighted(true); // Par défaut dirigé
      
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
     * Crée un graphe à partir d'une liste d'adjacence pondérée
     * Format: A: B(5), C(3) - signifie A est connecté à B avec poids 5 et à C avec poids 3
     */
    static fromAdjacencyList(adjList: string[], nodeLabels?: { [key: string]: string }): GraphWeighted {
      const graph = new GraphWeighted(true); // Par défaut dirigé
      const edgePattern = /(\w+)\s*\(\s*(-?\d+(?:\.\d+)?)\s*\)/;
      
      // Extraire les nœuds et leurs connexions
      const connections: { [source: string]: { target: string, weight: number }[] } = {};
      
      adjList.forEach(line => {
        const parts = line.split(':');
        if (parts.length !== 2) return;
        
        const source = parts[0].trim();
        const neighborsStr = parts[1].trim();
        const neighbors: { target: string, weight: number }[] = [];
        
        // Extraire les voisins et leurs poids
        const neighborsList = neighborsStr.split(',');
        neighborsList.forEach(neighbor => {
          neighbor = neighbor.trim();
          const match = neighbor.match(edgePattern);
          
          if (match) {
            // Format avec poids explicite: B(5)
            const target = match[1];
            const weight = parseFloat(match[2]);
            neighbors.push({ target, weight });
          } else {
            // Format sans poids: B
            const target = neighbor;
            neighbors.push({ target, weight: 1 }); // Poids par défaut: 1
          }
        });
        
        connections[source] = neighbors;
        
        // Ajouter le nœud source
        if (!graph.nodes.has(source)) {
          const label = nodeLabels ? nodeLabels[source] : source;
          graph.addNode({ id: source, label });
        }
      });
      
      // Ajouter tous les nœuds cibles également
      Object.values(connections).flat().forEach(({ target }) => {
        if (!graph.nodes.has(target)) {
          const label = nodeLabels ? nodeLabels[target] : target;
          graph.addNode({ id: target, label });
        }
      });
      
      // Ajouter les arêtes
      Object.entries(connections).forEach(([source, neighbors]) => {
        neighbors.forEach(({ target, weight }) => {
          graph.addEdge({
            source,
            target,
            weight
          });
        });
      });
      
      return graph;
    }
    
    /**
     * Vérifie si le graphe est valide pour l'algorithme de Dijkstra
     * (pas de poids négatifs)
     */
    isDijkstraCompatible(): boolean {
      return !this.edges.some(edge => edge.weight < 0);
    }
    
    /**
     * Récupère le poids minimum et maximum des arêtes
     */
    getWeightRange(): { min: number, max: number } {
      if (this.edges.length === 0) {
        return { min: 0, max: 0 };
      }
      
      let min = this.edges[0].weight;
      let max = this.edges[0].weight;
      
      this.edges.forEach(edge => {
        min = Math.min(min, edge.weight);
        max = Math.max(max, edge.weight);
      });
      
      return { min, max };
    }
  }