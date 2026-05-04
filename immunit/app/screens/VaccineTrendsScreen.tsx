import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Svg, {
    Circle,
    Line,
    Path,
    Rect,
    Text as SvgText,
} from 'react-native-svg';
// Import these packages when implementing actual PDF export:
// import * as Print from 'expo-print';
// import * as Sharing from 'expo-sharing';

interface DataPoint {
  x: number;
  y: number;
  value: number;
}

interface DropdownButtonProps {
  title: string;
  value: string;
  onPress: () => void;
}

interface NoteItemProps {
  text: string;
  isToggled?: boolean;
  onToggle?: () => void;
}

interface ActionButtonProps {
  title: string;
  icon: string;
  onPress: () => void;
  style?: object;
}

const VaccineTrendsScreen: React.FC = () => {
  const [selectedVaccine, setSelectedVaccine] = useState<string>('COVID-19');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('Jan 2023 - Jun 2025');
  const [showVaccineModal, setShowVaccineModal] = useState<boolean>(false);
  const [showDateModal, setShowDateModal] = useState<boolean>(false);
  const [noteToggleStates, setNoteToggleStates] = useState<{[key: string]: boolean}>({
    lastDose: true,
    nextRecommended: true,
    protectionThreshold: false,
  });

  const vaccineOptions = [
    'COVID-19',
    'Influenza',
    'Hepatitis B',
    'Tetanus',
    'MMR',
    'Pneumococcal',
    'HPV',
    'Meningococcal'
  ];

  const dateRangeOptions = [
    'Jan 2023 - Jun 2025',
    'Jan 2022 - Dec 2024',
    'Jun 2023 - Dec 2025',
    'Last 6 months',
    'Last 12 months',
    'Last 24 months'
  ];

  // Sample data points for the antibody titer trend (varies by vaccine and toggles)
  const getDataPoints = (): DataPoint[] => {
    let basePoints: DataPoint[] = [];

    switch (selectedVaccine) {
      case 'COVID-19':
        basePoints = [
          { x: 10, y: 30, value: 800 },
          { x: 40, y: 55, value: 650 },
          { x: 70, y: 70, value: 500 },
          { x: 100, y: 85, value: 400 },
          { x: 130, y: 105, value: 300 },
          { x: 160, y: 125, value: 250 },
          { x: 190, y: 145, value: 200 },
          { x: 220, y: 165, value: 150 },
          { x: 250, y: 180, value: 100 },
        ];
        break;
      case 'Influenza':
        basePoints = [
          { x: 10, y: 35, value: 700 },
          { x: 40, y: 65, value: 550 },
          { x: 70, y: 80, value: 400 },
          { x: 100, y: 95, value: 300 },
          { x: 130, y: 115, value: 200 },
          { x: 160, y: 135, value: 150 },
          { x: 190, y: 155, value: 100 },
          { x: 220, y: 175, value: 80 },
          { x: 250, y: 190, value: 60 },
        ];
        break;
      default:
        basePoints = [
          { x: 10, y: 30, value: 750 },
          { x: 40, y: 60, value: 600 },
          { x: 70, y: 75, value: 450 },
          { x: 100, y: 90, value: 350 },
          { x: 130, y: 110, value: 250 },
          { x: 160, y: 130, value: 200 },
          { x: 190, y: 150, value: 150 },
          { x: 220, y: 170, value: 120 },
          { x: 250, y: 185, value: 90 },
        ];
    }

    // Adjust data based on toggle states
    if (noteToggleStates.lastDose) {
      basePoints = basePoints.map(point => ({
        ...point,
        y: point.y - 10, // Boost from recent dose
        value: point.value * 1.2
      }));
    }

    if (noteToggleStates.nextRecommended) {
      basePoints = basePoints.map((point, index) => ({
        ...point,
        y: index > 5 ? point.y + 15 : point.y, // Show decline if next dose is due
        value: index > 5 ? point.value * 0.8 : point.value
      }));
    }

    return basePoints;
  };

  const dataPoints = getDataPoints();

  // Generate date labels based on selected date range
  const getDateLabels = (): string[] => {
    switch (selectedDateRange) {
      case 'Jan 2022 - Dec 2024':
        return ['Jan 22', 'Jan 23', 'Jan 24', 'Dec 24'];
      case 'Jun 2023 - Dec 2025':
        return ['Jun 23', 'Dec 23', 'Jun 24', 'Dec 25'];
      case 'Last 6 months':
        return ['6m ago', '3m ago', 'Now'];
      case 'Last 12 months':
        return ['12m ago', '6m ago', 'Now'];
      case 'Last 24 months':
        return ['24m ago', '12m ago', 'Now'];
      default: // 'Jan 2023 - Jun 2025'
        return ['Jan 23', 'Jan 24', 'Jan 25', 'Jun 25'];
    }
  };

  const dateLabels = getDateLabels();

  // Create path for the trend line
  const createPath = (): string => {
    return dataPoints
      .map((point: DataPoint, index: number) => {
        const command = index === 0 ? 'M' : 'L';
        return `${command} ${point.x + 30} ${point.y + 40}`;
      })
      .join(' ');
  };

  const AntibodyChart: React.FC = () => (
    <View style={styles.chartContainer}>
      <Svg height="280" width="340" style={styles.chartSvg}>
        {/* Background zones with colors matching reference */}
        <Rect x="30" y="40" width="280" height="50" fill="#A7F3D0" rx="0" />
        <Rect x="30" y="90" width="280" height="50" fill="#86EFAC" rx="0" />
        <Rect x="30" y="140" width="280" height="50" fill="#FED7AA" rx="0" />
        <Rect x="30" y="190" width="280" height="50" fill="#FECACA" rx="0" />
        
        {/* Zone labels with better positioning */}
        <SvgText x="170" y="68" fontSize="18" fill="#065F46" fontWeight="600" textAnchor="middle">
          Protected
        </SvgText>
        <SvgText x="170" y="118" fontSize="16" fill="#047857" fontWeight="500" textAnchor="middle">
          Waning Immunity
        </SvgText>
        <SvgText x="170" y="168" fontSize="18" fill="#92400E" fontWeight="600" textAnchor="middle">
          Not Protected
        </SvgText>
        <SvgText x="170" y="218" fontSize="16" fill="#991B1B" fontWeight="600" textAnchor="middle">
          Red
        </SvgText>

        {/* Y-axis line */}
        <Line x1="30" y1="40" x2="30" y2="240" stroke="#374151" strokeWidth="2" />

        {/* X-axis line */}
        <Line x1="30" y1="240" x2="310" y2="240" stroke="#374151" strokeWidth="2" />

        {/* Trend line with improved styling */}
        <Path
          d={createPath()}
          stroke="#1F2937"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points with larger, more visible styling */}
        {dataPoints.map((point: DataPoint, index: number) => (
          <Circle
            key={index}
            cx={point.x + 30}
            cy={point.y + 40}
            r="5"
            fill="#1F2937"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
        ))}

        {/* Dynamic axis labels based on date range */}
        <SvgText x="45" y="260" fontSize="11" fill="#374151" fontWeight="500" textAnchor="start">
          {dateLabels[0]}
        </SvgText>
        <SvgText x="170" y="260" fontSize="11" fill="#6B7280" fontWeight="400" textAnchor="middle">
          {dateLabels[1] || ''}
        </SvgText>
        <SvgText x="290" y="260" fontSize="11" fill="#374151" fontWeight="500" textAnchor="end">
          {dateLabels[2]}
        </SvgText>
      </Svg>
    </View>
  );

  const DropdownButton: React.FC<DropdownButtonProps> = ({ value, onPress }) => (
    <TouchableOpacity style={styles.dropdown} onPress={onPress}>
      <Text style={styles.dropdownText}>{value}</Text>
      <Text style={styles.dropdownArrow}>▼</Text>
    </TouchableOpacity>
  );

  const DropdownModal: React.FC<{visible: boolean, options: string[], onSelect: (value: string) => void, onClose: () => void}> = ({ visible, options, onSelect, onClose }) => (
    <Modal visible={visible} transparent={true} animationType="fade">
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent}>
          <ScrollView style={styles.modalScroll}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.modalOption}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
              >
                <Text style={styles.modalOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const NoteItem: React.FC<NoteItemProps> = ({ text, isToggled = false, onToggle }) => (
    <View style={styles.noteItem}>
      <Text style={styles.bulletPoint}>•</Text>
      <Text style={styles.noteText}>{text}</Text>
      {onToggle && (
        <TouchableOpacity
          style={[styles.toggle, { backgroundColor: isToggled ? '#3B82F6' : '#D1D5DB' }]}
          onPress={onToggle}
        >
          <View style={[styles.toggleActive, {
            transform: [{ translateX: isToggled ? 0 : -20 }]
          }]} />
        </TouchableOpacity>
      )}
    </View>
  );

  const ActionButton: React.FC<ActionButtonProps> = ({ title, icon, onPress, style }) => (
    <TouchableOpacity style={[styles.actionButton, style]} onPress={onPress}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionText}>{title}</Text>
    </TouchableOpacity>
  );

  const handleVaccineSelect = (): void => {
    setShowVaccineModal(true);
  };

  const handleDateRangeSelect = (): void => {
    setShowDateModal(true);
  };

  const handleToggleNote = (noteKey: string): void => {
    setNoteToggleStates(prev => ({
      ...prev,
      [noteKey]: !prev[noteKey]
    }));
  };

  const handleExportPDF = async (): Promise<void> => {
    try {
      const html = `
        <html>
          <body>
            <h1>Vaccine Trends Report</h1>
            <p><strong>Vaccine:</strong> ${selectedVaccine}</p>
            <p><strong>Date Range:</strong> ${selectedDateRange}</p>
            <h2>Notes:</h2>
            <ul>
              <li>Last dose: Oct 2023 (Booster) - ${noteToggleStates.lastDose ? 'Enabled' : 'Disabled'}</li>
              <li>Next recommended: Oct 2024 - ${noteToggleStates.nextRecommended ? 'Enabled' : 'Disabled'}</li>
              <li>Protection threshold: ≥ 500 AU/mL - ${noteToggleStates.protectionThreshold ? 'Enabled' : 'Disabled'}</li>
            </ul>
          </body>
        </html>
      `;

      console.log('Generating PDF report...', html);
      // In a real implementation, you would use expo-print here
      // const { uri } = await Print.printToFileAsync({ html });
      // await Sharing.shareAsync(uri);

      alert('PDF export functionality would be implemented here');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handleSyncLabResults = (): void => {
    console.log('Syncing lab results...');
    alert('Lab results sync would connect to healthcare providers API');
  };

  const handleBackPress = (): void => {
    router.back();
  };

  return (
    <LinearGradient
      colors={["#F0F7FF", "#FFFFFF", "#F2FDF6"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.keyboardContent}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <StatusBar barStyle="dark-content" backgroundColor="#F0F7FF" />
          
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.screenTitle}>Vaccine Trends</Text>
              <Text style={styles.screenSubtitle}>Track your vaccination history and immunity levels</Text>
            </View>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        <View style={styles.content}>
          <DropdownButton
            title="Vaccine Type"
            value={selectedVaccine}
            onPress={handleVaccineSelect}
          />

          <DropdownButton
            title="Date Range"
            value={selectedDateRange}
            onPress={handleDateRangeSelect}
          />

          <DropdownModal
            visible={showVaccineModal}
            options={vaccineOptions}
            onSelect={setSelectedVaccine}
            onClose={() => setShowVaccineModal(false)}
          />

          <DropdownModal
            visible={showDateModal}
            options={dateRangeOptions}
            onSelect={setSelectedDateRange}
            onClose={() => setShowDateModal(false)}
          />

          <Text style={styles.chartTitle}>Antibody Titer Levels Over Time</Text>

          <AntibodyChart />

          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes:</Text>
            <NoteItem
              text="Last dose: Oct 2023 (Booster)"
              isToggled={noteToggleStates.lastDose}
              onToggle={() => handleToggleNote('lastDose')}
            />
            <NoteItem
              text="Next recommended: Oct 2024"
              isToggled={noteToggleStates.nextRecommended}
              onToggle={() => handleToggleNote('nextRecommended')}
            />
            <NoteItem
              text="Protection threshold: ≥ 500 AU/mL"
              isToggled={noteToggleStates.protectionThreshold}
              onToggle={() => handleToggleNote('protectionThreshold')}
            />
          </View>

          <View style={styles.actionButtons}>
            <ActionButton
              title="Export as PDF"
              icon="📄"
              onPress={handleExportPDF}
              style={styles.exportButton}
            />
            <ActionButton
              title="Sync Lab Results"
              icon="🔄"
              onPress={handleSyncLabResults}
              style={styles.syncButton}
            />
          </View>
        </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContent: {
    flex: 1,
  },
  scrollView: {
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
  backIcon: {
    fontSize: 24,
    color: '#111827',
    fontWeight: '400',
  },
  headerContent: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '900',
    fontFamily: 'Inter_900Black',
    color: '#111827',
    marginBottom: 2,
  },
  screenSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: '#4B5563',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  dropdown: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dropdownText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#6B7280',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 30,
    marginTop: 20,
  },
  chartContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    alignItems: 'center',
  },
  chartSvg: {
    backgroundColor: 'transparent',
  },
  notesSection: {
    marginBottom: 20,
  },
  duplicateNotes: {
    marginBottom: 30,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#374151',
    marginRight: 8,
    width: 10,
  },
  noteText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  toggle: {
    width: 44,
    height: 24,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 2,
  },
  toggleActive: {
    width: 20,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  exportButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
  },
  syncButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 0,
    maxHeight: 400,
    width: '80%',
    maxWidth: 300,
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalOption: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
});

export default VaccineTrendsScreen;