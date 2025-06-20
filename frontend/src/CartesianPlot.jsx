import React, { useEffect, useRef } from 'react';

function CartesianPlot({ data, type, nameA, nameB, precision = 3 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear previous drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up the coordinate system
    const padding = 30;
    const width = canvas.width - 2 * padding;
    const height = canvas.height - 2 * padding;
    
    // Always extract points from data
    const pointA = {
      defined: data && data.ea !== '' && data.na !== '',
      x: parseFloat(data?.ea) || 0,
      y: parseFloat(data?.na) || 0
    };
    const pointB = {
      defined: data && data.eb !== '' && data.nb !== '',
      x: parseFloat(data?.eb) || 0,
      y: parseFloat(data?.nb) || 0
    };
    const definedPoints = [];
    if (pointA.defined) definedPoints.push({ x: pointA.x, y: pointA.y });
    if (pointB.defined) definedPoints.push({ x: pointB.x, y: pointB.y });
    
    // Only proceed if we have at least one defined point
    if (definedPoints.length > 0) {
      // Calculate bounds based on defined points
      let minPointX = definedPoints[0].x;
      let maxPointX = definedPoints[0].x;
      let minPointY = definedPoints[0].y;
      let maxPointY = definedPoints[0].y;
      definedPoints.forEach(point => {
        minPointX = Math.min(minPointX, point.x);
        maxPointX = Math.max(maxPointX, point.x);
        minPointY = Math.min(minPointY, point.y);
        maxPointY = Math.max(maxPointY, point.y);
      });
      // Calculate padding based on points or a default value
      let paddingValue;
      if (definedPoints.length > 1) {
        const xDist = Math.abs(maxPointX - minPointX);
        const yDist = Math.abs(maxPointY - minPointY);
        paddingValue = Math.max(xDist, yDist) * 0.15; // 15% padding
      } else {
        // If only one point, use a fixed padding
        paddingValue = 10;
      }
      const minX = minPointX - paddingValue;
      const maxX = maxPointX + paddingValue;
      const minY = minPointY - paddingValue;
      const maxY = maxPointY + paddingValue;
      // Draw the coordinate system
      drawCoordinateSystem(ctx, padding, width, height, minX, maxX, minY, maxY);
      // Draw points and line only if appropriate
      drawPointsAndLine(ctx, pointA, pointB, padding, width, height, minX, maxX, minY, maxY);
    } else {
      // If no points are defined, just draw the empty coordinate system
      const minX = 0, maxX = 10, minY = 0, maxY = 10;
      drawCoordinateSystem(ctx, padding, width, height, minX, maxX, minY, maxY);
    }
  }, [data, precision]); // Added precision to dependency array
  
  // Helper function to draw the coordinate system
  function drawCoordinateSystem(ctx, padding, width, height, minX, maxX, minY, maxY) {
    ctx.save();
    
    // Draw a clean background
    ctx.fillStyle = '#f9f9f9';
    ctx.fillRect(padding, padding, width, height);
    
    // Draw subtle grid lines for reference
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 0.5;
    
    // Calculate grid step size based on the range
    const xRange = maxX - minX;
    const yRange = maxY - minY;
    const xStep = calculateNiceStep(xRange);
    const yStep = calculateNiceStep(yRange);
    
    // Draw grid lines
    for (let x = Math.ceil(minX / xStep) * xStep; x <= maxX; x += xStep) {
      const xPos = padding + (x - minX) / (maxX - minX) * width;
      ctx.beginPath();
      ctx.moveTo(xPos, padding);
      ctx.lineTo(xPos, padding + height);
      ctx.stroke();
    }
    
    for (let y = Math.ceil(minY / yStep) * yStep; y <= maxY; y += yStep) {
      const yPos = padding + height - (y - minY) / (maxY - minY) * height;
      ctx.beginPath();
      ctx.moveTo(padding, yPos);
      ctx.lineTo(padding + width, yPos);
      ctx.stroke();
    }
    
    ctx.restore();
  }
  
  // Helper function to calculate a nice step size for grid lines
  function calculateNiceStep(range) {
    const rough = range / 5; // Aim for about 5 grid lines
    const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
    const normalized = rough / magnitude;
    
    if (normalized < 1.5) return magnitude;
    if (normalized < 3.5) return 2 * magnitude;
    if (normalized < 7.5) return 5 * magnitude;
    return 10 * magnitude;
  }
  
  // Helper function to draw points and connecting line
  function drawPointsAndLine(ctx, pointA, pointB, padding, width, height, minX, maxX, minY, maxY) {
    ctx.save();
    
    // Only draw the line if both points are defined
    if (pointA.defined && pointB.defined) {
      // Draw the line connecting the points
      ctx.beginPath();
      const startX = padding + (pointA.x - minX) / (maxX - minX) * width;
      const startY = padding + height - (pointA.y - minY) / (maxY - minY) * height;
      ctx.moveTo(startX, startY);
      
      const endX = padding + (pointB.x - minX) / (maxX - minX) * width;
      const endY = padding + height - (pointB.y - minY) / (maxY - minY) * height;
      ctx.lineTo(endX, endY);
      
      ctx.strokeStyle = '#FF8C00';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Calculate azimuth for label logic
    let azimuthDeg = null;
    if (pointA.defined && pointB.defined && (pointA.x !== pointB.x || pointA.y !== pointB.y)) {
      azimuthDeg = 90 - Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x) * 180 / Math.PI;
      if (azimuthDeg < 0) azimuthDeg += 360;
    }

    // Helper: is azimuth between 270 and 90 (wrap-around, i.e., rightwards)?
    const isRightward = azimuthDeg !== null && (azimuthDeg <= 90 || azimuthDeg >= 270);

    // Draw point A if defined
    if (pointA.defined) {
      // Format coordinates for display with specified precision
      const labelA = `${nameA || 'A'} (${pointA.x.toFixed(precision)}, ${pointA.y.toFixed(precision)})`;
      const x = padding + (pointA.x - minX) / (maxX - minX) * width;
      const y = padding + height - (pointA.y - minY) / (maxY - minY) * height;
      // Draw point
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#4CAF50';
      ctx.fill();
      // Draw label
      ctx.fillStyle = '#000';
      const labelFontSize = Math.max(14, Math.floor(height * 0.07));  // dynamic label font size based on canvas height
      ctx.font = `bold ${labelFontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Calculate angle to point B if it exists, otherwise use a default offset
      let labelOffsetX = 0;
      let labelOffsetY = -15; // Default offset upward
      
      if (pointB.defined && (pointA.x !== pointB.x || pointA.y !== pointB.y)) {
        // Calculate angle from A to B
        const angleRad = Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x);
        
        // Calculate azimuth angle (from North, clockwise)
        let azimuthDeg = 90 - angleRad * 180 / Math.PI;
        if (azimuthDeg < 0) azimuthDeg += 360;
        
        // Determine which quadrant the line is in and adjust perpendicular angle accordingly
        let perpAngle;
        const labelDistance = 15;
        
        // For all quadrants, ensure label is outside the line
        if (azimuthDeg >= 0 && azimuthDeg < 90) {
          // First quadrant: place label to the right
          perpAngle = angleRad - Math.PI/2;
        } else if (azimuthDeg >= 90 && azimuthDeg < 180) {
          // Second quadrant: place label to the right
          perpAngle = angleRad - Math.PI/2;
        } else if (azimuthDeg >= 180 && azimuthDeg < 270) {
          // Third quadrant: place label to the left
          perpAngle = angleRad + Math.PI/2;
        } else {
          // Fourth quadrant: place label to the left
          perpAngle = angleRad + Math.PI/2;
        }
        
        // Apply the offset
        labelOffsetX = labelDistance * Math.cos(perpAngle);
        labelOffsetY = labelDistance * Math.sin(perpAngle);
      }
      
      // Position label outside the line
      ctx.fillText((nameA && nameA.trim()) ? nameA : 'A', x + labelOffsetX, y + labelOffsetY);
      // Draw coordinates: above normally, below if rightward
      const coordFontSize = Math.max(12, Math.floor(height * 0.07));  // dynamic coordinate font size
      ctx.font = `${coordFontSize}px Arial`;
      const coordText = `(${pointA.x.toFixed(precision)}, ${pointA.y.toFixed(precision)})`;
      const textWidth = ctx.measureText(coordText).width;
      let textPos = x;
      const minPos = padding + textWidth / 2;
      const maxPos = padding + width - textWidth / 2;
      textPos = Math.min(Math.max(textPos, minPos), maxPos);
      if (isRightward) {
        ctx.fillText(coordText, textPos, y + 30);
      } else {
        ctx.fillText(coordText, textPos, y - 30);
      }
    }
    // Draw point B if defined
    if (pointB.defined) {
      const x = padding + (pointB.x - minX) / (maxX - minX) * width;
      const y = padding + height - (pointB.y - minY) / (maxY - minY) * height;
      // Draw point
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#2196F3';
      ctx.fill();
      // Draw label
      ctx.fillStyle = '#000';
      const labelFontSize = Math.max(14, Math.floor(height * 0.07));  // dynamic label font size based on canvas height
      ctx.font = `bold ${labelFontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Calculate angle from B to A if it exists, otherwise use a default offset
      let labelOffsetX = 0;
      let labelOffsetY = -15; // Default offset upward
      
      if (pointA.defined && (pointA.x !== pointB.x || pointA.y !== pointB.y)) {
        // Calculate angle from B to A
        const angleRad = Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);
        
        // Calculate azimuth angle (from North, clockwise)
        let azimuthDeg = 90 - angleRad * 180 / Math.PI;
        if (azimuthDeg < 0) azimuthDeg += 360;
        
        // Determine which quadrant the line is in and adjust perpendicular angle accordingly
        let perpAngle;
        const labelDistance = 15;
        
        // For point B, we need to reverse the direction compared to point A
        // to ensure the label is always outside the line
        if (azimuthDeg >= 0 && azimuthDeg < 90) {
          // First quadrant: place label to the left (opposite of point A)
          perpAngle = angleRad + Math.PI/2;
        } else if (azimuthDeg >= 90 && azimuthDeg < 180) {
          // Second quadrant: place label to the left (opposite of point A)
          perpAngle = angleRad + Math.PI/2;
        } else if (azimuthDeg >= 180 && azimuthDeg < 270) {
          // Third quadrant: place label to the right (opposite of point A)
          perpAngle = angleRad - Math.PI/2;
        } else {
          // Fourth quadrant: place label to the right (opposite of point A)
          perpAngle = angleRad - Math.PI/2;
        }
        
        // Apply the offset
        labelOffsetX = labelDistance * Math.cos(perpAngle);
        labelOffsetY = labelDistance * Math.sin(perpAngle);
      }
      
      // Position label outside the line
      ctx.fillText((nameB && nameB.trim()) ? nameB : 'B', x + labelOffsetX, y + labelOffsetY);
      // Draw coordinates: below normally, above if rightward
      const coordFontSize = Math.max(14, Math.floor(height * 0.07));  // dynamic coordinate font size
      ctx.font = `${coordFontSize}px Arial`;
      const coordText = `(${pointB.x.toFixed(precision)}, ${pointB.y.toFixed(precision)})`;
      const textWidthB = ctx.measureText(coordText).width;
      let textPosB = x;
      const minPosB = padding + textWidthB / 2;
      const maxPosB = padding + width - textWidthB / 2;
      textPosB = Math.min(Math.max(textPosB, minPosB), maxPosB, );
      if (isRightward) {
        ctx.fillText(coordText, textPosB, y - 30);
      } else {
        ctx.fillText(coordText, textPosB, y + 30);
      }
    }

    // Draw azimuth and distance if both points are defined and not identical
    if (pointA.defined && pointB.defined && (pointA.x !== pointB.x || pointA.y !== pointB.y)) {
      // Convert points to canvas coordinates first
      const startX = padding + (pointA.x - minX) / (maxX - minX) * width;
      const startY = padding + height - (pointA.y - minY) / (maxY - minY) * height;
      const endX = padding + (pointB.x - minX) / (maxX - minX) * width;
      const endY = padding + height - (pointB.y - minY) / (maxY - minY) * height;
      
      // Calculate angle of the line on the canvas
      const angleRad = Math.atan2(endY - startY, endX - startX);
      
      // Distance between points in world coordinates, formatted with specified precision
      const dist = Math.sqrt(Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2));
      
      // Azimuth calculation (from North, clockwise)
      let azimuthDeg = 90 - Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x) * 180 / Math.PI;
      if (azimuthDeg < 0) azimuthDeg += 360;
      
      // Format azimuth as DMS with specified precision
      function toDMS(deg) {
        const d = Math.floor(deg);
        const m = Math.floor((deg - d) * 60);
        const s = ((deg - d) * 60 - m) * 60;
        
        // Use specified precision for seconds
        return `${d}°${m}'${s.toFixed(precision)}"`;
      }
      const azimuthDMS = toDMS(azimuthDeg);
      
      // Midpoint for label placement
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      
      // Offset distance perpendicular to the line
      const offsetDistance = 10;
      
      // Calculate perpendicular angle for placing labels above/below line
      const perpAngle = angleRad + Math.PI/2;
      
      // Calculate offset positions
      const aboveX = midX + offsetDistance * Math.cos(perpAngle);
      const aboveY = midY + offsetDistance * Math.sin(perpAngle);
      const belowX = midX - offsetDistance * Math.cos(perpAngle);
      const belowY = midY - offsetDistance * Math.sin(perpAngle);
      
      // Determine if the line is in the rightward direction (azimuth between 270° and 90°)
      const isRightward = (azimuthDeg > 270 && azimuthDeg <= 360) || (azimuthDeg >= 0 && azimuthDeg <= 90);
      
      // Adjust rotation angle and text alignment based on direction
      let textAngleRad = angleRad;
      let textAlign = 'center';
      let textBaseline = 'middle';
      
      // For rightward lines (270°-90°), we'll flip the text for better readability
      if (isRightward) {
        textAngleRad = angleRad + Math.PI; // Rotate 180 degrees
      }
      
      // Determine if we should rotate labels 180 degrees (for azimuths between 271°-360° and 0°-90°)
      const shouldRotate180 = azimuthDeg <= 90 || azimuthDeg > 270;
      
      // Draw DISTANCE label
      ctx.save();
      ctx.translate(aboveX, aboveY);
      // Apply 180° rotation for azimuths between 271°-360° and 0°-90°
      ctx.rotate(shouldRotate180 ? textAngleRad + Math.PI : textAngleRad);
      ctx.font = '17.5px calibri';
      ctx.fillStyle = '#1C39BB';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Adjust position for rightward lines
      if (isRightward) {
        ctx.translate(0, shouldRotate180 ? 5 : -15);
      }
      
      ctx.fillText(`Distance: ${dist.toFixed(precision)}`, 0, 0);
      ctx.restore();
      
      // Draw AZIMUTH label
      ctx.save();
      ctx.translate(belowX, belowY);
      // Apply 180° rotation for azimuths between 271°-360° and 0°-90°
      ctx.rotate(shouldRotate180 ? textAngleRad + Math.PI : textAngleRad);
      ctx.font = '17.5px calibri';
      ctx.fillStyle = '#1C39BB';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Adjust position for rightward lines
      if (isRightward) {
        ctx.translate(0, shouldRotate180 ? -5 : 15);
      }
      
      ctx.fillText(`Azimuth: ${azimuthDMS}`, 0, 0);
      ctx.restore();
    }
    
    ctx.restore();
  }

  return (
    <div className="cartesian-plot-container">
      <canvas 
        ref={canvasRef} 
        width="300" 
        height="300" 
        className="cartesian-plot"
      />
    </div>
  );
}

export default CartesianPlot;
