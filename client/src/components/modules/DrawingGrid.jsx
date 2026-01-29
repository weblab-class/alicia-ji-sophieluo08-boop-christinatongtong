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

        // Extract CSS styles from <style> tags to check for white (#ffffff)
        const styleSheets = svgDoc.querySelectorAll("style");
        const specialColorClasses = new Set();
        styleSheets.forEach((styleTag) => {
          const styleText = styleTag.textContent || styleTag.innerHTML;
          // Check if any CSS rule contains white (#ffffff, #fff, white)
          if (styleText.includes("#ffffff") || styleText.includes("#fff") ||
            styleText.includes("white") || styleText.includes("rgb(255,255,255)") ||
            styleText.includes("rgb(255, 255, 255)")) {
            // Extract class names from CSS rules that define white fill
            const classMatches = styleText.match(/\.([a-zA-Z0-9_-]+)\s*\{[^}]*fill[^}]*(?:#ffffff|#fff|white|rgb\(255[,\s]*255[,\s]*255\))[^}]*\}/gi);
            if (classMatches) {
              classMatches.forEach(match => {
                const classNameMatch = match.match(/\.([a-zA-Z0-9_-]+)/);
                if (classNameMatch) {
                  specialColorClasses.add(classNameMatch[1]);
                }
              });
            }
          }
        });

        // Find all fillable elements
        const fillableElements = svgDoc.querySelectorAll(
          "path, circle, rect, polygon, ellipse"
        );

        const regions = [];
        fillableElements.forEach((element, index) => {
          const clonedElement = element.cloneNode(true);

          // Check fill from multiple sources:
          // 1. Direct fill attribute
          // 2. CSS class (check if element has a class that defines white)
          const directFill = element.getAttribute("fill");
          const elementClass = element.getAttribute("class");
          const hasSpecialClass = elementClass && specialColorClasses.has(elementClass);

          // Check if fill is white (#ffffff, #fff, white, or rgb(255,255,255))
          const normalizedFill = directFill ? directFill.toLowerCase().trim() : "";
          const isSpecialColor = hasSpecialClass ||
            normalizedFill === "#ffffff" ||
            normalizedFill === "#fff" ||
            normalizedFill === "white" ||
            normalizedFill === "rgb(255,255,255)" ||
            normalizedFill === "rgb(255, 255, 255)";

          clonedElement.removeAttribute("fill");
          if (hasSpecialClass) {
            clonedElement.removeAttribute("class");
          }

          // Keep stroke if it exists
          const stroke = element.getAttribute("stroke");
          if (!stroke || stroke === "none") {
            clonedElement.setAttribute("stroke", "#333");
            clonedElement.setAttribute("stroke-width", "2");
          }

          regions.push({
            id: index.toString(),
            element: clonedElement.outerHTML,
            originalFill: directFill,
            isSpecialColor: isSpecialColor // Mark this color as non-fillable
          });
        });

        if (regions.length === 0) {
          throw new Error("No fillable regions found in SVG");
        }

        setSvgContent({ viewBox, regions });
        setSvgRegions(regions);

        // Initialize fills for all regions (skip special color regions)
        const newFills = {};
        regions.forEach((region) => {
          if (!region.isSpecialColor) {
            newFills[region.id] = null;
          }
        });
        setFills(newFills);

      } catch (err) {
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
    // Don't allow filling special color regions (#aa008f)
    const region = svgRegions.find(r => r.id === id);
    if (region && region.isSpecialColor) return;
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
          Error loading SVG
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
                  cursor: isPaused
                    ? 'not-allowed'
                    : (selectedColor
                      ? `url('/paint-brush.png') 8 24, pointer`
                      : 'pointer')
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
      maxWidth: '500px',
      margin: '20px auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Easel */}
      <div style={{
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Canvas */}
        <div style={{
          width: '100%',
          maxWidth: '420px',
          aspectRatio: '1',
          background: 'linear-gradient(135deg, #f5f3f0 0%, #ebe7e1 100%)',
          border: '12px solid #8b6f47',
          borderRadius: '4px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          padding: '0px',
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="drawing-inner-pad">
            <svg
              viewBox={svgContent.viewBox}
              className={`drawing-svg ${!isPaused && selectedColor ? 'paintbrush-cursor' : ''}`}
              role="img"
              aria-label="Coloring drawing"
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
                background: 'transparent',
                cursor: isPaused
                  ? 'not-allowed'
                  : (selectedColor
                    ? `url('/paint-brush.png') 8 24, pointer`
                    : 'pointer'),
                objectFit: 'contain'
              }}
            >
              {svgRegions.map((region) => {
                const isSpecialColor = region.isSpecialColor;
                // Always show black for special color regions (#aa008f), ignore correctPattern and user fills
                let fillColor = '#f5f5f5';
                if (isSpecialColor) {
                  fillColor = '#000000'; // Always black for special color regions in all stages
                } else if (showCorrectColors) {
                  fillColor = correctPattern[region.id] ? getColorHex(correctPattern[region.id]) : '#f5f5f5';
                } else if (displayFills[region.id]) {
                  fillColor = getColorHex(displayFills[region.id]);
                }

                return (
                  <g
                    key={region.id}
                    onClick={isSpecialColor ? undefined : () => handleRegionClick(region.id)}
                    style={{
                      pointerEvents: isSpecialColor ? 'none' : 'all',
                      transition: 'opacity 0.2s ease'
                    }}
                    onMouseEnter={isSpecialColor ? undefined : (e) => {
                      if (!isPaused) {
                        e.currentTarget.style.opacity = '0.85';
                      }
                    }}
                    onMouseLeave={isSpecialColor ? undefined : (e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                    dangerouslySetInnerHTML={{
                      __html: region.element.replace(
                        /^<(\w+)/,
                        `<$1 fill="${fillColor}" style="cursor: ${isSpecialColor
                          ? 'default'
                          : (isPaused
                            ? 'not-allowed'
                            : (selectedColor
                              ? `url('/paint-brush.png') 8 24, pointer`
                              : 'pointer'))};"`
                      )
                    }}
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
