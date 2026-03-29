import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, {
  Defs,
  Line,
  Path,
  Polygon,
  Stop,
  LinearGradient as SvgLinearGradient,
  Text as SvgText
} from 'react-native-svg';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';

const { width } = Dimensions.get('window');

interface Point {
  x: number;
  y: number;
}


const AutoimmunityRadarScreen: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'assessment', title: 'Risk Assessment Dashboard' },
    { key: 'cognitive', title: 'Cognitive Health & Fitness' },
  ]);

  // Sample data for the radar chart
  const diseases: string[] = ['Eczema', 'SLE', 'RA', 'UC', "Crohn's", 'Psoriasis'];
  const wbcData: number[] = [3.1, 3.1, 3.1, 3.1, 3.1, 3.1];
  const leukocytesData: number[] = [2.1, 2.1, 2.1, 2.1, 2.1, 2.1];
  const lymphocytesData: number[] = [3.1, 3.1, 3.1, 3.1, 3.1, 3.1];

  const center: Point = { x: 150, y: 150 };
  const maxRadius: number = 120;
  const levels: number[] = [0.1, 1.1, 2.1, 3.1, 4.1, 5.1];

  // Function to convert polar coordinates to cartesian
  const polarToCartesian = (angle: number, radius: number): Point => {
    const radian = ((angle - 90) * Math.PI) / 180;
    return {
      x: center.x + radius * Math.cos(radian),
      y: center.y + radius * Math.sin(radian),
    };
  };

  // Generate points for each dataset
  const generatePolygonPoints = (data: number[]): string => {
    return data
      .map((value: number, index: number) => {
        const angle = (360 / diseases.length) * index;
        const radius = (value / 5.1) * maxRadius;
        const point = polarToCartesian(angle, radius);
        return `${point.x},${point.y}`;
      })
      .join(' ');
  };

  const RadarChart: React.FC = () => (
    <View style={styles.chartContainer}>
      <Svg height="300" width="300" style={styles.svg}>
        {/* Grid lines */}
        {levels.map((level: number, index: number) => {
          const radius = (level / 5.1) * maxRadius;
          const points = diseases
            .map((_: string, i: number) => {
              const angle = (360 / diseases.length) * i;
              const point = polarToCartesian(angle, radius);
              return `${point.x},${point.y}`;
            })
            .join(' ');

          return (
            <Polygon
              key={index}
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

        {/* Data polygons */}
        <Polygon
          points={generatePolygonPoints(wbcData)}
          fill="rgba(168, 85, 247, 0.2)"
          stroke="#A855F7"
          strokeWidth="2"
        />
        <Polygon
          points={generatePolygonPoints(leukocytesData)}
          fill="rgba(6, 182, 212, 0.2)"
          stroke="#06B6D4"
          strokeWidth="2"
        />
        <Polygon
          points={generatePolygonPoints(lymphocytesData)}
          fill="rgba(34, 197, 94, 0.2)"
          stroke="#22C55E"
          strokeWidth="2"
        />

        {/* Level labels */}
        {levels.slice(1).map((level: number, index: number) => (
          <SvgText
            key={index}
            x={center.x + 5}
            y={center.y - ((level / 5.1) * maxRadius)}
            fontSize="12"
            fill="#9CA3AF"
            textAnchor="start"
          >
            {level}
          </SvgText>
        ))}

        {/* Disease labels */}
        {diseases.map((disease: string, index: number) => {
          const angle = (360 / diseases.length) * index;
          const labelPoint = polarToCartesian(angle, maxRadius + 30);
          return (
            <SvgText
              key={index}
              x={labelPoint.x}
              y={labelPoint.y}
              fontSize="14"
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

  const handleBackPress = (): void => {
    router.back();
  };

  const handleLearnMore = (): void => {
    // Handle learn more action
    console.log('Learn more pressed');
  };

  const AssessmentRoute = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* <Text style={styles.resultsTitle}>Your Results</Text> */}
      <RadarChart />

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#A855F7' }]} />
          <Text style={styles.legendText}>WBC</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#06B6D4' }]} />
          <Text style={styles.legendText}>Leukocytes</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#22C55E' }]} />
          <Text style={styles.legendText}>Lymphocytes</Text>
        </View>
      </View>

      <View style={styles.recommendation}>
        <Text style={styles.recommendationTitle}>Recommendation:</Text>
        <Text style={styles.recommendationText}>
          Consider follow-up testing in 3-6 months or consult with a rheumatologist.
        </Text>
      </View>

      <TouchableOpacity style={styles.learnMoreButton} onPress={handleLearnMore}>
        <Text style={styles.learnMoreText}>Learn More</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const createCurvePath = (): string => {
    return "M 20 105 C 90 98, 140 85, 200 65 C 230 50, 250 40, 260 35";
  };

  const CognitiveChart: React.FC = () => (
    <View style={styles.cognitiveChartContainer}>
      <Svg height="160" width="280" style={styles.chartSvg}>
        <Defs>
          <SvgLinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
            <Stop offset="70%" stopColor="#3B82F6" stopOpacity="0.15" />
            <Stop offset="100%" stopColor="#3B82F6" stopOpacity="0.02" />
          </SvgLinearGradient>
        </Defs>

        <Path
          d={`${createCurvePath()} L 260 120 L 20 120 Z`}
          fill="url(#gradient)"
        />

        <Path
          d={createCurvePath()}
          stroke="#3B82F6"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <SvgText
          x="15"
          y="80"
          fontSize="11"
          fill="#9CA3AF"
          textAnchor="middle"
          transform="rotate(-90 15 80)"
        >
          Protective protein expression
        </SvgText>

        <SvgText x="140" y="150" fontSize="12" fill="#9CA3AF" textAnchor="middle">
          Time
        </SvgText>

        <SvgText x="25" y="135" fontSize="10" fill="#D1D5DB">
          Jan
        </SvgText>
        <SvgText x="250" y="135" fontSize="10" fill="#D1D5DB">
          Dec
        </SvgText>
      </Svg>
    </View>
  );

  const ScoreCircle: React.FC = () => (
    <View style={styles.cognitiveScoreContainer}>
      <View style={styles.cognitiveScoreCircle}>
        <Text style={styles.cognitiveScoreNumber}>82</Text>
      </View>
    </View>
  );

  const RiskItem: React.FC<{ protein: string; detected?: boolean }> = ({ protein, detected = false }) => (
    <View style={styles.riskItem}>
      <View style={[styles.riskDot, { backgroundColor: detected ? '#EF4444' : '#D1D5DB' }]} />
      <Text style={styles.riskText}>
        {detected ? 'Detected' : ''} {protein}
      </Text>
    </View>
  );

  const CognitiveRoute = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <ScoreCircle />

      <Text style={styles.cognitiveTitle}>Cognitive Protection</Text>

      <CognitiveChart />

      <View style={styles.neuroRiskSection}>
        <Text style={styles.neuroTitle}>Neuro-risk</Text>

        <RiskItem protein="neurodegenerative risk proteins" detected={true} />

        <View style={styles.proteinList}>
          <Text style={styles.proteinName}>Amyloid-beta</Text>
          <Text style={styles.proteinName}>Tau</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.lifestyleButton} onPress={() => {}}>
        <Text style={styles.lifestyleButtonText}>Suggested lifestyle changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderScene = SceneMap({
    assessment: AssessmentRoute,
    cognitive: CognitiveRoute,
  });

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={styles.tabIndicator}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      activeColor="#111827"
      inactiveColor="#6B7280"
      scrollEnabled={false}
    />
  );

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
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Autoimmunity Radar</Text>
              <Text style={styles.subtitle}>Monitor autoimmune markers</Text>
            </View>
          </View>

          <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            renderTabBar={renderTabBar}
            onIndexChange={setIndex}
            initialLayout={{ width }}
            style={styles.tabView}
          />
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
  backArrow: {
    fontSize: 24,
    color: '#111827',
    fontWeight: '400',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '900',
    fontFamily: 'Inter_900Black',
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: '#4B5563',
  },
  content: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  tabView: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  tabBar: {
    backgroundColor: '#F3F4F6',
    marginHorizontal: 20,
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'none',
  },
  tabIndicator: {
    backgroundColor: '#FFFFFF',
    height: '80%',
    marginVertical: 4,
    marginHorizontal: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultsTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 30,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  svg: {
    backgroundColor: 'transparent',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  recommendation: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  learnMoreButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  learnMoreText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cognitiveSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  cognitiveTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    color: '#111827',
    marginBottom: 24,
    marginTop: 10,
    textAlign: 'center',
  },
  cognitiveScoreContainer: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  cognitiveScoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cognitiveScoreNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cognitiveChartContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartSvg: {
    backgroundColor: 'transparent',
  },
  neuroRiskSection: {
    width: '100%',
    marginBottom: 30,
  },
  neuroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  riskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  riskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  riskText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  proteinList: {
    marginLeft: 20,
    gap: 8,
  },
  proteinName: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '400',
  },
  lifestyleButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  lifestyleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
});

export default AutoimmunityRadarScreen;