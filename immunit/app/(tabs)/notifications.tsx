import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';

const NotificationCard = ({
  icon = null,
  title = '',
  description = '',
  time = '2 hour ago',
  type = 'booster',
  onPress,
  isSeen = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  type: string;
  onPress: () => void;
  isSeen: boolean;
}) => {
  let cardBg = {};

  if (type === 'booster') {
    cardBg = {
      backgroundColor: '#FDF0D8',
      tintColor:'#020817'
    };
  } else if (type === 'good') {
    cardBg = { backgroundColor: '#DBFAE6' };
  } else if (type === 'reminder') {
    cardBg = { backgroundColor: '#D6EBFF' };

  }

  return (
    <TouchableOpacity style={styles.featureCard} onPress={onPress}>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View
          style={[
            styles.featureIconContainer,
            { ...cardBg, height: 48, width: 48, borderRadius: 12, alignSelf:'flex-start', marginTop:8 },
          ]}
        >
          {icon}
        </View>

        <View style={styles.featureContent}>
          <View
            style={{ flex: 1, flexDirection: 'row', justifyContent:'space-between', alignItems:'center'}}
          >
            <Text
              style={{
                fontSize: 16,
                lineHeight: 24,
                fontWeight: '700',
                fontFamily: 'Inter_700Bold',
                color: '#111827',
                marginBottom: 4,
              }}
            >
              {title}
            </Text>
            <View style={{flexDirection:'row', justifyContent:'flex-end', alignItems:'center', gap:8}}>
            <Text
              style={{
                fontSize: 14,
                lineHeight: 16,
                fontWeight: '400',
                fontFamily: 'Inter_400Regular',
                color: '#6B7280',
              }}
            >
              {time}
            </Text>
           {!isSeen && <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 8,
                backgroundColor: '#0080FF',
              }}
            />}
            </View>
          </View>

          <Text
            style={{
              fontSize: 14,
              lineHeight: 20,
              fontWeight: '400',
              fontFamily: 'Inter_400Regular',
              color: '#374151',
            }}
          >
            {description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<{title: string; description: string; type: string; time: string; isSeen: boolean}[]>([]);

  useEffect(() => {
    if (!user?.sub) return;
    (async () => {
      try {
        const [vaxRes, riskRes] = await Promise.all([
          apiService.getVaccineRecommendations(user.sub),
          apiService.getRiskScore(user.sub),
        ]);
        const notifs: typeof notifications = [];
        // Generate notifications from urgent vaccine recommendations
        if (vaxRes.recommendations) {
          vaxRes.recommendations.filter(r => r.urgency === 'urgent' || r.urgency === 'high').forEach(r => {
            notifs.push({
              title: 'Booster Due Soon!',
              description: `${r.vaccine_name}: ${r.recommendation}`,
              type: 'booster',
              time: 'Based on latest data',
              isSeen: false,
            });
          });
        }
        // Generate notifications from critical risk flags
        if (riskRes.critical_flags?.length > 0) {
          riskRes.critical_flags.forEach(f => {
            notifs.push({
              title: 'Critical Alert',
              description: `${f.marker}: Z-score ${f.z_score} — ${f.clinical_note || f.status}`,
              type: 'booster',
              time: 'Urgent',
              isSeen: false,
            });
          });
        }
        if (notifs.length > 0) setNotifications(notifs);
      } catch (e) {
        // Keep default hardcoded notifications
      }
    })();
  }, [user?.sub]);

  return (
    <LinearGradient
      colors={['#F0F7FF', '#FFFFFF', '#F2FDF6']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }}
    >
      <StatusBar backgroundColor="#F0F7FF" style="dark" translucent={false} />

      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Image
                source={require('../../assets/images/notification.png')}
                style={{
                  width: 24,
                  height: 24,
                  tintColor: '#FFFFFF',
                }}
                resizeMode="contain"
              />
            </View>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Notifications</Text>
              <Text style={styles.headerSubtitle}>
                Stay updated on your health
              </Text>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <>
              {/* <View style={[styles.immunitySection, { height: 137 }]}> */}
              <View
                style={{
                  marginHorizontal: 20,
                  marginBottom: 24,
                }}
              >
                <NotificationCard
                  icon={
                    <Image
                      source={require('../../assets/images/calendar.png')}
                      style={{ width: 20, height: 20 , tintColor:'#000000'}}
                    />
                  }
                  title="Booster Due Soon!"
                  description="Covid-19 vaccine booster is recommended based on current antibody levels."
                  onPress={() => {}}
                  time="2 hour ago"
                  type="booster"
                  isSeen={false}
                />
              </View>


                <View
                style={{
                  marginHorizontal: 20,
                  marginBottom: 24,
                }}
              >
                <NotificationCard
                  icon={
                    <Image
                      source={require('../../assets/images/good_news.png')}
                      style={{ width: 20, height: 20 , tintColor:'#000000'}}
                    />
                  }
                  title="Good News!"
                  description="You’re above the 90th percentile for Beta-Amyloid protection markers."
                  onPress={() => {}}
                  time="3 days ago"
                  type="good"
                  isSeen={true}
                />
              </View>



                <View
                style={{
                  marginHorizontal: 20,
                  marginBottom: 24,
                }}
              >
                <NotificationCard
                  icon={
                    <Image
                      source={require('../../assets/images/info.png')}
                      style={{ width: 20, height: 20 , tintColor:'#0073E6'}}
                    />
                  }
                  title="Reminder"
                  description="You haven’t logged any symptoms in 7 days"
                  onPress={() => {}}
                  time="1 week ago"
                  type="reminder"
                  isSeen={true}
                />
              </View>
             
            </>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
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
  keyboardView: {
    flex: 1,
  },
  headerIcon: {
    width: 30,
    height: 40,
    backgroundColor: '#0080FF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  messageContainer: {
    marginBottom: 16,
  },
  botMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  botAvatar: {
    width: 24,
    height: 24,
    backgroundColor: '#0080FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 4,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  botMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userMessageBubble: {
    backgroundColor: '#0080FF',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontFamily: 'Inter_400Regular',
    fontWeight: 400,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    color: '#020817',
  },
  botMessageText: {
    color: '#1F2937',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontFamily: 'Inter_400Regular',
    fontWeight: 400,
    fontSize: 14,
    lineHeight: 16,
    color: '#020817',
    opacity: 0.7,
  },
  botMessageTime: {
    fontFamily: 'Inter_400Regular',
    fontWeight: 400,
    fontSize: 14,
    lineHeight: 16,
    color: '#020817',
    opacity: 0.7,
  },
  userMessageTime: {
    color: '#BFDBFE',
  },
  quickQuestionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    minHeight: 124,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  quickQuestionsTitle: {
    marginBottom: 12,
    fontFamily: 'Inter_400Regular',
    fontWeight: 400,
    fontSize: 14,
    lineHeight: 16,
    color: '#020817',
  },
  quickQuestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickQuestionButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 8,
    borderColor: '#E2E8F0',
    borderWidth: 1,
  },
  quickQuestionText: {
    fontFamily: 'Inter_500Medium',
    fontWeight: 500,
    fontSize: 12,
    lineHeight: 16,
    color: '#020817',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#64748B',
    height: 48,
  },
  sendButton: {
    width: 48,
    height: 48,
    backgroundColor: '#0080FF',
    opacity: 0.5,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#0080FF',
    opacity: 1,
  },

  scrollView: {
    flex: 1,
    paddingVertical: 24,
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
  },
  vaccineType: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: '#4B5563',
    marginBottom: 2,
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
