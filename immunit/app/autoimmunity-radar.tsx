import RadarChart from '@/components/RadarChart';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendColor, { backgroundColor: color }]} />
    <Text style={styles.legendLabel}>{label}</Text>
  </View>
);

export default function AutoimmunityRadarScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [riskScore, setRiskScore] = useState(0);
  const [flagged, setFlagged] = useState<string[]>([]);
  const [recommendation, setRecommendation] = useState(
    'Consider follow-up testing in 3-6 months or consult with a rheumatologist.',
  );

  const [radarData, setRadarData] = useState([
    { label: 'Eczema', value: 5.1 },
    { label: 'SLE', value: 4.1 },
    { label: 'RA', value: 3.8 },
    { label: 'UC', value: 2.9 },
    { label: "Crohn's", value: 3.2 },
    { label: 'Psoriasis', value: 4.5 },
  ]);

  const [datasets, setDatasets] = useState([
    { data: [4.2, 3.8, 3.5, 2.9, 3.1, 4.0], color: '#B953D5', fillColor: '#B953D51A', dotRadius: 4 },
    { data: [3.1, 2.7, 2.5, 2.0, 2.2, 2.8], color: '#4CD0D9', fillColor: '#4CD0D91A', dotRadius: 4 },
    { data: [2.7, 2.3, 2.1, 1.7, 1.9, 2.4], color: '#4CD964', fillColor: '#4CD9641A', dotRadius: 4 },
  ]);

  useEffect(() => {
    if (!user?.sub) { setLoading(false); return; }
    (async () => {
      try {
        const res = await apiService.getImmunityData(user.sub);
        const data = res.autoimmune_data;
        if (data?.markers) {
          const markers = data.markers;
          const markerNames = Object.keys(markers);
          // Build radar from actual marker data
          const newRadarData = markerNames.map(name => ({
            label: name,
            value: markers[name].z_score || markers[name].reactivity_level / 10,
          }));
          if (newRadarData.length > 0) setRadarData(newRadarData);

          // Map marker values into datasets (reactivity, z-score, percentile)
          const reactivityData = markerNames.map(n => Math.abs(markers[n].reactivity_level / 15));
          const zScoreData = markerNames.map(n => Math.abs(markers[n].z_score));
          const percentileData = markerNames.map(n => markers[n].population_percentile / 25);
          setDatasets([
            { data: reactivityData, color: '#B953D5', fillColor: '#B953D51A', dotRadius: 4 },
            { data: zScoreData, color: '#4CD0D9', fillColor: '#4CD0D91A', dotRadius: 4 },
            { data: percentileData, color: '#4CD964', fillColor: '#4CD9641A', dotRadius: 4 },
          ]);

          setRiskScore(data.overall_risk_score);
          setFlagged(data.flagged_markers || []);
          if (data.flagged_markers?.length > 0) {
            setRecommendation(
              `Elevated markers detected: ${data.flagged_markers.join(', ')}. Urgent consultation with a specialist is recommended.`,
            );
          }
        }
      } catch (e) {
        console.log('Autoimmune fetch error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.sub]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Autoimmunity Radar</Text>
          <Text style={styles.headerSubtitle}>Monitor autoimmune markers</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          <View
            style={{
              flexDirection: 'column',
              flex: 1,
              width: '100%',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
            }}
          >
            <Text style={styles.sectionTitle}>Your Results</Text>
            <RadarChart
              data={radarData}
              datasets={datasets}
              width={Dimensions.get('screen').width - 50}
              height={Dimensions.get('screen').width - 50}
            />
          </View>

          <View
            style={[
              styles.legendContainer,
              {
                flexDirection: 'column',
                paddingHorizontal: 0,
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
              },
            ]}
          >
            <View style={styles.legendContainer}>
              <LegendItem color="#B953D5" label="WBC" />
              <LegendItem color="#4CD0D9" label="Leukocytes" />
            </View>
            <View style={styles.legendContainer}>
              <LegendItem color="#4CD964" label="Lymphocytes" />
            </View>
          </View>

          <View style={styles.recommendationCard}>
            <Text style={styles.recommendationTitle}>
              <Text style={styles.recommendationLabel}>Recommendation:</Text>{' '}
              Consider follow-up testing in 3-6 months or consult with a
              rheumatologist.
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.learnMoreButton}>
          <Text style={styles.learnMoreText}>Learn More</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    height: Dimensions.get('window').height,
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
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '900',
    fontFamily: 'Inter_900Black',
    color: '#111827',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: '#4B5563',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    color: '#111827',
    marginTop: 24,
    marginBottom: 20,
  },
  vaccineRecord: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  vaccineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  vaccineName: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  vaccineDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
    fontSize: 14,
    color: '#4B5563',
  },
  vaccineFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  nextDueLabel: {
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
    fontSize: 14,
    marginBottom: 4,
    color: '#4B5563',
  },
  nextDueDate: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: '#111827',
  },
  batchLabel: {
    marginTop: 16,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
    fontSize: 14,
    marginBottom: 4,
    color: '#4B5563',
  },
  batchNumber: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: '#111827',
  },
  protectedBadge: {
    backgroundColor: '#DBFAE6',
    borderColor: '#ACDCBD',
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 3,
    borderRadius: 16,
  },
  monitorBadge: {
       backgroundColor: ' #FDF0D8',
    borderColor: '#F2DDB6',
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 3,
    borderRadius: 16,
  },
  defaultBadge: {
    backgroundColor: '#F3F4F6',
    borderColor: '#F3F4F1',
     borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 3,
    borderRadius: 16,
  },

  badgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
    color: '#020817',
  },
  protectedText: {
    color: '#020817',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  actionButtons: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    gap: 12,
    height: 60,
    marginBottom: 40,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#0080FF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 24,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  secondaryButtonText: {
    color: '#4B5563',
    fontSize: 12,
    lineHeight: 24,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },

  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  legendItem: {
    width: 155,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendLabel: {
    fontFamily:'Inter_400Regular',
    fontSize: 12,
    lineHeight:14,
    fontWeight: '400',
    color: '#020817',
  },
  recommendationCard: {
    backgroundColor: '#FEF9F0',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    //borderLeftWidth: 4,
    // borderLeftColor: '#0080FF',
  },
  recommendationTitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    fontWeight: 400,
    color: '#020817',
    lineHeight: 20,
  },
  recommendationLabel: {
    color: '#020817',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  learnMoreButton: {
    backgroundColor: '#0080FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  learnMoreText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  aiAssistantButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0080FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  aiIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0080FF',
  },
});
