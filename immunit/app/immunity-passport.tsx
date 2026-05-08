import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { apiService, type VaccineRecord } from '../services/apiService';

const VerifiedBadge = () => (
  <View style={styles.verifiedBadge}>
    <Text style={styles.verifiedText}>Verified</Text>
  </View>
);

const RiskBadge = ({ level }: { level: 'High Risk' | 'Food' }) => (
  <View style={[styles.riskBadge, level === 'High Risk' && styles.highRiskBadge]}>
    <Text style={[styles.riskText, level === 'High Risk' && styles.highRiskText]}>
      {level}
    </Text>
  </View>
);
export const screenOptions = {
  headerShown: false,
};

const VaccinationEntry = ({
  vaccine,
  date,
  location,
  batch,
}: {
  vaccine: string;
  date: string;
  location: string;
  batch: string;
}) => (
  <View style={styles.vaccinationEntry}>
    <View style={styles.vaccinationHeader}>
      <Text style={styles.vaccinationName}>{vaccine}</Text>
      <VerifiedBadge />
    </View>
    <View style={styles.vaccinationDetails}>
      <Text style={styles.vaccinationDetail}>Date: {date}</Text>
      <Text style={styles.vaccinationDetail}>Location: {location}</Text>
      <Text style={styles.vaccinationDetail}>Batch: {batch}</Text>
    </View>
  </View>
);

function formatDate(ts: number | string | null): string {
  if (!ts) return 'N/A';
  const d = typeof ts === 'number' ? new Date(ts * 1000) : new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

export default function ImmunityPassportScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [vaccines, setVaccines] = useState<VaccineRecord[]>([]);
  const displayName = user?.name || 'User';

  useEffect(() => {
    if (!user?.sub) { setLoading(false); return; }
    (async () => {
      try {
        const vaxRes = await apiService.getVaccineHistory(user.sub);
        setVaccines(vaxRes.vaccine_history || []);
      } catch (e) {
        console.log('Passport fetch error:', e);
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
          <Text style={styles.headerTitle}>Immunity Passport</Text>
          <Text style={styles.headerSubtitle}>Travel-ready health records</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerAction}>
            <Feather name="eye" size={20} color="#4B5563" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerAction}>
            <Feather name="download" size={20} color="#4B5563" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.passportCard}>
          <View style={styles.passportHeader}>
            <Image
              source={require('../assets/images/ic_profile_icon.png')}
              style={styles.profilePhoto}
            />
            <View style={styles.passportInfo}>
              <Text style={styles.passportName}>{displayName}</Text>
              </View>
          </View>
           <View style={styles.passportDetails}>
                <View style={styles.passportDetailRow}>
                  <Text style={styles.passportLabel}>Status</Text>
                  <Text style={styles.passportLabel}>Verified By</Text>
                </View>
                <View style={styles.passportDetailRow}>
                  <Text style={styles.passportValue}>Active</Text>
                  <Text style={styles.passportValue}>ImmuniT Platform</Text>
                </View>
              </View>

        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verified Vaccinations</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#0080FF" style={{ marginTop: 20 }} />
          ) : vaccines.length > 0 ? (
            vaccines.map((v, i) => (
              <VaccinationEntry
                key={v.record_id || i}
                vaccine={v.vaccine_name}
                date={formatDate(v.admin_date)}
                location={v.manufacturer || ''}
                batch={v.batch_number || ''}
              />
            ))
          ) : (
            <>
              <VaccinationEntry vaccine="COVID-19 (Pfizer-BioNTech)" date="3/15/2024" location="CVS Pharmacy, New York" batch="FK1234" />
              <VaccinationEntry vaccine="Yellow Fever" date="11/20/2023" location="Travel Clinic NYC" batch="YF5678" />
              <VaccinationEntry vaccine="Hepatitis A" date="6/10/2023" location="Travel Clinic NYC" batch="HA9012" />
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Allergen Profile</Text>
          
          <View style={styles.allergenEntry}>
            <View style={styles.allergenHeader}>
              <Text style={styles.allergenName}>Peanuts</Text>
              <View style={styles.allergenBadges}>
                <RiskBadge level="Food" />
                <RiskBadge level="High Risk" />
              </View>
            </View>
            
            <View style={styles.allergenDetails}>
              <View style={styles.allergenDetailRow}>
                <Feather name="map-pin" size={14} color="#4B5563" />
                <Text style={styles.allergenDetail}>
                  Last reaction: Restaurant XYZ (12/10/2023)
                </Text>
              </View>
            </View>

            <View style={styles.symptomsSection}>
              <Text style={styles.symptomsLabel}>Symptoms:</Text>
              <View style={styles.symptomTags}>
                <View style={styles.symptomTag}>
                  <Text style={styles.symptomText}>Hives</Text>
                </View>
                <View style={styles.symptomTag}>
                  <Text style={styles.symptomText}>Difficulty breathing</Text>
                </View>
                <View style={styles.symptomTag}>
                  <Text style={styles.symptomText}>Swelling</Text>
                </View>
              </View>
            </View>

            <View style={styles.riskWarning}>
              <Text style={styles.riskWarningText}>
                High Risk: Carry emergency medication and inform healthcare providers.
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.sendButton}>
          <MaterialCommunityIcons name="email-outline" size={20} color="#FFFFFF" />
          <Text style={styles.sendButtonText}>Send to Doctor</Text>
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerAction: {
    padding: 8,
  },
  passportCard: {
    backgroundColor: '#0080FF',
    borderRadius: 16,
    padding: 24,
    marginTop: 24,
    marginBottom: 24,
  },
  passportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 20,
  },
  passportInfo: {
    flex: 1,
  },
  passportName: {
    fontSize: 24,
    lineHeight:32,
    fontWeight: '900',
    fontFamily: 'Inter_900Black',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  passportDetails: {
    gap: 4,
    marginTop:16
  },
  passportDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  passportLabel: {
    fontSize: 14,
    color: '#BFDBFE',
    flex: 1,
      fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  passportValue: {
    fontSize: 16,
    lineHeight:24,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },

  vaccinationEntry: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  vaccinationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  vaccinationName: {
    fontSize: 18,
    lineHeight:28,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  vaccinationDetails: {
    gap: 4,
  },
  vaccinationDetail: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight:400,
    lineHeight:20,
    fontFamily: 'Inter_400Regular'
    
  },
  verifiedBadge: {
    backgroundColor: '#DBFAE6',
     borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 3,
    borderRadius: 16,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: '#020817',
  },
  allergenEntry: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  allergenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  allergenName: {
    fontSize: 18,
    
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    color: '#111827',
    flex: 1,
  },
  allergenBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  riskBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  highRiskBadge: {
    backgroundColor: '#FEE2E2',
  },
  riskText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: '#92400E',
  },
  highRiskText: {
    color: '#991B1B',
  },
  allergenDetails: {
    marginBottom: 16,
  },
  allergenDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  allergenDetail: {
    fontSize: 14,
    color: '#4B5563',
  },
  symptomsSection: {
    marginBottom: 16,
  },
  symptomsLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  symptomTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  symptomText: {
    fontSize: 12,
    color: '#4B5563',
  },
  riskWarning: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    // borderLeftWidth: 4,
    // borderLeftColor: ' #FEF1F1',
  },
  riskWarningText: {
    fontSize: 12,
    color: '#991B1B',
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  sendButton: {
    backgroundColor: '#0080FF',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
});