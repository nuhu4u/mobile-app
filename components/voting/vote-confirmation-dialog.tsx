/**
 * Vote Confirmation Dialog Component
 * Secure vote confirmation with biometric verification and final validation
 */

import * as React from 'react';
import { View, Text, Modal, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Election, Contestant } from '../../types/election';
import { formatDate, formatDateTime } from '../../lib/utils';

interface VoteConfirmationDialogProps {
  visible: boolean;
  election: Election | null;
  candidate: Contestant | null;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

export function VoteConfirmationDialog({
  visible,
  election,
  candidate,
  onConfirm,
  onCancel,
  isLoading = false,
  error = null,
  className
}: VoteConfirmationDialogProps) {
  const [confirmationStep, setConfirmationStep] = React.useState<'verify' | 'biometric' | 'processing' | 'success' | 'error'>('verify');
  const [biometricVerified, setBiometricVerified] = React.useState(false);
  const [verificationCode, setVerificationCode] = React.useState('');
  const [showCode, setShowCode] = React.useState(false);

  // Generate verification code
  React.useEffect(() => {
    if (visible && confirmationStep === 'verify') {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setVerificationCode(code);
    }
  }, [visible, confirmationStep]);

  const handleConfirm = async () => {
    if (!biometricVerified) {
      setConfirmationStep('biometric');
      return;
    }

    setConfirmationStep('processing');
    try {
      await onConfirm();
      setConfirmationStep('success');
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setConfirmationStep('error');
    }
  };

  const handleBiometricVerification = async () => {
    try {
      // Use real biometric verification
      const { realBiometricService } = await import('@/lib/biometric/real-biometric-service');
      const result = await realBiometricService.verifyBiometricForVoting();
      
      if (result.success) {
        setBiometricVerified(true);
        setConfirmationStep('verify');
      } else {
        Alert.alert('Biometric Verification Failed', result.error || 'Please try again');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Biometric verification failed');
    }
  };

  const handleClose = () => {
    setConfirmationStep('verify');
    setBiometricVerified(false);
    setVerificationCode('');
    setShowCode(false);
    onCancel();
  };

  const handleRetry = () => {
    setConfirmationStep('verify');
    setBiometricVerified(false);
  };

  if (!election || !candidate) return null;

  return React.createElement(Modal, {
    visible: visible,
    animationType: 'fade',
    transparent: true,
    onRequestClose: handleClose
  },
    React.createElement(View, { style: styles.overlay },
      React.createElement(View, { style: styles.dialog },
        // Header
        React.createElement(View, { style: styles.header },
          React.createElement(View, { style: styles.headerContent },
            React.createElement(Ionicons, { name: 'shield-checkmark', size: 24, color: '#3b82f6' }),
            React.createElement(Text, { style: styles.headerTitle }, 'Confirm Your Vote'),
            React.createElement(Pressable, { 
              style: styles.closeButton, 
              onPress: handleClose 
            },
              React.createElement(Ionicons, { name: 'close', size: 24, color: '#6b7280' })
            )
          )
        ),

        // Content
        React.createElement(View, { style: styles.content },
          confirmationStep === 'verify' && React.createElement(VerifyStep, {
            election,
            candidate,
            verificationCode,
            showCode,
            setShowCode,
            biometricVerified,
            onConfirm: handleConfirm,
            onCancel: handleClose
          }),

          confirmationStep === 'biometric' && React.createElement(BiometricStep, {
            onVerify: handleBiometricVerification,
            onBack: () => setConfirmationStep('verify')
          }),

          confirmationStep === 'processing' && React.createElement(ProcessingStep, {
            candidate
          }),

          confirmationStep === 'success' && React.createElement(SuccessStep, {
            candidate,
            onClose: handleClose
          }),

          confirmationStep === 'error' && React.createElement(ErrorStep, {
            error: error || 'Vote confirmation failed',
            onRetry: handleRetry,
            onCancel: handleClose
          })
        )
      )
    )
  );
}

interface StepProps {
  election?: Election;
  candidate?: Contestant | null;
  verificationCode?: string;
  showCode?: boolean;
  setShowCode?: (show: boolean) => void;
  biometricVerified?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  onVerify?: () => void;
  onBack?: () => void;
  onRetry?: () => void;
  onClose?: () => void;
  error?: string;
}

function VerifyStep({ election, candidate, verificationCode, showCode, setShowCode, biometricVerified, onConfirm, onCancel }: StepProps) {
  if (!election || !candidate) return null;

  return React.createElement(View, { style: styles.stepContainer },
    React.createElement(View, { style: styles.verificationHeader },
      React.createElement(Ionicons, { name: 'checkmark-circle', size: 48, color: '#10b981' }),
      React.createElement(Text, { style: styles.verificationTitle }, 'Final Verification'),
      React.createElement(Text, { style: styles.verificationDescription },
        'Please verify your vote details before confirming'
      )
    ),

    React.createElement(View, { style: styles.voteSummary },
      React.createElement(Text, { style: styles.summaryTitle }, 'Vote Summary'),
      React.createElement(View, { style: styles.candidateSummary },
        React.createElement(View, { style: styles.candidateAvatar },
          React.createElement(Text, { style: styles.candidateAvatarText }, candidate.name.charAt(0))
        ),
        React.createElement(View, { style: styles.candidateDetails },
          React.createElement(Text, { style: styles.candidateName }, candidate.name),
          React.createElement(Text, { style: styles.candidateParty }, candidate.party),
          React.createElement(Text, { style: styles.candidatePosition }, candidate.position)
        )
      ),
      React.createElement(View, { style: styles.electionSummary },
        React.createElement(Text, { style: styles.electionTitle }, election.title),
        React.createElement(Text, { style: styles.electionDate },
          `${formatDate(election.start_date)} - ${formatDate(election.end_date)}`
        )
      )
    ),

    React.createElement(View, { style: styles.verificationCode },
      React.createElement(Text, { style: styles.codeTitle }, 'Verification Code'),
      React.createElement(View, { style: styles.codeContainer },
        React.createElement(Text, { style: styles.codeText }, showCode ? verificationCode : '••••••'),
        React.createElement(Pressable, { 
          style: styles.showButton, 
          onPress: () => setShowCode?.(!showCode) 
        },
          React.createElement(Ionicons, { 
            name: showCode ? 'eye-off' : 'eye', 
            size: 20, 
            color: '#3b82f6' 
          })
        )
      ),
      React.createElement(Text, { style: styles.codeNote },
        'This code will be recorded with your vote for verification'
      )
    ),

    React.createElement(View, { style: styles.biometricStatus },
      React.createElement(Ionicons, { 
        name: biometricVerified ? 'finger-print' : 'finger-print-outline', 
        size: 24, 
        color: biometricVerified ? '#10b981' : '#6b7280' 
      }),
      React.createElement(Text, { style: styles.biometricText },
        biometricVerified ? 'Biometric Verified' : 'Biometric Required'
      )
    ),

    React.createElement(View, { style: styles.warningBox },
      React.createElement(Ionicons, { name: 'warning', size: 20, color: '#f59e0b' }),
      React.createElement(Text, { style: styles.warningText },
        'This action cannot be undone. Your vote will be permanently recorded on the blockchain.'
      )
    ),

    React.createElement(View, { style: styles.actionButtons },
      React.createElement(Pressable, { 
        style: styles.cancelButton, 
        onPress: onCancel 
      },
        React.createElement(Text, { style: styles.cancelButtonText }, 'Cancel')
      ),
      React.createElement(Pressable, { 
        style: [styles.confirmButton, !biometricVerified && styles.confirmButtonDisabled], 
        onPress: onConfirm,
        disabled: !biometricVerified
      },
        React.createElement(View, { style: styles.buttonContent },
          React.createElement(Ionicons, { name: 'checkmark-circle', size: 20, color: 'white' }),
          React.createElement(Text, { style: styles.confirmButtonText }, 'Confirm Vote')
        )
      )
    )
  );
}

function BiometricStep({ onVerify, onBack }: StepProps) {
  return React.createElement(View, { style: styles.stepContainer },
    React.createElement(View, { style: styles.biometricHeader },
      React.createElement(Ionicons, { name: 'finger-print', size: 64, color: '#3b82f6' }),
      React.createElement(Text, { style: styles.biometricTitle }, 'Biometric Verification'),
      React.createElement(Text, { style: styles.biometricDescription },
        'Please use your fingerprint or face ID to verify your identity'
      )
    ),

    React.createElement(View, { style: styles.biometricInfo },
      React.createElement(View, { style: styles.infoItem },
        React.createElement(Ionicons, { name: 'shield', size: 20, color: '#10b981' }),
        React.createElement(Text, { style: styles.infoText }, 'Your biometric data is encrypted and secure')
      ),
      React.createElement(View, { style: styles.infoItem },
        React.createElement(Ionicons, { name: 'lock-closed', size: 20, color: '#10b981' }),
        React.createElement(Text, { style: styles.infoText }, 'Data is not stored on our servers')
      ),
      React.createElement(View, { style: styles.infoItem },
        React.createElement(Ionicons, { name: 'checkmark-circle', size: 20, color: '#10b981' }),
        React.createElement(Text, { style: styles.infoText }, 'Required for vote security')
      )
    ),

    React.createElement(View, { style: styles.actionButtons },
      React.createElement(Pressable, { 
        style: styles.backButton, 
        onPress: onBack 
      },
        React.createElement(Text, { style: styles.backButtonText }, 'Back')
      ),
      React.createElement(Pressable, { 
        style: styles.verifyButton, 
        onPress: onVerify 
      },
        React.createElement(View, { style: styles.buttonContent },
          React.createElement(Ionicons, { name: 'finger-print', size: 20, color: 'white' }),
          React.createElement(Text, { style: styles.verifyButtonText }, 'Verify Identity')
        )
      )
    )
  );
}

function ProcessingStep({ candidate }: StepProps) {
  return React.createElement(View, { style: styles.stepContainer },
    React.createElement(View, { style: styles.processingContent },
      React.createElement(ActivityIndicator, { size: 'large', color: '#3b82f6' }),
      React.createElement(Text, { style: styles.processingTitle }, 'Processing Vote'),
      React.createElement(Text, { style: styles.processingDescription },
        `Confirming vote for ${candidate?.name}...`
      ),
      React.createElement(Text, { style: styles.processingNote },
        'Please wait while we securely process your vote'
      )
    )
  );
}

function SuccessStep({ candidate, onClose }: StepProps) {
  return React.createElement(View, { style: styles.stepContainer },
    React.createElement(View, { style: styles.successContent },
      React.createElement(Ionicons, { name: 'checkmark-circle', size: 64, color: '#10b981' }),
      React.createElement(Text, { style: styles.successTitle }, 'Vote Confirmed!'),
      React.createElement(Text, { style: styles.successDescription },
        `Your vote for ${candidate?.name} has been successfully confirmed and recorded.`
      ),
      React.createElement(Text, { style: styles.successNote },
        'Thank you for participating in the democratic process.'
      )
    )
  );
}

function ErrorStep({ error, onRetry, onCancel }: StepProps) {
  return React.createElement(View, { style: styles.stepContainer },
    React.createElement(View, { style: styles.errorContent },
      React.createElement(Ionicons, { name: 'alert-circle', size: 64, color: '#ef4444' }),
      React.createElement(Text, { style: styles.errorTitle }, 'Confirmation Failed'),
      React.createElement(Text, { style: styles.errorDescription }, error || 'An error occurred during confirmation.'),
      React.createElement(View, { style: styles.errorActions },
        React.createElement(Pressable, { 
          style: styles.retryButton, 
          onPress: onRetry 
        },
          React.createElement(Text, { style: styles.retryButtonText }, 'Try Again')
        ),
        React.createElement(Pressable, { 
          style: styles.cancelButton, 
          onPress: onCancel 
        },
          React.createElement(Text, { style: styles.cancelButtonText }, 'Cancel')
        )
      )
    )
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  dialog: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827'
  },
  closeButton: {
    padding: 4
  },
  content: {
    maxHeight: 500
  },
  stepContainer: {
    padding: 20
  },
  verificationHeader: {
    alignItems: 'center',
    marginBottom: 24
  },
  verificationTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8
  },
  verificationDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center'
  },
  voteSummary: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12
  },
  candidateSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12
  },
  candidateAvatar: {
    width: 48,
    height: 48,
    backgroundColor: '#3b82f6',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  candidateAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white'
  },
  candidateDetails: {
    flex: 1
  },
  candidateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  candidateParty: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2
  },
  candidatePosition: {
    fontSize: 12,
    color: '#9ca3af'
  },
  electionSummary: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12
  },
  electionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4
  },
  electionDate: {
    fontSize: 12,
    color: '#6b7280'
  },
  verificationCode: {
    marginBottom: 20
  },
  codeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8
  },
  codeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 2
  },
  showButton: {
    padding: 4
  },
  codeNote: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center'
  },
  biometricStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8
  },
  biometricText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#d97706'
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center'
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280'
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  confirmButtonDisabled: {
    backgroundColor: '#9ca3af'
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white'
  },
  biometricHeader: {
    alignItems: 'center',
    marginBottom: 24
  },
  biometricTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8
  },
  biometricDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22
  },
  biometricInfo: {
    gap: 12,
    marginBottom: 24
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280'
  },
  backButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center'
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280'
  },
  verifyButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white'
  },
  processingContent: {
    alignItems: 'center',
    paddingVertical: 32
  },
  processingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8
  },
  processingDescription: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8
  },
  processingNote: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center'
  },
  successContent: {
    alignItems: 'center',
    paddingVertical: 32
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8
  },
  successDescription: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center'
  },
  successNote: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center'
  },
  errorContent: {
    alignItems: 'center',
    paddingVertical: 32
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 8
  },
  errorDescription: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center'
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12
  },
  retryButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white'
  }
});

export default VoteConfirmationDialog;
