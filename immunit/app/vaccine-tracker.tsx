import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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

export const screenOptions = {
  headerShown: false,
};
const VaccineRecord = ({
  vaccine,
  status,
  administered,
  location,
  nextDue,
  batch,
  type,
}: {
  vaccine: string;
  status: string;
  administered: string;
  location: string;
  nextDue: string;
  batch: string;
  type: 'success' | 'warning';
}) => (
  <TouchableOpacity  onPress={() => router.push('/vaccine-detail')}>
  <View style={styles.vaccineRecord}>
    <View style={styles.vaccineHeader}>
      <Text style={styles.vaccineName}>{vaccine}</Text>
      <StatusBadge status={status} type={type} />
    </View>

    <View style={styles.vaccineDetails}>
      <View style={styles.detailRow}>
        <Feather name="calendar" size={16} color="#4B5563" />
        <Text style={styles.detailLabel}>Administered: {administered}</Text>
      </View>
      <View style={styles.detailRow}>
        <Feather name="map-pin" size={16} color="#4B5563" />
        <Text style={styles.detailLabel}>{location}</Text>
      </View>
    </View>

    <View style={styles.vaccineFooter}>
      <View>
        <Text style={styles.nextDueLabel}>Next Due Date</Text>
        <Text style={styles.nextDueDate}>{nextDue}</Text>
      </View>
      <View>
        <Text style={styles.batchLabel}>Batch Number</Text>
        <Text style={styles.batchNumber}>{batch}</Text>
      </View>
    </View>
  </View>
  </TouchableOpacity>
);

export default function VaccineTrackerScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#F0F7FF', '#FFFFFF', '#F2FDF6']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }}
    >
      <StatusBar backgroundColor="#F0F7FF" style="dark" translucent={false} />

      <SafeAreaView style={styles.container}>
        <View style={[styles.container, { flex: 1 }]}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color="#111827"
              />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Vaccine Tracker</Text>
              <Text style={styles.headerSubtitle}>
                Your vaccination history
              </Text>
            </View>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionTitle}>Vaccination Records</Text>

            <VaccineRecord
              vaccine="COVID-19 (Pfizer-BioNTech)"
              status="Protected"
              administered="3/15/2024"
              location="CVS Pharmacy, New York"
              nextDue="9/15/2024"
              batch="FK1234"
              type="success"
            />

            <VaccineRecord
              vaccine="Tetanus (Td)"
              status="Monitor"
              administered="8/20/2023"
              location="City Health Center"
              nextDue="8/20/2025"
              batch="TD5678"
              type="warning"
            />

            <VaccineRecord
              vaccine="Hepatitis A"
              status="Protected"
              administered="6/10/2023"
              location="Travel Clinic NYC"
              nextDue="6/10/2025"
              batch="HA9012"
              type="success"
            />
          </ScrollView>
        </View>
      </SafeAreaView>
      <View
        style={[
          styles.actionButtons,
          {
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: '#ffffff',
          },
        ]}
      >
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/vaccine-trends')}>
          <Feather name="info" size={20} color="#4B5563" />
          <Text style={styles.secondaryButtonText}>View Trends</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton}>
          {/* <MaterialCommunityIcons name="share" size={20} color="#FFFFFF" /> */}
          <Image
            source={require('../assets/images/share.png')}
            style={{
              width: 20,
              height: 20,
              tintColor: '#FFFFFF',
            }}
            resizeMode="contain"
          />
          <Text style={styles.primaryButtonText}>Schedule Booster</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
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
});
