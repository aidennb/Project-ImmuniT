import React from 'react';
import { Dimensions, View } from 'react-native';
import Svg, { Circle, G, Line, Polygon, Text as SvgText } from 'react-native-svg';

interface RadarChartProps {
  data: {
    label: string;
    value: number;
  }[];
  datasets: {
    data: number[];
    color: string;
    fillColor: string;
  }[];
  width?: number;
  height?: number;
}

export default function RadarChart({ 
  data, 
  datasets, 
  width = Dimensions.get('window').width - 40,
  height = 300 
}: RadarChartProps) {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) - 60;
  const maxValue = 5;
  const levels = 5;

  // Calculate angle for each point
  const angleStep = (2 * Math.PI) / data.length;

  // Generate grid lines (concentric polygons)
  const generateGridLines = () => {
    const lines = [];
    for (let level = 1; level <= levels; level++) {
      const levelRadius = (radius * level) / levels;
      const points = data.map((_, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const x = centerX + levelRadius * Math.cos(angle);
        const y = centerY + levelRadius * Math.sin(angle);
        return `${x},${y}`;
      }).join(' ');
      
      lines.push(
        <Polygon
          key={`grid-${level}`}
          points={points}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="1"
        />
      );
    }
    return lines;
  };

  // Generate axis lines
  const generateAxisLines = () => {
    return data.map((_, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      return (
        <Line
          key={`axis-${index}`}
          x1={centerX}
          y1={centerY}
          x2={x}
          y2={y}
          stroke="#E5E7EB"
          strokeWidth="1"
        />
      );
    });
  };

  // Generate labels
  const generateLabels = () => {
    return data.map((item, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const labelRadius = radius + 30;
      const x = centerX + labelRadius * Math.cos(angle);
      const y = centerY + labelRadius * Math.sin(angle);
      
      return (
        <SvgText
          key={`label-${index}`}
          x={x}
          y={y}
          fontSize="12"
          fill="#6B7280"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {item.label}
        </SvgText>
      );
    });
  };

  // Generate value labels on grid
  const generateValueLabels = () => {
    const labels = [];
    for (let level = 1; level <= levels; level++) {
      const value = (maxValue * level) / levels;
      const levelRadius = (radius * level) / levels;
      
      labels.push(
        <SvgText
          key={`value-${level}`}
          x={centerX + 5}
          y={centerY - levelRadius + 3}
          fontSize="10"
          fill="#9CA3AF"
          textAnchor="start"
        >
          {value.toFixed(1)}
        </SvgText>
      );
    }
    return labels;
  };

  // Generate data polygons
  const generateDataPolygons = () => {
    return datasets.map((dataset, datasetIndex) => {
      const points = dataset.data.map((value, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const valueRadius = (radius * value) / maxValue;
        const x = centerX + valueRadius * Math.cos(angle);
        const y = centerY + valueRadius * Math.sin(angle);
        return `${x},${y}`;
      }).join(' ');

      return (
        <G key={`dataset-${datasetIndex}`}>
          <Polygon
            points={points}
            fill={dataset.fillColor}
            stroke={dataset.color}
            strokeWidth="2"
            fillOpacity="0.3"
          />
          {dataset.data.map((value, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const valueRadius = (radius * value) / maxValue;
            const x = centerX + valueRadius * Math.cos(angle);
            const y = centerY + valueRadius * Math.sin(angle);
            
            return (
              <Circle
                key={`point-${datasetIndex}-${index}`}
                cx={x}
                cy={y}
                r="4"
                fill={dataset.color}
              />
            );
          })}
        </G>
      );
    });
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={width} height={height}>
        {generateGridLines()}
        {generateAxisLines()}
        {generateValueLabels()}
        {generateDataPolygons()}
        {generateLabels()}
      </Svg>
    </View>
  );
}