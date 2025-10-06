// Performance benchmarking utilities for node-map optimization
export interface PerformanceBenchmark {
  nodeCount: number;
  renderTime: number;
  simulationTime: number;
  memoryUsage: number;
  timestamp: number;
}

export class NodeMapPerformanceMonitor {
  private benchmarks: PerformanceBenchmark[] = [];
  private startTime: number = 0;

  startMeasurement(): void {
    this.startTime = performance.now();
  }

  endMeasurement(nodeCount: number, label: string = 'default'): PerformanceBenchmark {
    const endTime = performance.now();
    const renderTime = endTime - this.startTime;
    
    // Estimate memory usage (rough approximation)
    const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
    
    const benchmark: PerformanceBenchmark = {
      nodeCount,
      renderTime,
      simulationTime: renderTime, // For now, same as render time
      memoryUsage,
      timestamp: Date.now()
    };
    
    this.benchmarks.push(benchmark);
    console.log(`[${label}] Performance: ${nodeCount} nodes, ${renderTime.toFixed(2)}ms render time`);
    
    return benchmark;
  }

  getBenchmarks(): PerformanceBenchmark[] {
    return [...this.benchmarks];
  }

  getAverageRenderTime(nodeCount: number): number {
    const relevant = this.benchmarks.filter(b => b.nodeCount === nodeCount);
    if (relevant.length === 0) return 0;
    return relevant.reduce((sum, b) => sum + b.renderTime, 0) / relevant.length;
  }

  clear(): void {
    this.benchmarks = [];
  }
}

// Global instance for easy access
export const performanceMonitor = new NodeMapPerformanceMonitor();