import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
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

export const screenOptions = {
  headerShown: false,
};

export default function VaccineDetailScreen() {
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
              <Text style={styles.headerTitle}>Vaccine Trends</Text>
              <Text style={styles.headerSubtitle}>
                More on COVID-19 (Pfizer-BioNTech)
              </Text>
            </View>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.heading}>
              COVID-19 Vaccine Trends: A Comprehensive Overview
            </Text>
            <Text style={styles.primaryDetails}>
              {
                'The trend of COVID-19 vaccinations has seen a significant evolution since the onset of the pandemic. Initially, the rollout was met with enthusiasm as healthcare workers and vulnerable populations received their doses first. As more vaccines became available, the general public began to embrace the opportunity to protect themselves and their communities. Social media campaigns and community outreach played a crucial role in encouraging vaccination, highlighting personal stories and the importance of herd immunity.'
              }
            </Text>
            <Image
              source={require('../assets/images/covid19img.png')}
              style={styles.banner}
            />
            <Text style={styles.seconaryDetails}>
              As time progressed, booster shots emerged as a key component in
              maintaining immunity against emerging variants. Public health
              officials have emphasized the need for ongoing vaccination
              efforts, especially in light of new strains that may evade
              previous immunity. The trend now reflects a growing awareness of
              the importance of vaccinations not just for individual health, but
              for global public health as well. Communities are coming together
              to host vaccination drives, making it easier for everyone to
              access the vaccine and stay safe.
            </Text>
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 20,
    lineHeight: 32,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    color: '#111827',
    flex: 1,
    marginRight: 12,
    marginVertical:16,
  },
  primaryDetails: {
    fontFamily: 'Inter_400Regular',
    lineHeight: 25,
    fontSize: 14,
    fontWeight:400,
    color: '#020817',
  },
  seconaryDetails: {
    fontFamily: 'Inter_400Regular',
    lineHeight: 25,
    fontSize: 14,
    fontWeight:400,
    color: '#020817',
  },
  banner: {
    height: 265,
    width: 358,
    borderRadius: 8,
    marginVertical:16,
    overflow: 'hidden',
  },

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
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
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
