import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
import { useAuth } from '../context/AuthContext';
import { apiService, type AllergenData } from '../services/apiService';

const StatusBadge = ({
  status,
  type = 'default',
}: {
  status: string;
  type?: 'warning' | 'success' | 'danger' | 'info' | 'default';
}) => {
  const getBadgeStyle = () => {
    switch (type) {
      case 'warning':
        return styles.warningBadge;
      case 'success':
        return styles.successBadge;
      case 'danger':
        return styles.dangerBadge;
      case 'info':
        return styles.infoBadge;
      default:
        return styles.defaultBadge;
    }
  };

  const getTextStyle = () => {
    switch (type) {
      case 'warning':
        return styles.warningText;
      case 'success':
        return styles.successText;
      case 'danger':
        return styles.dangerText;
      case 'info':
        return styles.infoText;
      default:
        return styles.defaultText;
    }
  };

  return (
    <View style={getBadgeStyle()}>
      <Text style={getTextStyle()}>{status}</Text>
    </View>
  );
};

const AllergenCard = ({
  name,
  status,
  type,
  onPress,
}: {
  name: string;
  status: string;
  type: 'warning' | 'success' | 'danger' | 'info';
  onPress?: () => void;
}) => (
  <TouchableOpacity style={styles.allergenCard} onPress={onPress}>
    <Text style={styles.allergenName}>{name}</Text>
    <StatusBadge status={status} type={type} />
  </TouchableOpacity>
);

function riskToDisplay(risk: string): { status: string; type: 'warning' | 'success' | 'danger' | 'info' } {
  switch (risk) {
    case 'high': return { status: 'High Risk', type: 'danger' };
    case 'moderate': return { status: 'Moderate', type: 'warning' };
    case 'low': return { status: 'Low Risk', type: 'info' };
    case 'very_low': return { status: 'No Reaction', type: 'success' };
    default: return { status: risk, type: 'info' };
  }
}

export default function AllergenExplorerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [foodAllergens, setFoodAllergens] = useState([
    { name: 'Shellfish', status: 'In-season Now', type: 'warning' as const },
    { name: 'Tree Nuts', status: 'In-season Now', type: 'warning' as const },
    { name: 'Peanuts', status: 'In-season Now', type: 'warning' as const },
    { name: 'Eggs', status: 'No Reaction', type: 'success' as const },
    { name: 'Soy', status: 'Flag Symptoms', type: 'danger' as const },
    { name: 'Dairy', status: 'Flag Symptoms', type: 'danger' as const },
  ]);
  const [environmentalAllergens, setEnvironmentalAllergens] = useState([
    { name: 'Dust Mites', status: 'Food', type: 'info' as const },
    { name: 'Cat Dander', status: 'Food', type: 'info' as const },
    { name: 'Pollen', status: 'No Reaction', type: 'success' as const },
    { name: 'Mold', status: 'No Reaction', type: 'success' as const },
  ]);

  useEffect(() => {
    if (!user?.sub) { setLoading(false); return; }
    (async () => {
      try {
        const res = await apiService.getAllergens(user.sub);
        const data = res.allergen_data;
        if (data?.food_allergens) {
          setFoodAllergens(Object.entries(data.food_allergens).map(([name, info]) => {
            const d = riskToDisplay(info.risk_level);
            return { name: name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), status: d.status, type: d.type };
          }));
        }
        if (data?.environmental_allergens) {
          setEnvironmentalAllergens(Object.entries(data.environmental_allergens).map(([name, info]) => {
            const d = riskToDisplay(info.risk_level);
            return { name: name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), status: d.status, type: d.type };
          }));
        }
      } catch (e) {
        console.log('Allergen fetch error:', e);
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
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Allergen Explorer</Text>
          <Text style={styles.headerSubtitle}>
            Track and discover allergens
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/symptom-journal')}
        >
          <View
            style={{
              width: 83,
              height: 44,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#E2E8F0',
              backgroundColor: '#FFFFFF',
              gap: 9,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Image
              source={require('../assets/images/add.png')}
              style={{
                width: 16,
                height: 16,
              }}
              resizeMode="contain"
            />
            <Text
              style={{
                fontSize: 14,
                lineHeight: 20,
                fontWeight: '500',
                fontFamily: 'Inter_500Medium',
                color: '#111827',
                marginBottom: 0,
              }}
            >
              Add
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Food</Text>
          <View style={styles.allergenGrid}>
            {foodAllergens.map((allergen, index) => (
              <AllergenCard
                key={index}
                name={allergen.name}
                status={allergen.status}
                type={allergen.type}
                onPress={() => {
                  if (allergen.status === 'Flag Symptoms') {
                    router.push('/symptom-journal');
                  }
                }}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Environmental</Text>
          <View style={styles.allergenGrid}>
            {environmentalAllergens.map((allergen, index) => (
              <AllergenCard
                key={index}
                name={allergen.name}
                status={allergen.status}
                type={allergen.type}
              />
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.scheduleButton}>
          <Feather name="external-link" size={20} color="#FFFFFF" />
          <Text style={styles.scheduleButtonText}>Schedule Test</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
    marginBottom: 32,
  },

  sectionTitle: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    color: '#111827',
    marginBottom: 20,
  },
  allergenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  allergenCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '47%',
    minHeight: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  allergenName: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  warningBadge: {
    backgroundColor: '#FDF0D8',
    borderColor: '#F2DDB6',
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 3,
    borderRadius: 16,
    alignSelf: 'center',
  },
  successBadge: {
    backgroundColor: '#DBFAE6',
    borderColor: '#ACDCBD',
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 3,
    borderRadius: 16,
    alignSelf: 'center',
  },
  dangerBadge: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 3,
    borderRadius: 16,
    alignSelf: 'center',
  },
  infoBadge: {
    backgroundColor: '#DBEAFE',
    borderColor: '#93C5FD',
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 3,
    borderRadius: 16,
    alignSelf: 'center',
  },
  defaultBadge: {
    backgroundColor: '#F3F4F6',
    borderColor: '#F3F4F1',
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 3,
    borderRadius: 16,
    alignSelf: 'center',
  },
  warningText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: '#92400E',
  },
  successText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: '#020817',
  },
  dangerText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: '#991B1B',
  },
  infoText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: '#1E40AF',
  },
  defaultText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: '#020817',
  },
  scheduleButton: {
    backgroundColor: '#0080FF',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 40,
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
