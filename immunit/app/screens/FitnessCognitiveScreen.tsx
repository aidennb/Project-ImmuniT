import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import Svg, {
  Defs,
  Path,
  Stop,
  LinearGradient as SvgLinearGradient,
  Text as SvgText
} from 'react-native-svg';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';

interface RiskItemProps {
  protein: string;
  detected?: boolean;
}

const FitnessCognitiveScreen: React.FC = () => {
  const { user } = useAuth();
  const [protectionScore, setProtectionScore] = useState(82);
  const [riskProteins, setRiskProteins] = useState<{ name: string; detected: boolean }[]>([
    { name: 'Amyloid-beta', detected: true },
    { name: 'Tau', detected: false },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.sub) { setLoading(false); return; }
    (async () => {
      try {
        const res = await apiService.getNeuroprotectiveMarkers(user.sub);
        const data = res.neuroprotective_data;
        if (data) {
          setProtectionScore(data.overall_protection_score);
          if (data.markers) {
            const proteins = Object.entries(data.markers).map(([name, info]) => ({
              name: name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
              detected: info.status === 'low' || info.status === 'critical_elevation',
            }));
            setRiskProteins(proteins);
          }
        }
      } catch (e) {
        console.log('Neuro fetch error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.sub]);

  // Data for the cognitive protection trend curve
  const createCurvePath = (): string => {
    // Smooth exponential curve that matches reference design
    // Gentle start with consistent acceleration, no flat sections or sharp jumps
    return "M 20 105 C 90 98, 140 85, 200 65 C 230 50, 250 40, 260 35";
  };

  const CognitiveChart: React.FC = () => (
    <View style={styles.chartContainer}>
      <Svg height="160" width="280" style={styles.chartSvg}>
        <Defs>
          <SvgLinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
            <Stop offset="70%" stopColor="#3B82F6" stopOpacity="0.15" />
            <Stop offset="100%" stopColor="#3B82F6" stopOpacity="0.02" />
          </SvgLinearGradient>
        </Defs>
        
        {/* Fill area under curve with cleaner gradient */}
        <Path
          d={`${createCurvePath()} L 260 120 L 20 120 Z`}
          fill="url(#gradient)"
        />
        
        {/* Main curve line */}
        <Path
          d={createCurvePath()}
          stroke="#3B82F6"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Y-axis label */}
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
        
        {/* X-axis label */}
        <SvgText x="140" y="150" fontSize="12" fill="#9CA3AF" textAnchor="middle">
          Time
        </SvgText>
        
        {/* Add some baseline grid lines for reference */}
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
    <View style={styles.scoreContainer}>
      <View style={styles.scoreCircle}>
        <Text style={styles.scoreNumber}>{protectionScore}</Text>
      </View>
    </View>
  );

  const RiskItem: React.FC<RiskItemProps> = ({ protein, detected = false }) => (
    <View style={styles.riskItem}>
      <View style={[styles.riskDot, { backgroundColor: detected ? '#EF4444' : '#D1D5DB' }]} />
      <Text style={styles.riskText}>
        {detected ? 'Detected' : ''} {protein}
      </Text>
    </View>
  );

  const handleLifestyleChanges = (): void => {
    console.log('Suggested lifestyle changes pressed');
  };

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
              <Text style={styles.screenTitle}>Cognitive Health & Fitness</Text>
              <Text style={styles.screenSubtitle}>Track physical and mental health metrics</Text>
            </View>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        <View style={styles.content}>
          <ScoreCircle />
          
          <Text style={styles.sectionTitle}>Cognitive Protection</Text>

          <CognitiveChart />

          <View style={styles.neuroRiskSection}>
            <Text style={styles.neuroTitle}>Neuro-risk</Text>

            <RiskItem protein="neurodegenerative risk proteins" detected={riskProteins.some(p => p.detected)} />

            <View style={styles.proteinList}>
              {riskProteins.map((p, i) => (
                <Text key={i} style={[styles.proteinName, p.detected && { color: '#EF4444' }]}>{p.name}</Text>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.lifestyleButton} onPress={handleLifestyleChanges}>
            <Text style={styles.lifestyleButtonText}>Suggested lifestyle changes</Text>
          </TouchableOpacity>
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
  content: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
    alignItems: 'center',
  },
  scoreContainer: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
  scoreNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    color: '#111827',
    marginBottom: 24,
    marginTop: 10,
  },
  chartContainer: {
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
});

export default FitnessCognitiveScreen;