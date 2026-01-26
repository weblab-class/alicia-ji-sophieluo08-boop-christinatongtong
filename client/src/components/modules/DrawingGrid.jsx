import React, { useState, useEffect } from "react";

const COLOR_MAP = {
  red: "#FF6B6B",
  blue: "#4ECDC4",
  yellow: "#FFE66D",
  green: "#73A580",
  purple: "#B4A7D6",
  orange: "#FFA07A",
};

const getColorHex = (color) => {
  if (!color) return "#f5f5f5";
  return COLOR_MAP[color] || color;
};

export default function DrawingGrid({
  selectedColor,
  correctPattern = {},
  onFillsChange,
  isPaused = false,
  gridSize = 3,
  svgPath = null, // Path to SVG file (e.g., "/drawings/flower.svg")
  svgString = null, // Or provide SVG as string directly
  showCorrectColors = false, // New prop to show correct colors during memorization
  prefilledColors = null // For showing user's colors in comparison phase
}) {
  const [fills, setFills] = useState(() => {
    const initial = {};
    for (let i = 0; i < gridSize * gridSize; i++) {
      initial[i.toString()] = null;
    }
    return initial;
  });

  const [svgContent, setSvgContent] = useState(null);
  const [svgRegions, setSvgRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load SVG when component mounts or svgPath/svgString changes
  useEffect(() => {
    const loadSVG = async () => {
      setLoading(true);
      setError(null);

      try {
        let svgText = svgString;

        // If path is provided, fetch the SVG
        if (svgPath && !svgString) {
          const response = await fetch(svgPath);
          if (!response.ok) {
            throw new Error(`Failed to load SVG from ${svgPath}`);
          }
          svgText = await response.text();
        }

        if (!svgText) {
          // Use default fallback if neither provided
          setLoading(false);
          return;
        }

        // Parse SVG
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
        const svgElement = svgDoc.querySelector("svg");

        if (!svgElement) {
          throw new Error("Invalid SVG content");
        }

        // Extract viewBox
        const viewBox = svgElement.getAttribute("viewBox") || "0 0 500 500";

        // Find all fillable elements
        const fillableElements = svgDoc.querySelectorAll(
          "path, circle, rect, polygon, ellipse"
        );

        const regions = [];
        fillableElements.forEach((element, index) => {
          const clonedElement = element.cloneNode(true);

          // Store original attributes but remove fill
          const originalFill = element.getAttribute("fill");
          clonedElement.removeAttribute("fill");

          // Keep stroke if it exists
          const stroke = element.getAttribute("stroke");
          if (!stroke || stroke === "none") {
            clonedElement.setAttribute("stroke", "#333");
            clonedElement.setAttribute("stroke-width", "2");
          }

          regions.push({
            id: index.toString(),
            element: clonedElement.outerHTML,
            originalFill: originalFill
          });
        });

        if (regions.length === 0) {
          throw new Error("No fillable regions found in SVG");
        }

        setSvgContent({ viewBox, regions });
        setSvgRegions(regions);

        // Initialize fills for all regions
        const newFills = {};
        regions.forEach((region) => {
          newFills[region.id] = null;
        });
        setFills(newFills);

      } catch (err) {
        console.error("Error loading SVG:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (svgPath || svgString) {
      loadSVG();
    }
  }, [svgPath, svgString]);

  // Notify parent when fills change
  useEffect(() => {
    if (onFillsChange) {
      onFillsChange(fills);
    }
  }, [fills]);

  // If prefilledColors is provided (comparison phase), use those instead of fills
  const displayFills = prefilledColors || fills;

  const handleRegionClick = (id) => {
    if (!selectedColor || isPaused) return;
    setFills((prev) => ({ ...prev, [id]: selectedColor }));
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        width: '100%',
        maxWidth: '420px',
        margin: '20px auto',
        textAlign: 'center',
        padding: '60px 20px',
        background: '#fafafa',
        border: '2px solid #ddd',
        borderRadius: '8px'
      }}>
        <div style={{ fontSize: '24px', color: '#666' }}>Loading drawing...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        width: '100%',
        maxWidth: '420px',
        margin: '20px auto',
        textAlign: 'center',
        padding: '40px 20px',
        background: '#ffebee',
        border: '2px solid #f44336',
        borderRadius: '8px'
      }}>
        <div style={{ fontSize: '18px', color: '#d32f2f', marginBottom: '10px' }}>
          ❌ Error loading SVG
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>{error}</div>
      </div>
    );
  }

  // If no SVG provided, show fallback grid
  if (!svgContent) {
    return (
      <div style={{
        width: '100%',
        maxWidth: '420px',
        margin: '20px auto'
      }}>
        <svg
          viewBox="0 0 205 205"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            background: '#fafafa',
            border: '2px solid #ddd',
            borderRadius: '8px'
          }}
        >
          {Array.from({ length: gridSize * gridSize }, (_, index) => {
            const row = Math.floor(index / gridSize);
            const col = index % gridSize;
            const cellSize = 60;
            const gap = 5;
            const x = gap + col * (cellSize + gap);
            const y = gap + row * (cellSize + gap);
            const id = index.toString();

            return (
              <rect
                key={id}
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                fill={fills[id] ? getColorHex(fills[id]) : "#f5f5f5"}
                stroke="#444"
                strokeWidth="2"
                onClick={() => handleRegionClick(id)}
                style={{
                  cursor: isPaused ? 'not-allowed' : 'pointer'
                }}
              />
            );
          })}
        </svg>
      </div>
    );
  }

  // Render uploaded SVG with clickable regions
  return (
    <div style={{
      width: '100%',
      maxWidth: '420px',
      margin: '20px auto'
    }}>
      <svg
        viewBox={svgContent.viewBox}
        className="drawing-svg"
        role="img"
        aria-label="Coloring drawing"
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          background: '#fafafa',
          border: '2px solid #ddd',
          borderRadius: '8px'
        }}
      >
        {svgRegions.map((region) => (
          <g
            key={region.id}
            onClick={() => handleRegionClick(region.id)}
            style={{
              cursor: isPaused ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!isPaused) {
                e.currentTarget.style.opacity = '0.85';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            dangerouslySetInnerHTML={{
              __html: region.element.replace(
                /^<(\w+)/,
                `<$1 fill="${showCorrectColors
                  ? getColorHex(correctPattern[region.id])
                  : (displayFills[region.id] ? getColorHex(displayFills[region.id]) : '#f5f5f5')
                }"`
              )
            }}
          />
        ))}
      </svg>
    </div>
  );
}
