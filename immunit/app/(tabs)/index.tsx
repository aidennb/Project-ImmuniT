import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { apiService, type DashboardSummary, type VaccineRecord } from '../../services/apiService';

const StatusBadge = ({
  status,
  type = 'default',
}: {
  status: string;
  type?: 'success' | 'warning' | 'default';
}) => {
  const badgeStyle =
    type === 'success'
      ? styles.protectedBadge
      : type === 'warning'
      ? styles.monitorBadge
      : styles.defaultBadge;

  return (
    <View style={badgeStyle}>
      <Text
        style={[styles.badgeText, type === 'success' && styles.protectedText]}
      >
        {status}
      </Text>
    </View>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.featureCard} onPress={onPress}>
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 48,
      }}
    >
      <View style={styles.featureIconContainer}>{icon}</View>
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
          paddingEnd: 12,
        }}
      >
        <Feather name="chevron-right" size={20} color="#9CA3AF" />
      </View>
    </View>

    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [vaccines, setVaccines] = useState<VaccineRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.sub) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const [dashData, vaxData] = await Promise.all([
          apiService.getDashboard(user.sub),
          apiService.getVaccinations(user.sub),
        ]);
        setDashboard(dashData);
        setVaccines(vaxData.vaccinations || []);
      } catch (e) {
        // Fall back to showing the UI without data
        console.log('API fetch error (using fallback UI):', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.sub]);

  const displayName = dashboard?.user
    ? `${dashboard.user.first_name} ${dashboard.user.last_name}`
    : user?.name || 'User';

  const protectedCount = dashboard?.vaccine_summary?.protected ?? 0;
  const totalVaccines = dashboard?.vaccine_summary?.total ?? 0;
  const waningCount = dashboard?.vaccine_summary?.waning ?? 0;

  // Build vaccine status items from real data or fallback
  const vaccineItems = vaccines.length > 0
    ? vaccines.slice(0, 3).map(v => ({
        name: v.vaccine_name.replace(/\s*\(.*\)/, ''),
        status: v.protection_status === 'protected' ? 'Protected'
          : v.protection_status === 'waning' ? 'Monitor' : 'Unprotected',
        type: (v.protection_status === 'protected' ? 'success' : 'warning') as 'success' | 'warning',
      }))
    : [
        { name: 'COVID-19', status: 'Protected', type: 'success' as const },
        { name: 'Tetanus', status: 'Monitor', type: 'warning' as const },
      ];

  return (
    <LinearGradient
      colors={['#F0F7FF', '#FFFFFF', '#F2FDF6']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }}
    >
      <StatusBar backgroundColor="#F0F7FF" style="dark" translucent={false} />

      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome</Text>
            <Text style={styles.userName}>{displayName}</Text>
          </View>
          {/* <TouchableOpacity style={styles.infoButton}>
            <Feather name="info" size={24} color="#0080FF" />
          </TouchableOpacity> */}
        </View>
        <View
          style={{
            height: 1,
            width: '100%',
            backgroundColor: '##E5E7EB',
            marginBottom: 16,
          }}
        />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <>
            <View style={styles.immunitySection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Immunity Summary</Text>
                <TouchableOpacity>
                  <MaterialCommunityIcons
                    name="shield-outline"
                    size={24}
                    color="#0080FF"
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionSubtitle}>
                Current Vaccination Status
              </Text>

              {loading ? (
                <ActivityIndicator size="small" color="#0080FF" style={{ marginVertical: 20 }} />
              ) : (
                <>
                  <View style={styles.vaccinationStatus}>
                    {vaccineItems.map((item, idx) => (
                      <View key={idx} style={styles.vaccinationItem}>
                        <View>
                          <Text style={styles.vaccineName}>{item.name}</Text>
                          <Text style={styles.vaccineType}>Vaccination</Text>
                        </View>
                        <StatusBadge status={item.status} type={item.type} />
                      </View>
                    ))}
                  </View>

                  <View style={styles.overallStatus}>
                    <Text style={styles.overallLabel}>Overall Status</Text>
                    <Text style={styles.overallValue}>
                      {totalVaccines > 0
                        ? `${protectedCount} of ${totalVaccines} up to date${waningCount > 0 ? ` (${waningCount} waning)` : ''}`
                        : `${vaccineItems.length} of ${vaccineItems.length} up to date`}
                    </Text>
                  </View>
                </>
              )}
            </View>

            <View style={styles.featuresSection}>
              <FeatureCard
                icon={
                  <Image
                    source={require('../../assets/images/tracker.png')}
                    style={{ width: 20, height: 20, tintColor: '#0080FF' }}
                  />
                  // <MaterialCommunityIcons
                  //   name="pulse"
                  //   size={24}
                  //   color="#0080FF"
                  // />
                }
                title="Vaccine Tracker"
                description="Track your vaccination history"
                onPress={() => router.push('/vaccine-tracker')}
              />

              <FeatureCard
                icon={
                  <Image
                    source={require('../../assets/images/radar.png')}
                    style={{ width: 20, height: 20, tintColor: '#0080FF' }}
                  />

                  // <MaterialCommunityIcons
                  //   name="shield-outline"
                  //   size={24}
                  //   color="#0080FF"
                  // />
                }
                title="Autoimmunity Radar"
                description="Monitor autoimmune markers"
                onPress={() => router.push('/screens/AutoimmunityRadarScreen')}
              />

              <FeatureCard
                icon={
                  <Image
                    source={require('../../assets/images/explorer.png')}
                    style={{ width: 20, height: 20, tintColor: '#0080FF' }}
                  />

                  // <Feather name="search" size={24} color="#0080FF" />
                }
                title="Allergen Explorer"
                description="Discover potential allergens"
                onPress={() => router.push('/allergen-explorer')}
              />

              <FeatureCard
                icon={
                  <Image
                    source={require('../../assets/images/bookmark.png')}
                    style={{ width: 20, height: 20, tintColor: '#0080FF' }}
                  />

                  // <FontAwesome name="bookmark-o" size={24} color="#0080FF" />
                }
                title="Immunity Passport"
                description="Travel-ready health records"
                onPress={() => router.push('/immunity-passport')}
              />

              {/* <FeatureCard
                icon={
                  <Image
                    source={require('../../assets/images/notifications.png')}
                    style={{ width: 20, height: 20, tintColor: '#0080FF' }}
                  />
                }
                title="Vaccine Trends"
                description="Track your vaccination history and immunity levels"
                onPress={() => router.push('/screens/VaccineTrendsScreen')}
              /> */}

              {/* <FeatureCard
                icon={
                  <Image
                    source={require('../../assets/images/heart.png')}
                    style={{ width: 20, height: 20, tintColor: '#0080FF' }}
                  />
                }
                title="Risk Dashboard"
                description="View comprehensive autoimmunity risk assessment"
                onPress={() => router.push('/screens/AutoimmunityRiskDashboard')}
              /> */}

              {/* <FeatureCard
                icon={
                  <Image
                    source={require('../../assets/images/user.png')}
                    style={{ width: 20, height: 20, tintColor: '#0080FF' }}
                  />
                }
                title="Cognitive Health & Fitness"
                description="Track physical and mental health metrics"
                onPress={() => router.push('/screens/FitnessCognitiveScreen')}
              /> */}
            </View>
          </>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  welcomeText: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '900',
    fontFamily: 'Inter_900Black',
    color: '#111827',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
  },
  infoButton: {
    padding: 8,
  },
  immunitySection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
    fontFamily: 'Inter_400Regular',
    marginBottom: 16,
  },
  vaccinationStatus: {
    gap: 12,
    marginBottom: 20,
  },
  vaccinationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  vaccineName: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: '#111827',
    marginBottom: 2,
  },
  vaccineType: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: '#4B5563',
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
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
  overallStatus: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  overallLabel: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
  },
  overallValue: {
    lineHeight: 28,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    color: '#020817',
  },
  featuresSection: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 100,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    gap: 12,
    padding: 16,
    flexDirection: 'column',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#D6EBFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
    marginTop: 8,
  },
  featureTitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    color: '#111827',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: '#4B5563',
  },
});
