import React from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Svg, {
    Line,
    Polygon,
    Text as SvgText,
} from 'react-native-svg';

interface Point {
  x: number;
  y: number;
}

interface RiskIndicatorProps {
  disease: string;
  level: string;
  color: string;
}

const AutoimmunityRiskDashboard: React.FC = () => {
  const diseases: string[] = ['Lupus', 'Type 1\nDiabetes', 'Scleroderma', 'Celiac', 'Risk'];
  const riskLevels: number[] = [4.2, 1.8, 1.5, 1.2, 3.8]; // Sample risk levels

  const center: Point = { x: 100, y: 80 };
  const maxRadius: number = 70;

  // Function to convert polar coordinates to cartesian
  const polarToCartesian = (angle: number, radius: number): Point => {
    const radian = ((angle - 90) * Math.PI) / 180;
    return {
      x: center.x + radius * Math.cos(radian),
      y: center.y + radius * Math.sin(radian),
    };
  };

  // Generate points for the risk polygon
  const generatePolygonPoints = (data: number[]): string => {
    return data
      .map((value: number, index: number) => {
        const angle = (360 / diseases.length) * index;
        const radius = (value / 5) * maxRadius;
        const point = polarToCartesian(angle, radius);
        return `${point.x},${point.y}`;
      })
      .join(' ');
  };

  const RiskRadarChart: React.FC = () => (
    <View style={styles.radarContainer}>
      <Svg height="160" width="200" style={styles.svg}>
        {/* Grid levels */}
        {[1, 2, 3, 4, 5].map((level: number) => {
          const radius = (level / 5) * maxRadius;
          const points = diseases
            .map((_: string, i: number) => {
              const angle = (360 / diseases.length) * i;
              const point = polarToCartesian(angle, radius);
              return `${point.x},${point.y}`;
            })
            .join(' ');

          return (
            <Polygon
              key={level}
              points={points}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          );
        })}

        {/* Axis lines */}
        {diseases.map((_: string, index: number) => {
          const angle = (360 / diseases.length) * index;
          const endPoint = polarToCartesian(angle, maxRadius);
          return (
            <Line
              key={index}
              x1={center.x}
              y1={center.y}
              x2={endPoint.x}
              y2={endPoint.y}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          );
        })}

        {/* Risk data polygon */}
        <Polygon
          points={generatePolygonPoints(riskLevels)}
          fill="rgba(239, 68, 68, 0.3)"
          stroke="#EF4444"
          strokeWidth="2"
        />

        {/* Disease labels */}
        {diseases.map((disease: string, index: number) => {
          const angle = (360 / diseases.length) * index;
          const labelPoint = polarToCartesian(angle, maxRadius + 25);
          return (
            <SvgText
              key={index}
              x={labelPoint.x}
              y={labelPoint.y}
              fontSize="11"
              fill="#374151"
              textAnchor="middle"
              fontWeight="500"
            >
              {disease}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );

  const RiskIndicator: React.FC<RiskIndicatorProps> = ({ disease, level, color }) => (
    <View style={styles.riskItem}>
      <View style={[styles.riskDot, { backgroundColor: color }]} />
      <Text style={styles.riskText}>{disease}</Text>
    </View>
  );

  const handleBackPress = (): void => {
    router.back();
  };

  return (
    <LinearGradient
      colors={["#F0F7FF", "#FFFFFF", "#F2FDF6"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.keyboardContent}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <StatusBar barStyle="dark-content" backgroundColor="#F0F7FF" />
          
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.screenTitle}>Autoimmunity Risk Dashboard</Text>
              <Text style={styles.screenSubtitle}>View comprehensive autoimmunity risk assessment</Text>
            </View>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        <View style={styles.chartSection}>
          <RiskRadarChart />
          
          <Text style={styles.biomarkerText}>
            This biomarker is{'\n'}elevated above{'\n'}population normal
          </Text>
        </View>

        <View style={styles.riskBreakdown}>
          <Text style={styles.breakdownTitle}>Breakdown by Disease Risk</Text>
          
          <View style={styles.riskList}>
            <RiskIndicator disease="Lupus" level="High" color="#EF4444" />
            <RiskIndicator disease="Type 1 Diabetes" level="Low" color="#60A5FA" />
            <RiskIndicator disease="Celiac" level="Low" color="#60A5FA" />
            <RiskIndicator disease="Scleroderma" level="Low" color="#60A5FA" />
            <RiskIndicator disease="RA" level="Low" color="#60A5FA" />
          </View>
        </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContent: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  backIcon: {
    fontSize: 24,
    color: '#111827',
    fontWeight: '400',
  },
  headerContent: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '900',
    fontFamily: 'Inter_900Black',
    color: '#111827',
    marginBottom: 2,
  },
  screenSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: '#4B5563',
  },
  chartSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  radarContainer: {
    marginBottom: 20,
  },
  svg: {
    backgroundColor: 'transparent',
  },
  biomarkerText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
  },
  riskBreakdown: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  breakdownTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  riskList: {
    gap: 16,
  },
  riskItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  riskText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
});

export default AutoimmunityRiskDashboard;