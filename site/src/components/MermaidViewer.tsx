import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidViewerProps {
  diagrams: { name: string; content: string; path: string }[];
}

export default function MermaidViewer({ diagrams }: MermaidViewerProps) {
  const [selectedDiagram, setSelectedDiagram] = useState<string>(diagrams[0]?.name || '');
  const [rendered, setRendered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize mermaid with dark theme
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#00ff9f',
        primaryTextColor: '#fff',
        primaryBorderColor: '#00d4ff',
        lineColor: '#00d4ff',
        secondaryColor: '#8338ec',
        tertiaryColor: '#0f0f23',
      },
    });
    setRendered(true);
  }, []);

  useEffect(() => {
    if (rendered && selectedDiagram && containerRef.current) {
      const diagram = diagrams.find((d) => d.name === selectedDiagram);
      if (diagram) {
        renderDiagram(diagram.content);
      }
    }
  }, [selectedDiagram, rendered, diagrams]);

  const renderDiagram = async (content: string) => {
    if (!containerRef.current) return;

    try {
      // Clear previous diagram
      containerRef.current.innerHTML = '';

      // Create a unique ID for this diagram
      const id = `mermaid-${Date.now()}`;
      
      // Render the diagram
      const { svg } = await mermaid.render(id, content);
      containerRef.current.innerHTML = svg;
    } catch (error) {
      console.error('Error rendering mermaid diagram:', error);
      containerRef.current.innerHTML = `
        <div class="alert alert-error">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Error rendering diagram: ${error instanceof Error ? error.message : 'Unknown error'}</span>
        </div>
      `;
    }
  };

  if (diagrams.length === 0) {
    return (
      <div className="alert alert-info">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 className="font-bold">No diagrams found</h3>
          <p className="text-sm">Add .mmd files to the repository or include Mermaid code blocks in your README.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Diagram selector */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Select Diagram</span>
        </label>
        <select
          className="select select-bordered w-full max-w-xs"
          value={selectedDiagram}
          onChange={(e) => setSelectedDiagram(e.target.value)}
        >
          {diagrams.map((diagram) => (
            <option key={diagram.name} value={diagram.name}>
              {diagram.name}
            </option>
          ))}
        </select>
      </div>

      {/* Diagram display */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <div
            ref={containerRef}
            className="flex justify-center items-center min-h-[400px] overflow-x-auto"
          >
            {!rendered && <span className="loading loading-spinner loading-lg"></span>}
          </div>
        </div>
      </div>
    </div>
  );
}
