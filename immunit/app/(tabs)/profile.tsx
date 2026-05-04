import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

export default function ProfileScreen() {
  const handleNavigateToVaccineTrends = () => {
    router.push('/screens/VaccineTrendsScreen');
  };

  const handleNavigateToAutoimmunityRadar = () => {
    router.push('/screens/AutoimmunityRadarScreen');
  };

  const handleNavigateToAutoimmunityRisk = () => {
    router.push('/screens/AutoimmunityRiskDashboard');
  };

  const handleNavigateToFitnessCognitive = () => {
    router.push('/screens/FitnessCognitiveScreen');
  };
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
                source={require('../../assets/images/user.png')}
                style={{
                  width: 24,
                  height: 24,
                  tintColor: '#FFFFFF',
                }}
                resizeMode="contain"
              />
            </View>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Profile</Text>
              <Text style={styles.headerSubtitle}>Manage your profile</Text>
            </View>
            <View style={{  width: 83,
    height: 44,
    borderRadius: 10,
    borderWidth:1,
    borderColor:'#E2E8F0',
    backgroundColor:'#FFFFFF',
    gap:9,
    flexDirection:'row',
    justifyContent: 'center',
    alignItems: 'center',}}>
              <Image
                source={require('../../assets/images/edit.png')}
                style={{
                  width: 16,
                  height: 16,
                }}
                resizeMode="contain"
              />
              <Text  style={{
                        fontSize: 14,
                        lineHeight: 20,
                        fontWeight: '500',
                        fontFamily: 'Inter_500Medium',
                        color: '#111827',
                        marginBottom: 0,
                      }}>Edit</Text>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <>
              <View style={[styles.immunitySection, { height: 137 }]}>
                <View
                  style={{
                    flexDirection: 'row',
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                  }}
                >
                  <Image
                    source={require('../../assets/images/ic_profile_icon.png')}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      overflow: 'hidden',
                    }}
                    resizeMode="contain"
                  />
                  <View
                    style={{ flex: 1, marginLeft: 16, alignSelf: 'center' }}
                  >
                    <Text
                      style={{
                        fontSize: 24,
                        lineHeight: 32,
                        fontWeight: '700',
                        fontFamily: 'Inter_700Bold',
                        color: '#111827',
                        marginBottom: 0,
                      }}
                    >
                      Ajay Verma
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        lineHeight: 24,
                        fontWeight: '400',
                        fontFamily: 'Inter_400Regular',
                        color: '#4B5563',
                      }}
                    >
                      63 years old • Male{' '}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.immunitySection}>
                <View
                  style={[
                    styles.sectionHeader,
                    {
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                    },
                  ]}
                >
                  <Image
                    source={require('../../assets/images/user.png')}
                    style={{
                      width: 20,
                      height: 20,
                      tintColor: '#0080FF',
                    }}
                    resizeMode="contain"
                  />
                  <Text
                    style={[
                      styles.sectionTitle,
                      { marginBottom: 0, marginLeft: 8 },
                    ]}
                  >
                    Personal Information
                  </Text>
                </View>

                <View style={styles.vaccinationStatus}>
                  <View style={styles.vaccinationItem}>
                    <View>
                      <Text style={styles.vaccineType}>Full Name</Text>
                      <Text style={styles.vaccineName}>Ajay Verma</Text>
                    </View>
                  </View>

                  <View style={styles.vaccinationItem}>
                    <View>
                      <View
                        style={{
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          flexDirection: 'row',
                        }}
                      >
                        <Image
                          source={require('../../assets/images/calendar.png')}
                          style={{
                            width: 16,
                            height: 16,
                            marginRight: 8,
                            tintColor: '#4B5563',
                          }}
                          resizeMode="contain"
                        />
                        <Text style={styles.vaccineType}>Date of Birth</Text>
                      </View>
                      <Text style={styles.vaccineName}>03/13/1962</Text>
                    </View>
                  </View>

                  <View style={styles.vaccinationItem}>
                    <View>
                      <Text style={styles.vaccineType}>Age</Text>
                      <Text style={styles.vaccineName}>63 years</Text>
                    </View>
                  </View>

                  <View style={styles.vaccinationItem}>
                    <View>
                      <Text style={styles.vaccineType}>Biological Sex</Text>
                      <Text style={styles.vaccineName}>Male</Text>
                    </View>
                  </View>

                  <View style={styles.vaccinationItem}>
                    <View>
                          <View
                        style={{
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          flexDirection: 'row',
                        }}
                      >
                        <Image
                          source={require('../../assets/images/heart.png')}
                          style={{
                            width: 16,
                            height: 16,
                            marginRight: 8,
                          }}
                          resizeMode="contain"
                        />
                  
                      <Text style={styles.vaccineType}>Blood Type</Text>
                      </View>
                      <Text style={styles.vaccineName}>B+</Text>
                    </View>
                  </View>

                  <View style={styles.vaccinationItem}>
                    <View>
                          <View
                        style={{
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          flexDirection: 'row',
                        }}
                      >
                        <Image
                          source={require('../../assets/images/peoples.png')}
                          style={{
                            width: 16,
                            height: 16,
                            marginRight: 8,
                            tintColor: '#4B5563',
                          }}
                          resizeMode="contain"
                        />
                  
                      <Text style={styles.vaccineType}>Ethnicity</Text>
                      </View>
                      <Text style={styles.vaccineName}>South Asian</Text>
                    </View>
                  </View>
                </View>
              </View>

                <View style={styles.immunitySection}>
                <View
                  style={[
                    styles.sectionHeader,
                    {
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                    },
                  ]}
                >
                  <Image
                    source={require('../../assets/images/email.png')}
                    style={{
                      width: 20,
                      height: 20,
                      tintColor: '#0080FF',
                    }}
                    resizeMode="contain"
                  />
                  <Text
                    style={[
                      styles.sectionTitle,
                      { marginBottom: 0, marginLeft: 8 },
                    ]}
                  >
                    Contact Information
                  </Text>
                </View>

                <View style={styles.vaccinationStatus}>
                  <View style={styles.vaccinationItem}>
                    <View>
                         <View
                        style={{
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          flexDirection: 'row',
                        }}
                      >
                        <Image
                          source={require('../../assets/images/email.png')}
                          style={{
                            width: 16,
                            height: 16,
                            marginRight: 8,
                            tintColor: '#4B5563',
                          }}
                          resizeMode="contain"
                        />
                      <Text style={styles.vaccineType}>Email</Text>
                      </View>
                      <Text style={styles.vaccineName}>ajay@formationve.com</Text>
                    </View>
                  </View>

                  <View style={styles.vaccinationItem}>
                    <View>
                      <View
                        style={{
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          flexDirection: 'row',
                        }}
                      >
                        <Image
                          source={require('../../assets/images/phone.png')}
                          style={{
                            width: 16,
                            height: 16,
                            marginRight: 8,
                            tintColor: '#4B5563',
                          }}
                          resizeMode="contain"
                        />
                        <Text style={styles.vaccineType}>Phone</Text>
                      </View>
                      <Text style={styles.vaccineName}>+1 301-938-6158</Text>
                    </View>
                  </View>

                  <View style={styles.vaccinationItem}>
                    <View>
                       <View
                        style={{
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          flexDirection: 'row',
                        }}
                      >
                        <Image
                          source={require('../../assets/images/location.png')}
                          style={{
                            width: 16,
                            height: 16,
                            marginRight: 8,
                            tintColor: '#4B5563',
                          }}
                          resizeMode="contain"
                        />
                      <Text style={styles.vaccineType}>Address</Text>
                      </View>
                      <Text style={styles.vaccineName}>Boston, MA</Text>
                    </View>
                  </View>

                  <View style={styles.vaccinationItem}>
                    <View>
                      <Text style={styles.vaccineType}>Preferred Language</Text>
                      <Text style={styles.vaccineName}>English</Text>
                    </View>
                  </View>

                </View>
              </View>


                 <View style={styles.immunitySection}>
                <View
                  style={[
                    styles.sectionHeader,
                    {
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                    },
                  ]}
                >
                  <Image
                    source={require('../../assets/images/healthicon.png')}
                    style={{
                      width: 20,
                      height: 20,
                      tintColor: '#0080FF',
                    }}
                    resizeMode="contain"
                  />
                  <Text
                    style={[
                      styles.sectionTitle,
                      { marginBottom: 0, marginLeft: 8 },
                    ]}
                  >
                    Healthcare Information
                  </Text>
                </View>

                <View style={styles.vaccinationStatus}>
                  <View style={styles.vaccinationItem}>
                    <View>
                      <Text style={styles.vaccineType}>Primary Care Provider</Text>
                      <Text style={styles.vaccineName}>Palo Alto Medical Foundation</Text>
                    </View>
                  </View>

                
                </View>
              </View>

              {/* <View style={styles.immunitySection}>
                <View
                  style={[
                    styles.sectionHeader,
                    {
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                    },
                  ]}
                >
                  <Image
                    source={require('../../assets/images/assistant.png')}
                    style={{
                      width: 20,
                      height: 20,
                      tintColor: '#0080FF',
                    }}
                    resizeMode="contain"
                  />
                  <Text
                    style={[
                      styles.sectionTitle,
                      { marginBottom: 0, marginLeft: 8 },
                    ]}
                  >
                    Health Features
                  </Text>
                </View>

                <View style={styles.navigationGrid}>
                  <TouchableOpacity
                    style={styles.navigationButton}
                    onPress={handleNavigateToVaccineTrends}
                  >
                    <View style={styles.navigationIconContainer}>
                      <Image
                        source={require('../../assets/images/notifications.png')}
                        style={styles.navigationIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={styles.navigationTitle}>Vaccine Trends</Text>
                    <Text style={styles.navigationDescription}>
                      Track your vaccination history and immunity levels
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.navigationButton}
                    onPress={handleNavigateToAutoimmunityRadar}
                  >
                    <View style={styles.navigationIconContainer}>
                      <Image
                        source={require('../../assets/images/healthicon.png')}
                        style={styles.navigationIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={styles.navigationTitle}>Autoimmunity Radar</Text>
                    <Text style={styles.navigationDescription}>
                      Monitor autoimmune markers and risk factors
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.navigationButton}
                    onPress={handleNavigateToAutoimmunityRisk}
                  >
                    <View style={styles.navigationIconContainer}>
                      <Image
                        source={require('../../assets/images/heart.png')}
                        style={styles.navigationIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={styles.navigationTitle}>Risk Dashboard</Text>
                    <Text style={styles.navigationDescription}>
                      View comprehensive autoimmunity risk assessment
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.navigationButton}
                    onPress={handleNavigateToFitnessCognitive}
                  >
                    <View style={styles.navigationIconContainer}>
                      <Image
                        source={require('../../assets/images/user.png')}
                        style={styles.navigationIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={styles.navigationTitle}>Cognitive Health & Fitness</Text>
                    <Text style={styles.navigationDescription}>
                      Track physical and mental health metrics
                    </Text>
                  </TouchableOpacity>
                </View>
              </View> */}
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
  navigationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  navigationButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  navigationIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#D6EBFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  navigationIcon: {
    width: 20,
    height: 20,
    tintColor: '#0080FF',
  },
  navigationTitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  navigationDescription: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: '#4B5563',
  },
});
