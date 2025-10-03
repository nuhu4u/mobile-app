import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Link, useRouter, usePathname } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { validationRules } from '@/lib/config';

// Types for geographic data
interface NormalizedGeoData {
  id: string;
  name: string;
}

interface FormData {
  surname: string;
  firstName: string;
  otherName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  email: string;
  stateOfOrigin: string;
  lgaOfOrigin: string;
  stateOfResidence: string;
  lgaOfResidence: string;
  ward: string;
  pollingUnit: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  // Get current route info for debugging
  const currentPath = usePathname();
  const routerInstance = useRouter();
  
  // Warning modal state
  const [showWarning, setShowWarning] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState<FormData>({
    surname: "",
    firstName: "",
    otherName: "",
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
    email: "",
    stateOfOrigin: "",
    lgaOfOrigin: "",
    stateOfResidence: "",
    lgaOfResidence: "",
    ward: "",
    pollingUnit: "",
    password: "",
    confirmPassword: "",
  });
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [countdown, setCountdown] = useState(3);
  
  // Phone and email validation states
  const [phoneExists, setPhoneExists] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  
  // Geographic data state
  const [states, setStates] = useState<NormalizedGeoData[]>([]);
  const [lgasOrigin, setLgasOrigin] = useState<NormalizedGeoData[]>([]);
  const [lgasResidence, setLgasResidence] = useState<NormalizedGeoData[]>([]);
  const [wards, setWards] = useState<NormalizedGeoData[]>([]);
  const [pollingUnits, setPollingUnits] = useState<NormalizedGeoData[]>([]);
  const [loadingGeoData, setLoadingGeoData] = useState(false);
  
  // Dropdown visibility states
  const [showStateOriginDropdown, setShowStateOriginDropdown] = useState(false);
  const [showLgaOriginDropdown, setShowLgaOriginDropdown] = useState(false);
  const [showStateResidenceDropdown, setShowStateResidenceDropdown] = useState(false);
  const [showLgaResidenceDropdown, setShowLgaResidenceDropdown] = useState(false);
  const [showWardDropdown, setShowWardDropdown] = useState(false);
  const [showPollingUnitDropdown, setShowPollingUnitDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  
  // useRef guard to prevent double fetching
  const hasLoadedGeoData = useRef(false);
  
  // Auth store
  const authStore = useAuthStore();

  // Mock geographic data (replace with actual API calls later)
  const mockStates: NormalizedGeoData[] = [
    { id: "lagos", name: "Lagos" },
    { id: "abuja", name: "FCT Abuja" },
    { id: "kano", name: "Kano" },
    { id: "rivers", name: "Rivers" },
    { id: "ogun", name: "Ogun" },
  ];

  const mockLgas: { [key: string]: NormalizedGeoData[] } = {
    lagos: [
      { id: "ikeja", name: "Ikeja" },
      { id: "lagos-island", name: "Lagos Island" },
      { id: "alimosho", name: "Alimosho" },
    ],
    abuja: [
      { id: "abuja-municipal", name: "Abuja Municipal" },
      { id: "gwagwalada", name: "Gwagwalada" },
      { id: "kuje", name: "Kuje" },
    ],
  };

  const mockWards: { [key: string]: NormalizedGeoData[] } = {
    ikeja: [
      { id: "ward-1", name: "Ward 1" },
      { id: "ward-2", name: "Ward 2" },
      { id: "ward-3", name: "Ward 3" },
    ],
  };

  const mockPollingUnits: { [key: string]: NormalizedGeoData[] } = {
    "ward-1": [
      { id: "pu-001", name: "Polling Unit 001" },
      { id: "pu-002", name: "Polling Unit 002" },
      { id: "pu-003", name: "Polling Unit 003" },
    ],
  };

  // Countdown effect for success redirect
  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (success && countdown === 0) {
      router.replace('/(auth)/login');
    }
  }, [success, countdown]);

  // Fetch geographic data on component mount
  useEffect(() => {
    if (!hasLoadedGeoData.current) {
      hasLoadedGeoData.current = true;
      fetchGeoData();
    }
  }, []);

  const fetchGeoData = async () => {
    setLoadingGeoData(true);
    setError('');
    try {
      // For now, use mock data. Replace with actual API calls later
      setTimeout(() => {
        setStates(mockStates);
        setSuccessMessage('Geographic data loaded successfully! You can now select your location details.');
        setTimeout(() => setSuccessMessage(''), 3000);
        setLoadingGeoData(false);
      }, 1000);
    } catch (error) {
      console.error('❌ Error fetching states:', error);
      setError('Network error: Unable to load geographic data. Please check your connection.');
      setLoadingGeoData(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    
    // Reset dependent fields when state changes
    if (field === "stateOfOrigin") {
      newFormData.lgaOfOrigin = "";
      setLgasOrigin(mockLgas[value] || []);
    }
    
    if (field === "stateOfResidence") {
      newFormData.lgaOfResidence = "";
      newFormData.ward = "";
      newFormData.pollingUnit = "";
      setLgasResidence(mockLgas[value] || []);
      setWards([]);
      setPollingUnits([]);
    }
    
    if (field === "lgaOfResidence") {
      newFormData.ward = "";
      newFormData.pollingUnit = "";
      setWards(mockWards[value] || []);
      setPollingUnits([]);
    }
    
    if (field === "ward") {
      newFormData.pollingUnit = "";
      setPollingUnits(mockPollingUnits[value] || []);
    }
    
    setFormData(newFormData);
  };

  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Check if user is old enough to register
  const isUserOldEnough = (): boolean => {
    return calculateAge(formData.dateOfBirth) >= 18;
  };

  // Nigerian phone number validation
  const isValidNigerianPhone = (phone: string): boolean => {
    if (!phone) return false;
    
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    const patterns = [
      /^\+234[789]\d{9}$/,     // +234 + 9 digits starting with 7, 8, or 9
      /^234[789]\d{9}$/,       // 234 + 9 digits starting with 7, 8, or 9
      /^0[789]\d{9}$/,         // 0 + 9 digits starting with 7, 8, or 9 (11 total)
      /^[789]\d{9}$/           // 9 digits starting with 7, 8, or 9 (10 total)
    ];
    
    return patterns.some(pattern => pattern.test(cleanPhone));
  };

  // Format Nigerian phone number to standard format
  const formatNigerianPhone = (phone: string): string => {
    if (!phone) return '';
    
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    if (cleanPhone.startsWith('+234')) {
      return cleanPhone;
    } else if (cleanPhone.startsWith('234')) {
      return `+${cleanPhone}`;
    } else if (cleanPhone.startsWith('0')) {
      return `+234${cleanPhone.substring(1)}`;
    } else if (/^[789]\d{8}$/.test(cleanPhone)) {
      return `+234${cleanPhone}`;
    }
    
    return cleanPhone;
  };

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    if (!email) return false;
    
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (email.length > 254) return false;
    if (email.indexOf('@') === -1) return false;
    if (email.indexOf('@') === 0) return false;
    if (email.indexOf('@') === email.length - 1) return false;
    if (email.includes('..')) return false;
    
    const parts = email.split('@');
    if (parts.length !== 2) return false;
    
    const localPart = parts[0];
    const domain = parts[1];
    
    if (localPart.length === 0 || localPart.length > 64) return false;
    if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
    
    if (domain.length === 0 || domain.length > 253) return false;
    if (domain.startsWith('.') || domain.endsWith('.')) return false;
    if (domain.includes('..')) return false;
    if (!domain.includes('.')) return false;
    
    return emailRegex.test(email);
  };

  // Password strength validation
  const getPasswordStrength = (password: string): { strength: string; color: string; valid: boolean; details: string[] } => {
    if (!password) return { strength: '', color: '', valid: false, details: [] };
    
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);
    const hasMinLength = password.length >= 8;
    
    const score = [hasLower, hasUpper, hasNumber, hasSpecial, hasMinLength].filter(Boolean).length;
    
    const details = [];
    if (!hasMinLength) details.push('At least 8 characters');
    if (!hasLower) details.push('One lowercase letter');
    if (!hasUpper) details.push('One uppercase letter');
    if (!hasNumber) details.push('One number');
    if (!hasSpecial) details.push('One special character (@$!%*?&)');
    
    let strength, color, valid;
    if (score === 5) {
      strength = 'Strong';
      color = '#16a34a';
      valid = true;
    } else if (score >= 4) {
      strength = 'Good';
      color = '#2563eb';
      valid = true;
    } else if (score >= 3) {
      strength = 'Fair';
      color = '#ca8a04';
      valid = false;
      } else {
      strength = 'Weak';
      color = '#dc2626';
      valid = false;
    }
    
    return { strength, color, valid, details };
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);
    
    // Validate required fields
    if (!formData.surname || !formData.firstName || !formData.dateOfBirth || !formData.gender || !formData.phoneNumber || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all required fields marked with *");
      setLoading(false);
      return;
    }

    // Validate age before submission
    if (!isUserOldEnough()) {
      setError("You must be 18 years or older to register as a voter.");
      setLoading(false);
      return;
    }

    // Validate phone number format
    if (!isValidNigerianPhone(formData.phoneNumber)) {
      setError("Please enter a valid Nigerian phone number.");
      setLoading(false);
      return;
    }

    // Validate email format
    if (!isValidEmail(formData.email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please ensure both passwords are identical.");
      setLoading(false);
      return;
    }

    // Validate required geographic fields
    if (!formData.stateOfOrigin || !formData.lgaOfOrigin) {
      setError("Please select both State of Origin and LGA of Origin.");
      setLoading(false);
      return;
    }

    if (!formData.stateOfResidence || !formData.lgaOfResidence || !formData.ward || !formData.pollingUnit) {
      setError("Please select all residence information: State, LGA, Ward, and Polling Unit.");
      setLoading(false);
      return;
    }

    try {
      // Prepare form data for registration
      const registrationData = {
        email: formData.email.trim(),
        password: formData.password,
        first_name: formData.firstName.trim(),
        last_name: formData.surname.trim(),
        phone_number: formatNigerianPhone(formData.phoneNumber),
        date_of_birth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
        address: formData.stateOfResidence && formData.lgaOfResidence ? 
          `${formData.stateOfResidence}, ${formData.lgaOfResidence}` : undefined,
        // State of Origin
        state_of_origin_id: formData.stateOfOrigin || undefined,
        lga_of_origin_id: formData.lgaOfOrigin || undefined,
        // State of Residence
        state_id: formData.stateOfResidence || undefined,
        lga_id: formData.lgaOfResidence || undefined,
        ward_id: formData.ward || undefined,
        polling_unit_id: formData.pollingUnit || undefined,
      };
      
      await authStore.register(registrationData);
      
      setSuccess(true);
      setCountdown(3);
      
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || "Registration failed. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Warning Modal Component
  if (showWarning) {
  return (
      <View style={styles.container}>
        <View style={styles.warningModal}>
          <View style={styles.warningHeader}>
            <View style={styles.warningIcon}>
              <Ionicons name="warning" size={32} color="#ea580c" />
            </View>
            <Text style={styles.warningTitle}>Important Notice</Text>
            <Text style={styles.warningSubtitle}>
              Please read carefully before proceeding with voter registration
            </Text>
          </View>
          
          <ScrollView style={styles.warningContent} showsVerticalScrollIndicator={false}>
            <View style={styles.alertBox}>
              <View style={styles.alertHeader}>
                <Ionicons name="warning" size={16} color="#ea580c" />
                <Text style={styles.alertTitle}>Official Voter Registration Requirements:</Text>
          </View>
              <View style={styles.alertList}>
                <Text style={styles.alertItem}>• You must be 18 years or older</Text>
                <Text style={styles.alertItem}>• You must be a Nigerian citizen</Text>
                <Text style={styles.alertItem}>• You must provide valid identification (NIN)</Text>
                <Text style={styles.alertItem}>• You must be resident in the constituency where you wish to vote</Text>
                <Text style={styles.alertItem}>• You must not be registered to vote elsewhere</Text>
              </View>
            </View>

            <View style={[styles.alertBox, { backgroundColor: '#dbeafe', borderColor: '#3b82f6' }]}>
              <View style={styles.alertHeader}>
                <Ionicons name="information-circle" size={16} color="#3b82f6" />
                <Text style={[styles.alertTitle, { color: '#1e40af' }]}>Registration Process:</Text>
              </View>
              <View style={styles.alertList}>
                <Text style={[styles.alertItem, { color: '#1e40af' }]}>• Complete all required fields accurately</Text>
                <Text style={[styles.alertItem, { color: '#1e40af' }]}>• Review your information before submission</Text>
                <Text style={[styles.alertItem, { color: '#1e40af' }]}>• You will receive a confirmation email upon successful registration</Text>
              </View>
            </View>

            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}
                onPress={() => {
                  console.log('Checkbox pressed, current state:', acceptedTerms);
                  setAcceptedTerms(!acceptedTerms);
                  console.log('Checkbox new state:', !acceptedTerms);
                }}
                activeOpacity={0.7}
              >
                {acceptedTerms && <Ionicons name="checkmark" size={16} color="#fff" />}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.checkboxTextContainer}
                onPress={() => {
                  console.log('Checkbox text pressed, current state:', acceptedTerms);
                  setAcceptedTerms(!acceptedTerms);
                  console.log('Checkbox text new state:', !acceptedTerms);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.checkboxLabel}>
                  I have read and understood the requirements and agree to proceed with registration
          </Text>
              </TouchableOpacity>
        </View>
          </ScrollView>

          <View style={styles.warningButtons}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={16} color="#64748b" />
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.proceedButton, !acceptedTerms && styles.proceedButtonDisabled]}
              onPress={() => {
                console.log('Proceed button pressed, acceptedTerms:', acceptedTerms);
                if (acceptedTerms) {
                  console.log('Proceeding to registration form');
                  setShowWarning(false);
                } else {
                  console.log('Cannot proceed, terms not accepted');
                }
              }}
              disabled={!acceptedTerms}
              activeOpacity={acceptedTerms ? 0.7 : 1}
            >
              <Text style={[styles.proceedButtonText, !acceptedTerms && styles.proceedButtonTextDisabled]}>
                Proceed to Registration
                </Text>
            </TouchableOpacity>
              </View>
            </View>
          </View>
    );
  }

  // Dropdown Component
  const renderDropdown = (
    visible: boolean,
    setVisible: (visible: boolean) => void,
    options: NormalizedGeoData[],
    onSelect: (value: string, label: string) => void,
    placeholder: string
  ) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.dropdownModalOverlay}>
        <View style={styles.dropdownModal}>
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownTitle}>{placeholder}</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.dropdownList}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.dropdownItem}
                onPress={() => {
                  onSelect(option.id, option.name);
                  setVisible(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{option.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.logoContainer}
            onPress={() => router.push('/')}
            activeOpacity={0.7}
          >
            <View style={styles.logoIconContainer}>
              <Ionicons name="ballot-box-box" size={48} color="#2563eb" />
              <View style={styles.logoBadge}>
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
            </View>
            <Text style={styles.logoText}>Nigerian E-Voting Portal</Text>
            <Text style={styles.subtitle}>Secure • Transparent • Decentralized</Text>
            <Text style={styles.tapHint}>Tap logo to go home</Text>
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Voter Registration</Text>
            <Text style={styles.headerSubtitle}>
              Complete the form below to register as a voter in the blockchain-based voting system
            </Text>
          </View>
        </View>

        {/* Error Alert */}
        {error && (
          <View style={styles.errorAlert}>
            <Ionicons name="warning" size={20} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Success Message */}
        {successMessage && (
          <View style={styles.successAlert}>
            <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        )}

        {/* Geographic Data Status */}
        <View style={styles.geoDataStatus}>
          <View style={styles.geoDataHeader}>
            <Text style={styles.geoDataTitle}>Geographic Data Status</Text>
            <Text style={styles.geoDataSubtitle}>
              {loadingGeoData ? "Loading..." : states.length > 0 ? `${states.length} states loaded` : "No data loaded"}
            </Text>
          </View>
          
          {loadingGeoData && (
            <View style={styles.geoDataLoading}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={styles.geoDataLoadingText}>Loading geographic data...</Text>
            </View>
          )}
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <Text style={styles.sectionSubtitle}>Enter your personal details as they appear on your official documents</Text>
          
          {/* Surname */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Surname *</Text>
            <TextInput
              style={styles.textInput}
                  value={formData.surname}
              onChangeText={(value) => handleInputChange("surname", value)}
              placeholder="Enter your surname"
              placeholderTextColor="#9ca3af"
                />
              </View>

          {/* First Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>First Name *</Text>
            <TextInput
              style={styles.textInput}
                  value={formData.firstName}
              onChangeText={(value) => handleInputChange("firstName", value)}
              placeholder="Enter your first name"
              placeholderTextColor="#9ca3af"
            />
            </View>

          {/* Other Names */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Other Names</Text>
            <TextInput
              style={styles.textInput}
                value={formData.otherName}
              onChangeText={(value) => handleInputChange("otherName", value)}
              placeholder="Enter other names (optional)"
              placeholderTextColor="#9ca3af"
              />
            </View>

          {/* Date of Birth */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date of Birth *</Text>
            <TextInput
              style={[
                styles.textInput,
                formData.dateOfBirth && !isUserOldEnough() && styles.inputError
              ]}
                  value={formData.dateOfBirth}
              onChangeText={(value) => handleInputChange("dateOfBirth", value)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9ca3af"
            />
            {formData.dateOfBirth && !isUserOldEnough() && (
              <Text style={styles.errorText}>
                ✗ Age: {calculateAge(formData.dateOfBirth)} years (Must be 18 or older)
              </Text>
            )}
              </View>

          {/* Gender */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Gender *</Text>
            <TouchableOpacity
              style={[styles.dropdown, !formData.gender && styles.inputError]}
              onPress={() => setShowGenderDropdown(true)}
            >
              <Text style={[styles.dropdownText, !formData.gender && styles.placeholderText]}>
                {formData.gender ? (formData.gender === 'male' ? 'Male' : 'Female') : 'Select gender'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#64748b" />
            </TouchableOpacity>
            {!formData.gender && (
              <Text style={styles.errorText}>✗ Gender is required</Text>
            )}
            </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number *</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={[
                  styles.textInput,
                  formData.phoneNumber && !isValidNigerianPhone(formData.phoneNumber) && styles.inputError
                ]}
                  value={formData.phoneNumber}
                onChangeText={(value) => handleInputChange("phoneNumber", value)}
                placeholder="e.g., 09080018688 or +2349080018688"
                placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                />
              {checkingPhone && (
                <ActivityIndicator size="small" color="#3b82f6" style={styles.inputIcon} />
              )}
              </View>
            {formData.phoneNumber && !isValidNigerianPhone(formData.phoneNumber) && (
              <Text style={styles.errorText}>
                ✗ Invalid format. Use: 09080018688 or +2349080018688
              </Text>
            )}
            {formData.phoneNumber && isValidNigerianPhone(formData.phoneNumber) && phoneExists && (
              <Text style={styles.errorText}>
                ✗ This phone number is already registered
              </Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address *</Text>
            <TextInput
              style={[
                styles.textInput,
                formData.email && !isValidEmail(formData.email) && styles.inputError
              ]}
                  value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              placeholder="e.g., user@example.com"
              placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
            {formData.email && !isValidEmail(formData.email) && (
              <Text style={styles.errorText}>
                ✗ Please enter a valid email address
              </Text>
            )}
            {formData.email && isValidEmail(formData.email) && emailExists && (
              <Text style={styles.errorText}>
                ✗ This email is already registered
              </Text>
            )}
              </View>
            </View>

        {/* Origin Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Origin Information</Text>
          <Text style={styles.sectionSubtitle}>Your state and LGA of origin</Text>
          
          {/* State of Origin */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>State of Origin *</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowStateOriginDropdown(true)}
              disabled={loadingGeoData}
            >
              <Text style={[styles.dropdownText, !formData.stateOfOrigin && styles.placeholderText]}>
                {formData.stateOfOrigin ? 
                  states.find(s => s.id === formData.stateOfOrigin)?.name : 
                  loadingGeoData ? "Loading..." : "Select state"
                }
              </Text>
              <Ionicons name="chevron-down" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* LGA of Origin */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>LGA of Origin *</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowLgaOriginDropdown(true)}
              disabled={!formData.stateOfOrigin}
            >
              <Text style={[styles.dropdownText, !formData.lgaOfOrigin && styles.placeholderText]}>
                {formData.lgaOfOrigin ? 
                  lgasOrigin.find(l => l.id === formData.lgaOfOrigin)?.name : 
                  formData.stateOfOrigin ? "Select LGA" : "Select state first"
                }
            </Text>
              <Ionicons name="chevron-down" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
          </View>
          
        {/* Residence Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Residence Information</Text>
          <Text style={styles.sectionSubtitle}>Your current place of residence for voting purposes</Text>
          
          {/* State of Residence */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>State of Residence *</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowStateResidenceDropdown(true)}
              disabled={loadingGeoData}
            >
              <Text style={[styles.dropdownText, !formData.stateOfResidence && styles.placeholderText]}>
                {formData.stateOfResidence ? 
                  states.find(s => s.id === formData.stateOfResidence)?.name : 
                  loadingGeoData ? "Loading..." : "Select state"
                }
              </Text>
              <Ionicons name="chevron-down" size={20} color="#64748b" />
            </TouchableOpacity>
              </View>

          {/* LGA of Residence */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>LGA of Residence *</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowLgaResidenceDropdown(true)}
              disabled={!formData.stateOfResidence}
            >
              <Text style={[styles.dropdownText, !formData.lgaOfResidence && styles.placeholderText]}>
                {formData.lgaOfResidence ? 
                  lgasResidence.find(l => l.id === formData.lgaOfResidence)?.name : 
                  formData.stateOfResidence ? "Select LGA" : "Select state first"
                }
              </Text>
              <Ionicons name="chevron-down" size={20} color="#64748b" />
            </TouchableOpacity>
            </View>

          {/* Ward */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ward *</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowWardDropdown(true)}
              disabled={!formData.lgaOfResidence}
            >
              <Text style={[styles.dropdownText, !formData.ward && styles.placeholderText]}>
                {formData.ward ? 
                  wards.find(w => w.id === formData.ward)?.name : 
                  formData.lgaOfResidence ? "Select ward" : "Select LGA first"
                }
              </Text>
              <Ionicons name="chevron-down" size={20} color="#64748b" />
            </TouchableOpacity>
              </View>

          {/* Polling Unit */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Polling Unit *</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowPollingUnitDropdown(true)}
              disabled={!formData.ward}
            >
              <Text style={[styles.dropdownText, !formData.pollingUnit && styles.placeholderText]}>
                {formData.pollingUnit ? 
                  pollingUnits.find(p => p.id === formData.pollingUnit)?.name : 
                  formData.ward ? "Select polling unit" : "Select ward first"
                }
              </Text>
              <Ionicons name="chevron-down" size={20} color="#64748b" />
            </TouchableOpacity>
              </View>
            </View>

        {/* Security Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Information</Text>
          <Text style={styles.sectionSubtitle}>Create a secure password for your account</Text>
          
          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password *</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={styles.textInput}
                value={formData.password}
                onChangeText={(value) => handleInputChange("password", value)}
                placeholder="Enter your password"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.inputIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color="#64748b" 
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.passwordHint}>
              Password must be at least 8 characters with uppercase, lowercase, number, and special character
            </Text>
            {formData.password && (
              <View style={styles.passwordRequirements}>
                <Text style={[styles.passwordStrength, { color: getPasswordStrength(formData.password).color }]}>
                  Password strength: {getPasswordStrength(formData.password).strength}
                </Text>
                <View style={styles.requirementsList}>
                  <Text style={[styles.requirement, { color: formData.password.length >= 8 ? '#16a34a' : '#dc2626' }]}>
                    {formData.password.length >= 8 ? '✓' : '✗'} At least 8 characters
                  </Text>
                  <Text style={[styles.requirement, { color: /[a-z]/.test(formData.password) ? '#16a34a' : '#dc2626' }]}>
                    {/[a-z]/.test(formData.password) ? '✓' : '✗'} One lowercase letter
                  </Text>
                  <Text style={[styles.requirement, { color: /[A-Z]/.test(formData.password) ? '#16a34a' : '#dc2626' }]}>
                    {/[A-Z]/.test(formData.password) ? '✓' : '✗'} One uppercase letter
                  </Text>
                  <Text style={[styles.requirement, { color: /\d/.test(formData.password) ? '#16a34a' : '#dc2626' }]}>
                    {/\d/.test(formData.password) ? '✓' : '✗'} One number
                  </Text>
                  <Text style={[styles.requirement, { color: /[@$!%*?&]/.test(formData.password) ? '#16a34a' : '#dc2626' }]}>
                    {/[@$!%*?&]/.test(formData.password) ? '✓' : '✗'} One special character (@$!%*?&)
                  </Text>
                </View>
              </View>
                )}
              </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm Password *</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={[
                  styles.textInput,
                  formData.confirmPassword && formData.password !== formData.confirmPassword && styles.inputError
                ]}
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange("confirmPassword", value)}
                placeholder="Confirm your password"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.inputIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color="#64748b" 
                />
              </TouchableOpacity>
            </View>
            {formData.confirmPassword && (
              <Text style={[styles.passwordMatch, { color: formData.password === formData.confirmPassword ? '#16a34a' : '#dc2626' }]}>
                {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </Text>
                )}
              </View>
            </View>

        {/* Submit Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Complete Registration</Text>
          <Text style={styles.sectionSubtitle}>Review your information and submit your registration</Text>
          
          <View style={styles.submitWarning}>
            <Ionicons name="warning" size={20} color="#ea580c" />
            <Text style={styles.submitWarningText}>
              By submitting this form, you confirm that all information provided is accurate and complete. False
              information may result in criminal charges.
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading || loadingGeoData}
          >
            {loading ? (
              <View style={styles.submitButtonContent}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.submitButtonText}>Creating your account...</Text>
            </View>
            ) : (
              <Text style={styles.submitButtonText}>Submit Registration</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginLink}>Already registered? </Text>
            <TouchableOpacity
              onPress={() => {
                console.log('🔗 Register page: Login here link pressed');
                console.log('📍 Current path:', currentPath);
                console.log('🎯 Starting navigation sequence...');
                
                // Let's try multiple approaches and see which one works
                console.log('🔄 Method 1: Direct router.push to /(auth)/login');
                router.push('/(auth)/login');
                
                setTimeout(() => {
                  console.log('🔄 Method 2 (backup): router.replace to /(auth)/login');
                  router.replace('/(auth)/login');
                }, 1000);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.loginLinkText}>Login here</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dropdowns */}
        {renderDropdown(
          showGenderDropdown,
          setShowGenderDropdown,
          [{ id: 'male', name: 'Male' }, { id: 'female', name: 'Female' }],
          (value) => handleInputChange('gender', value),
          'Select Gender'
        )}

        {renderDropdown(
          showStateOriginDropdown,
          setShowStateOriginDropdown,
          states,
          (value) => handleInputChange('stateOfOrigin', value),
          'Select State of Origin'
        )}

        {renderDropdown(
          showLgaOriginDropdown,
          setShowLgaOriginDropdown,
          lgasOrigin,
          (value) => handleInputChange('lgaOfOrigin', value),
          'Select LGA of Origin'
        )}

        {renderDropdown(
          showStateResidenceDropdown,
          setShowStateResidenceDropdown,
          states,
          (value) => handleInputChange('stateOfResidence', value),
          'Select State of Residence'
        )}

        {renderDropdown(
          showLgaResidenceDropdown,
          setShowLgaResidenceDropdown,
          lgasResidence,
          (value) => handleInputChange('lgaOfResidence', value),
          'Select LGA of Residence'
        )}

        {renderDropdown(
          showWardDropdown,
          setShowWardDropdown,
          wards,
          (value) => handleInputChange('ward', value),
          'Select Ward'
        )}

        {renderDropdown(
          showPollingUnitDropdown,
          setShowPollingUnitDropdown,
          pollingUnits,
          (value) => handleInputChange('pollingUnit', value),
          'Select Polling Unit'
        )}
      </ScrollView>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingModal}>
            <View style={styles.loadingIcon}>
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
            <Text style={styles.loadingTitle}>Creating Your Account</Text>
            <Text style={styles.loadingText}>
              Please wait while we process your registration. This may take a few moments.
              </Text>
            <View style={styles.loadingProgress}>
              <Text style={styles.loadingProgressText}>🔄 Processing registration...</Text>
            </View>
          </View>
        </View>
      )}

      {/* Success Modal */}
      {success && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingModal}>
            <View style={[styles.loadingIcon, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="checkmark" size={32} color="#16a34a" />
          </View>
            <Text style={styles.loadingTitle}>Registration Successful! 🎉</Text>
            <Text style={styles.loadingText}>
              Your account has been created successfully. You will be redirected to the login page in a few seconds.
            </Text>
            
            <View style={styles.countdownContainer}>
              <View style={styles.countdownBar}>
                <View style={[styles.countdownProgress, { width: `${(countdown / 3) * 100}%` }]} />
              </View>
              <Text style={styles.countdownText}>
                Redirecting in <Text style={styles.countdownNumber}>{countdown}</Text> second{countdown !== 1 ? 's' : ''}...
          </Text>
        </View>
            
            <View style={styles.loadingProgress}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={styles.loadingProgressText}>Preparing redirect...</Text>
      </View>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  tapHint: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    fontStyle: 'italic',
  },
  headerContent: {
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#3b82f6',
    marginLeft: 8,
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
  successAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#16a34a',
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
  geoDataStatus: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  geoDataHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  geoDataTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
  },
  geoDataSubtitle: {
    fontSize: 12,
    color: '#3b82f6',
  },
  geoDataLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  geoDataLoadingText: {
    color: '#3b82f6',
    marginLeft: 8,
    fontSize: 14,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1f2937',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  inputWithIcon: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#1f2937',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  passwordHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  passwordRequirements: {
    marginTop: 8,
  },
  passwordStrength: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  requirementsList: {
    gap: 4,
  },
  requirement: {
    fontSize: 12,
  },
  passwordMatch: {
    fontSize: 14,
    marginTop: 4,
  },
  submitWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef3c7',
    borderColor: '#fbbf24',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  submitWarningText: {
    color: '#92400e',
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  loginLink: {
    fontSize: 14,
    color: '#64748b',
  },
  loginLinkText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  dropdownModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  dropdownModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  dropdownList: {
    flex: 1,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#1f2937',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    maxWidth: 320,
  },
  loadingIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  loadingProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingProgressText: {
    color: '#3b82f6',
    fontSize: 14,
    marginLeft: 8,
  },
  countdownContainer: {
    width: '100%',
    marginBottom: 16,
  },
  countdownBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  countdownProgress: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  countdownText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  countdownNumber: {
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  // Warning Modal Styles
  warningModal: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  warningHeader: {
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  warningIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fed7aa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  warningSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  warningContent: {
    flex: 1,
    padding: 24,
  },
  alertBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7f1d1d',
    marginLeft: 8,
  },
  alertList: {
    gap: 4,
  },
  alertItem: {
    fontSize: 14,
    color: '#7f1d1d',
    lineHeight: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  checkboxTextContainer: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  warningButtons: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  proceedButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  proceedButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  proceedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  proceedButtonTextDisabled: {
    color: '#6b7280',
  },
});
