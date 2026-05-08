import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: string;
}

const QuickQuestionButton = ({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.quickQuestionButton} onPress={onPress}>
    <Text style={styles.quickQuestionText}>{title}</Text>
  </TouchableOpacity>
);

export default function AIAssistantScreen() {
  const { user } = useAuth();
  const [askedQuickQuestion, setAskedQuickQuestion] = useState(0);
  const [userData, setUserData] = useState(null as any);
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: "Hello! I'm your ImmuniT health assistant. I can answer questions about your immunity data, vaccines, allergens, and health insights. What would you like to know?",
      isBot: true,
      timestamp: '09:23 AM',
    },
  ]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (!user?.sub) return;
    (async () => {
      try {
        const data = await apiService.getImmunityData(user.sub);
        setUserData(data);
      } catch (e) {
        // Continue without data
      }
    })();
  }, [user?.sub]);

  const quickQuestions = [
    'What does my COVID immunity trend mean in comparison to my age group?',
    'How protected am I against measles',
  ];

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isBot: false,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    Keyboard.dismiss();

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(text.trim()),
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  const getBotResponse = (userText: string): string => {
    const lowerText = userText.toLowerCase();
    const vaccines = userData?.vaccine_metrics?.vaccines || {};
    const autoimmune = userData?.autoimmune_data;
    const neuro = userData?.neuroprotective_data;
    const allergens = userData?.allergen_data;

    if (lowerText.includes('covid') && (lowerText.includes('immunity') || lowerText.includes('trend'))) {
      const covid = vaccines['COVID-19'];
      if (covid) {
        return `Your COVID-19 antibody titer is ${covid.antibody_titer} AU/mL, placing you at the ${covid.population_percentile}th percentile for your age group. Status: ${covid.status}. Trend: ${covid.trend}. ${covid.status === 'waning' ? 'A booster is recommended.' : 'Your protection level looks good.'}`;
      }
      return 'I don\'t have COVID-19 data on file yet. Please complete a PepSeq test to get your antibody levels.';
    }

    if (lowerText.includes('protected') || lowerText.includes('measles') || lowerText.includes('mmr')) {
      const mmr = vaccines['MMR'];
      if (mmr) {
        return `Your MMR antibody titer is ${mmr.antibody_titer} AU/mL (${mmr.population_percentile}th percentile). Status: ${mmr.status}. You are ${mmr.status === 'protected' ? 'well protected against measles, mumps, and rubella' : 'showing waning immunity — consider a titer test'}.`;
      }
      return 'Based on typical vaccination schedules, most people retain long-term MMR protection. A titer test can confirm your current antibody levels.';
    }

    if (lowerText.includes('allergen') || lowerText.includes('allergy') || lowerText.includes('allergic')) {
      if (allergens) {
        const foodItems = Object.entries(allergens.food_allergens || {})
          .filter(([_, v]: [string, any]) => v.reactivity > 40)
          .map(([name]) => name.replace(/_/g, ' '));
        if (foodItems.length > 0) {
          return `You have elevated reactivity to: ${foodItems.join(', ')}. These allergens show moderate-to-high reactivity levels. Consider discussing avoidance strategies with your allergist.`;
        }
        return 'Your allergen profile shows mostly low reactivity levels. No high-risk food allergens detected in your latest test.';
      }
      return 'I don\'t have allergen data on file yet. Complete a PepSeq test to map your allergen reactivity profile.';
    }

    if (lowerText.includes('autoimmune') || lowerText.includes('risk')) {
      if (autoimmune) {
        const flagged = autoimmune.flagged_markers || [];
        return `Your autoimmune risk score is ${autoimmune.overall_risk_score}%. ${flagged.length > 0 ? `Flagged markers: ${flagged.join(', ')}. Please consult a rheumatologist.` : 'No markers are currently flagged. Continue routine monitoring.'}`;
      }
      return 'I don\'t have autoimmune data on file. A PepSeq test can screen for autoimmune markers.';
    }

    if (lowerText.includes('neuro') || lowerText.includes('cognitive') || lowerText.includes('brain')) {
      if (neuro) {
        return `Your cognitive protection score is ${neuro.overall_protection_score}%. This measures neuroprotective antibodies against proteins like beta-amyloid, tau, and Poly-GA. ${neuro.overall_protection_score < 50 ? 'Your score is below average — consider discussing with a neurologist.' : 'Your neuroprotective profile looks stable.'}`;
      }
    }

    if (lowerText.includes('vaccine') || lowerText.includes('booster')) {
      const vaccineList = Object.entries(vaccines).map(([name, v]: [string, any]) =>
        `${name}: ${v.protection_level}% (${v.status})`
      );
      if (vaccineList.length > 0) {
        return `Here\'s your vaccine protection summary:\n${vaccineList.join('\n')}\n\nAny vaccines marked "waning" should be discussed with your provider for a booster.`;
      }
    }

    return 'I can help you with questions about your vaccines, allergens, autoimmune markers, cognitive protection, and general health insights. Try asking about a specific topic!';
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
    setAskedQuickQuestion(askedQuickQuestion+1);
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
              source={require('../../assets/images/assistant.png')}
              style={{
                width: 24,
                height: 24,
                tintColor: '#FFFFFF',
              }}
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>AllergenAssistant</Text>
            <Text style={styles.headerSubtitle}>Chat to discover more</Text>
          </View>
        </View>

        <ScrollView
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.isBot
                  ? styles.botMessageContainer
                  : styles.userMessageContainer,
              ]}
            >
              {message.isBot && (
                <View style={styles.botAvatar}>
                  <Image
                    source={require('../../assets/images/assistant.png')}
                    style={{
                      width: 12,
                      height: 12,
                      tintColor: '#FFFFFF',
                    }}
                    resizeMode="contain"
                  />
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  message.isBot
                    ? styles.botMessageBubble
                    : styles.userMessageBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.isBot
                      ? styles.botMessageText
                      : styles.userMessageText,
                  ]}
                >
                  {message.text}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    message.isBot
                      ? styles.botMessageTime
                      : styles.userMessageTime,
                  ]}
                >
                  {message.timestamp}
                </Text>
              </View>

<View style={{ height:'100%'}}>
               {!message.isBot && (
                <View style={styles.userAvatar}>
                  <Image
                    source={require('../../assets/images/ic_profile_icon.png')}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius:12,
          
                    }}
                    resizeMode="contain"
                  />
                </View>
              )}
              </View>
            </View>
          ))}
        </ScrollView>

       {askedQuickQuestion<2 &&
        <View style={styles.quickQuestionsContainer}>
          <Text style={styles.quickQuestionsTitle}>Quick questions:</Text>
          <View style={styles.quickQuestionsGrid}>
            {quickQuestions.map((question, index) => (
              <QuickQuestionButton
                key={index}
                title={question}
                onPress={() => handleQuickQuestion(question)}
              />
            ))}
          </View>
        </View>}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Questions? Allergens, travel, etc"
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            maxLength={500}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim() && styles.sendButtonActive,
            ]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim()}
          >
            <Image
              source={require('../../assets/images/send.png')}
              style={{
                width: 20,
                height: 20,
                tintColor: '#FFFFFF',
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
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
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap:12,
    justifyContent: 'flex-end',
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
   userAvatar:{
    width: 24,
    height: 24,
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
    borderTopRightRadius: 4,
    alignSelf: 'flex-end',
  },
  messageText: {
    fontFamily: "Inter_400Regular",
    fontWeight:400,
    fontSize: 14,
    lineHeight: 20,
    marginBottom:16,
    color:'#020817'
  },
  botMessageText: {
    color: '#1F2937',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontFamily: "Inter_400Regular",
    fontWeight:400,
    fontSize: 14,
    lineHeight: 16,
    color:'#020817',
    opacity:0.7
  },
  botMessageTime: {
     fontFamily: "Inter_400Regular",
    fontWeight:400,
    fontSize: 14,
    lineHeight: 16,
    color:'#020817',
    opacity:0.7

  },
  userMessageTime: {
    color: '#BFDBFE',
  },
  quickQuestionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    minHeight:124,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  quickQuestionsTitle: {
    marginBottom: 12,
     fontFamily: "Inter_400Regular",
    fontWeight:400,
    fontSize: 14,
    lineHeight: 16,
    color:'#020817',
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
    borderColor:'#E2E8F0',
    borderWidth:1,
  },
  quickQuestionText: {
    fontFamily: "Inter_500Medium",
    fontWeight:500,
    fontSize: 12,
    lineHeight: 16,
    color:'#020817',
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
    opacity:0.5,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#0080FF',
    opacity:1
  },
});
