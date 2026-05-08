import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'signup' | 'confirm'>('signup');
  const [confirmCode, setConfirmCode] = useState('');
  const router = useRouter();
  const { signup, confirmSignUp, login } = useAuth();
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });

  if (!fontsLoaded) return null;

  const handleSignUp = async () => {
    if (!email || !password || !firstName) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await signup(email, password, `${firstName} ${lastName}`, '');
      setStep('confirm');
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message || 'Could not create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirmCode) {
      Alert.alert('Error', 'Please enter the verification code.');
      return;
    }
    setLoading(true);
    try {
      await confirmSignUp(email, confirmCode);
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message || 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'confirm') {
    return (
      <LinearGradient colors={["#F0F7FF", "#FFFFFF", "#F2FDF6"]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.card}>
              <View style={styles.logoSection}>
                <Image source={require('../assets/images/new_logo.png')} style={{ width: 128, height: 96, overflow: 'hidden' }} resizeMode="contain" />
              </View>
              <Text style={styles.title}>Verify Your Email</Text>
              <Text style={styles.subtitle}>We sent a code to {email}</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Verification Code</Text>
                <TextInput style={styles.input} placeholder="Enter 6-digit code" placeholderTextColor="#9CA3AF" value={confirmCode} onChangeText={setConfirmCode} keyboardType="number-pad" autoFocus />
              </View>
              <TouchableOpacity style={[styles.button, loading && { opacity: 0.7 }]} onPress={handleConfirm} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Verify & Sign In</Text>}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#F0F7FF", "#FFFFFF", "#F2FDF6"]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <View style={styles.card}>
              <View style={styles.logoSection}>
                <Image source={require('../assets/images/new_logo.png')} style={{ width: 128, height: 96, overflow: 'hidden' }} resizeMode="contain" />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>First Name *</Text>
                  <TextInput style={styles.input} placeholder="First name" placeholderTextColor="#9CA3AF" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput style={styles.input} placeholder="Last name" placeholderTextColor="#9CA3AF" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput style={styles.input} placeholder="Enter your email" placeholderTextColor="#9CA3AF" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput style={styles.passwordInput} placeholder="Min 8 characters" placeholderTextColor="#9CA3AF" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoCapitalize="none" />
                  <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                    <MaterialCommunityIcons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password *</Text>
                <TextInput style={styles.input} placeholder="Confirm password" placeholderTextColor="#9CA3AF" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry autoCapitalize="none" />
              </View>

              <TouchableOpacity style={[styles.button, loading && { opacity: 0.7 }]} onPress={handleSignUp} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Create Account</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.linkButton} onPress={() => router.back()}>
                <Text style={styles.linkText}>Already have an account? <Text style={{ fontWeight: '600', color: '#0073E6' }}>Sign In</Text></Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.securityText}>Protected by industry-standard encryption</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 20 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 10,
    gap: 16,
  },
  logoSection: { alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', fontFamily: 'Inter_700Bold', color: '#111827', textAlign: 'center' },
  subtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#4B5563', textAlign: 'center', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 12 },
  inputGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', fontFamily: 'Inter_600SemiBold', color: '#374151' },
  input: {
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 16,
    backgroundColor: '#FFFFFF', color: '#111827', fontFamily: 'Inter_400Regular',
  },
  passwordContainer: { position: 'relative' as const },
  passwordInput: {
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, paddingRight: 50, fontSize: 16,
    backgroundColor: '#FFFFFF', color: '#111827', fontFamily: 'Inter_400Regular',
  },
  eyeIcon: { position: 'absolute' as const, right: 16, top: 14, padding: 4 },
  button: {
    backgroundColor: '#0080FF', borderRadius: 12, paddingVertical: 16,
    alignItems: 'center' as const, marginTop: 4,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  linkButton: { alignItems: 'center' as const, marginTop: 4 },
  linkText: { color: '#4B5563', fontSize: 14, fontFamily: 'Inter_400Regular' },
  securityText: {
    textAlign: 'center' as const, color: '#4B5563', fontSize: 14, marginTop: 24,
    fontFamily: 'Inter_400Regular',
  },
});
