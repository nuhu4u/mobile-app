/**
 * Voter Profile Components
 * User profile management for the voter dashboard
 */

import * as React from 'react';
// import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { Avatar } from '@/components/ui/avatar';
// import { Edit, Save, Cancel, Camera, Upload, Download, Shield, CheckCircle, AlertCircle, User, Mail, Phone, MapPin, Calendar, IdCard } from 'lucide-react-native';

// Mock components for now
const View = ({ children, ...props }: any) => React.createElement('div', props, children);
const Text = ({ children, ...props }: any) => React.createElement('span', props, children);
const ScrollView = ({ children, ...props }: any) => React.createElement('div', props, children);
const TouchableOpacity = ({ children, ...props }: any) => React.createElement('button', props, children);
const Image = ({ ...props }: any) => React.createElement('img', props);
const Alert = { alert: (message: string) => console.log('Alert:', message) };

const Card = ({ children, ...props }: any) => React.createElement('div', props, children);
const Button = ({ children, ...props }: any) => React.createElement('button', props, children);
const Input = ({ ...props }: any) => React.createElement('input', props);
const Badge = ({ children, ...props }: any) => React.createElement('span', props, children);
const Avatar = ({ ...props }: any) => React.createElement('div', props);

// Mock icons
const Edit = () => React.createElement('span', { className: 'text-gray-400' }, '✏️');
const Save = () => React.createElement('span', { className: 'text-gray-400' }, '💾');
const Cancel = () => React.createElement('span', { className: 'text-gray-400' }, '❌');
const Camera = () => React.createElement('span', { className: 'text-gray-400' }, '📷');
const Upload = () => React.createElement('span', { className: 'text-gray-400' }, '📤');
const Download = () => React.createElement('span', { className: 'text-gray-400' }, '⬇️');
const Shield = () => React.createElement('span', { className: 'text-gray-400' }, '🛡️');
const CheckCircle = () => React.createElement('span', { className: 'text-green-600' }, '✅');
const AlertCircle = () => React.createElement('span', { className: 'text-orange-600' }, '⚠️');
const User = () => React.createElement('span', { className: 'text-gray-400' }, '👤');
const Mail = () => React.createElement('span', { className: 'text-gray-400' }, '📧');
const Phone = () => React.createElement('span', { className: 'text-gray-400' }, '📞');
const MapPin = () => React.createElement('span', { className: 'text-gray-400' }, '📍');
const Calendar = () => React.createElement('span', { className: 'text-gray-400' }, '📅');
const IdCard = () => React.createElement('span', { className: 'text-gray-400' }, '🆔');

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  state: string;
  lga: string;
  ward: string;
  pollingUnit: string;
  voterId: string;
  nin: string;
  profileImage?: string;
  isVerified: boolean;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  lastUpdated: string;
  createdAt: string;
  roles: string[];
  permissions: string[];
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    smsUpdates: boolean;
    language: string;
    theme: 'light' | 'dark' | 'auto';
  };
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  state: string;
  lga: string;
  ward: string;
  pollingUnit: string;
  nin: string;
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    smsUpdates: boolean;
    language: string;
    theme: 'light' | 'dark' | 'auto';
  };
}

export interface ProfileSectionProps {
  profile: UserProfile;
  onUpdate: (data: ProfileFormData) => Promise<void>;
  onImageUpload: (file: File) => Promise<string>;
  onDownloadProfile: () => void;
  className?: string;
}

export interface ProfileHeaderProps {
  profile: UserProfile;
  onEdit: () => void;
  onImageUpload: (file: File) => Promise<string>;
  isEditing: boolean;
}

export interface ProfileFormProps {
  profile: UserProfile;
  onSave: (data: ProfileFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}


/**
 * Profile Header Component
 */
export function ProfileHeader({
  profile,
  onEdit,
  onImageUpload,
  isEditing,
}: ProfileHeaderProps) {
  const [isUploading, setIsUploading] = React.useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await onImageUpload(file);
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return React.createElement('div', { className: 'bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg' },
    React.createElement('div', { className: 'flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6' },
      // Profile Image
      React.createElement('div', { className: 'relative' },
        React.createElement(Avatar, {
          className: 'w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600'
        },
          profile.profileImage ? 
            React.createElement(Image, {
              src: profile.profileImage,
              alt: `${profile.firstName} ${profile.lastName}`,
              className: 'w-full h-full rounded-full object-cover'
            }) :
            React.createElement(User, null)
        ),
        React.createElement('label', {
          className: 'absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors'
        },
          React.createElement('input', {
            type: 'file',
            accept: 'image/*',
            onChange: handleImageUpload,
            className: 'hidden',
            disabled: isUploading
          }),
          isUploading ? 
            React.createElement('div', { className: 'animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full' }) :
            React.createElement(Camera, null)
        )
      ),

      // Profile Info
      React.createElement('div', { className: 'flex-1 text-center md:text-left' },
        React.createElement('h1', { className: 'text-3xl font-bold text-gray-900 mb-2' },
          `${profile.firstName} ${profile.lastName}`
        ),
        React.createElement('p', { className: 'text-gray-600 mb-2' }, profile.email),
        React.createElement('div', { className: 'flex items-center justify-center md:justify-start space-x-4' },
          React.createElement(Badge, {
            className: `px-3 py-1 rounded-full text-sm ${
              profile.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
              profile.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`
          },
            profile.verificationStatus === 'verified' ? React.createElement(CheckCircle, null) :
            profile.verificationStatus === 'pending' ? React.createElement(AlertCircle, null) :
            React.createElement(AlertCircle, null),
            React.createElement('span', { className: 'ml-1' },
              profile.verificationStatus.charAt(0).toUpperCase() + profile.verificationStatus.slice(1)
            )
          ),
          React.createElement(Badge, {
            className: 'px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm'
          },
            React.createElement(Shield, null),
            React.createElement('span', { className: 'ml-1' }, 'Voter ID: ' + profile.voterId)
          )
        )
      ),

      // Action Buttons
      React.createElement('div', { className: 'flex space-x-2' },
        !isEditing && React.createElement(Button, {
          onClick: onEdit,
          className: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2'
        },
          React.createElement(Edit, null),
          React.createElement(Text, null, 'Edit Profile')
        )
      )
    )
  );
}

/**
 * Profile Form Component
 */
export function ProfileForm({
  profile,
  onSave,
  onCancel,
  isLoading,
}: ProfileFormProps) {
  const [formData, setFormData] = React.useState<ProfileFormData>({
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phone: profile.phone,
    dateOfBirth: profile.dateOfBirth,
    address: profile.address,
    state: profile.state,
    lga: profile.lga,
    ward: profile.ward,
    pollingUnit: profile.pollingUnit,
    nin: profile.nin,
    preferences: { ...profile.preferences }
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePreferenceChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (!formData.nin.trim()) {
      newErrors.nin = 'NIN is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  return React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-6' },
    // Personal Information
    React.createElement(Card, { className: 'p-6' },
      React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-4' }, 'Personal Information'),
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
        React.createElement('div', null,
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'First Name'),
          React.createElement(Input, {
            type: 'text',
            value: formData.firstName,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('firstName', e.target.value),
            className: `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.firstName ? 'border-red-300' : 'border-gray-300'
            }`,
            placeholder: 'Enter first name'
          }),
          errors.firstName && React.createElement('p', { className: 'text-red-500 text-sm mt-1' }, errors.firstName)
        ),

        React.createElement('div', null,
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Last Name'),
          React.createElement(Input, {
            type: 'text',
            value: formData.lastName,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('lastName', e.target.value),
            className: `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.lastName ? 'border-red-300' : 'border-gray-300'
            }`,
            placeholder: 'Enter last name'
          }),
          errors.lastName && React.createElement('p', { className: 'text-red-500 text-sm mt-1' }, errors.lastName)
        ),

        React.createElement('div', null,
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Email'),
          React.createElement(Input, {
            type: 'email',
            value: formData.email,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value),
            className: `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`,
            placeholder: 'Enter email address'
          }),
          errors.email && React.createElement('p', { className: 'text-red-500 text-sm mt-1' }, errors.email)
        ),

        React.createElement('div', null,
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Phone'),
          React.createElement(Input, {
            type: 'tel',
            value: formData.phone,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('phone', e.target.value),
            className: `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.phone ? 'border-red-300' : 'border-gray-300'
            }`,
            placeholder: 'Enter phone number'
          }),
          errors.phone && React.createElement('p', { className: 'text-red-500 text-sm mt-1' }, errors.phone)
        ),

        React.createElement('div', null,
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Date of Birth'),
          React.createElement(Input, {
            type: 'date',
            value: formData.dateOfBirth,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('dateOfBirth', e.target.value),
            className: `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
            }`
          }),
          errors.dateOfBirth && React.createElement('p', { className: 'text-red-500 text-sm mt-1' }, errors.dateOfBirth)
        ),

        React.createElement('div', null,
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'NIN'),
          React.createElement(Input, {
            type: 'text',
            value: formData.nin,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('nin', e.target.value),
            className: `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.nin ? 'border-red-300' : 'border-gray-300'
            }`,
            placeholder: 'Enter NIN'
          }),
          errors.nin && React.createElement('p', { className: 'text-red-500 text-sm mt-1' }, errors.nin)
        )
      )
    ),

    // Address Information
    React.createElement(Card, { className: 'p-6' },
      React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-4' }, 'Address Information'),
      React.createElement('div', { className: 'space-y-4' },
        React.createElement('div', null,
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Address'),
          React.createElement(Input, {
            type: 'text',
            value: formData.address,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('address', e.target.value),
            className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500',
            placeholder: 'Enter full address'
          })
        ),

        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'State'),
            React.createElement('select', {
              value: formData.state,
              onChange: (e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('state', e.target.value),
              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            },
              React.createElement('option', { value: '' }, 'Select State'),
              React.createElement('option', { value: 'Lagos' }, 'Lagos'),
              React.createElement('option', { value: 'Abuja' }, 'Abuja'),
              React.createElement('option', { value: 'Kano' }, 'Kano')
            )
          ),

          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'LGA'),
            React.createElement('select', {
              value: formData.lga,
              onChange: (e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('lga', e.target.value),
              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            },
              React.createElement('option', { value: '' }, 'Select LGA'),
              React.createElement('option', { value: 'Eti-Osa' }, 'Eti-Osa'),
              React.createElement('option', { value: 'Ikeja' }, 'Ikeja'),
              React.createElement('option', { value: 'Surulere' }, 'Surulere')
            )
          ),

          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Ward'),
            React.createElement(Input, {
              type: 'text',
              value: formData.ward,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('ward', e.target.value),
              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500',
              placeholder: 'Enter ward'
            })
          ),

          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Polling Unit'),
            React.createElement(Input, {
              type: 'text',
              value: formData.pollingUnit,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('pollingUnit', e.target.value),
              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500',
              placeholder: 'Enter polling unit'
            })
          )
        )
      )
    ),

    // Preferences
    React.createElement(Card, { className: 'p-6' },
      React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-4' }, 'Preferences'),
      React.createElement('div', { className: 'space-y-4' },
        React.createElement('div', { className: 'flex items-center justify-between' },
          React.createElement('div', null,
            React.createElement('label', { className: 'text-sm font-medium text-gray-700' }, 'Push Notifications'),
            React.createElement('p', { className: 'text-xs text-gray-500' }, 'Receive notifications about elections and updates')
          ),
          React.createElement('input', {
            type: 'checkbox',
            checked: formData.preferences.notifications,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handlePreferenceChange('notifications', e.target.checked),
            className: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
          })
        ),

        React.createElement('div', { className: 'flex items-center justify-between' },
          React.createElement('div', null,
            React.createElement('label', { className: 'text-sm font-medium text-gray-700' }, 'Email Updates'),
            React.createElement('p', { className: 'text-xs text-gray-500' }, 'Receive updates via email')
          ),
          React.createElement('input', {
            type: 'checkbox',
            checked: formData.preferences.emailUpdates,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handlePreferenceChange('emailUpdates', e.target.checked),
            className: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
          })
        ),

        React.createElement('div', { className: 'flex items-center justify-between' },
          React.createElement('div', null,
            React.createElement('label', { className: 'text-sm font-medium text-gray-700' }, 'SMS Updates'),
            React.createElement('p', { className: 'text-xs text-gray-500' }, 'Receive updates via SMS')
          ),
          React.createElement('input', {
            type: 'checkbox',
            checked: formData.preferences.smsUpdates,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handlePreferenceChange('smsUpdates', e.target.checked),
            className: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
          })
        ),

        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Language'),
            React.createElement('select', {
              value: formData.preferences.language,
              onChange: (e: React.ChangeEvent<HTMLSelectElement>) => handlePreferenceChange('language', e.target.value),
              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            },
              React.createElement('option', { value: 'en' }, 'English'),
              React.createElement('option', { value: 'yo' }, 'Yoruba'),
              React.createElement('option', { value: 'ig' }, 'Igbo'),
              React.createElement('option', { value: 'ha' }, 'Hausa')
            )
          ),

          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Theme'),
            React.createElement('select', {
              value: formData.preferences.theme,
              onChange: (e: React.ChangeEvent<HTMLSelectElement>) => handlePreferenceChange('theme', e.target.value),
              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            },
              React.createElement('option', { value: 'light' }, 'Light'),
              React.createElement('option', { value: 'dark' }, 'Dark'),
              React.createElement('option', { value: 'auto' }, 'Auto')
            )
          )
        )
      )
    ),

    // Form Actions
    React.createElement('div', { className: 'flex justify-end space-x-4' },
      React.createElement(Button, {
        type: 'button',
        onClick: onCancel,
        className: 'px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2'
      },
        React.createElement(Cancel, null),
        React.createElement(Text, null, 'Cancel')
      ),
      React.createElement(Button, {
        type: 'submit',
        disabled: isLoading,
        className: 'px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2'
      },
        isLoading ? 
          React.createElement('div', { className: 'animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full' }) :
          React.createElement(Save, null),
        React.createElement(Text, null, isLoading ? 'Saving...' : 'Save Changes')
      )
    )
  );
}


/**
 * Main Profile Section Component
 */
export function VoterProfileSection({
  profile,
  onUpdate,
  onImageUpload,
  onDownloadProfile,
  className = '',
}: ProfileSectionProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSave = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      await onUpdate(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };


  return React.createElement('div', { className: `space-y-6 ${className}` },
    // Profile Header
    React.createElement(ProfileHeader, {
      profile,
      onEdit: handleEdit,
      onImageUpload,
      isEditing
    }),

    // Profile Content
    isEditing ? 
      React.createElement(ProfileForm, {
        profile,
        onSave: handleSave,
        onCancel: handleCancel,
        isLoading
      }) :
      React.createElement(React.Fragment, null,
        // Action Buttons
        React.createElement('div', { className: 'flex justify-end space-x-4' },
          React.createElement(Button, {
            onClick: onDownloadProfile,
            className: 'px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2'
          },
            React.createElement(Download, null),
            React.createElement(Text, null, 'Download Profile')
          )
        )
      )
  );
}

export default VoterProfileSection;

            value: formData.lastName,

            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('lastName', e.target.value),

            className: `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.lastName ? 'border-red-300' : 'border-gray-300'
            }`,

            placeholder: 'Enter last name'

          }),

          errors.lastName && React.createElement('p', { className: 'text-red-500 text-sm mt-1' }, errors.lastName)

        ),



        React.createElement('div', null,

          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Email'),

          React.createElement(Input, {

            type: 'email',

            value: formData.email,

            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value),

            className: `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${

              errors.email ? 'border-red-300' : 'border-gray-300'

            }`,

            placeholder: 'Enter email address'

          }),

          errors.email && React.createElement('p', { className: 'text-red-500 text-sm mt-1' }, errors.email)

        ),



        React.createElement('div', null,

          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Phone'),

          React.createElement(Input, {

            type: 'tel',

            value: formData.phone,

            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('phone', e.target.value),

            className: `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${

              errors.phone ? 'border-red-300' : 'border-gray-300'

            }`,

            placeholder: 'Enter phone number'

          }),

          errors.phone && React.createElement('p', { className: 'text-red-500 text-sm mt-1' }, errors.phone)

        ),



        React.createElement('div', null,

          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Date of Birth'),

          React.createElement(Input, {

            type: 'date',

            value: formData.dateOfBirth,

            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('dateOfBirth', e.target.value),

            className: `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${

              errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'

            }`

          }),

          errors.dateOfBirth && React.createElement('p', { className: 'text-red-500 text-sm mt-1' }, errors.dateOfBirth)

        ),



        React.createElement('div', null,

          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'NIN'),

          React.createElement(Input, {

            type: 'text',

            value: formData.nin,

            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('nin', e.target.value),

            className: `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${

              errors.nin ? 'border-red-300' : 'border-gray-300'

            }`,

            placeholder: 'Enter NIN'

          }),

          errors.nin && React.createElement('p', { className: 'text-red-500 text-sm mt-1' }, errors.nin)

        )

      )

    ),



    // Address Information

    React.createElement(Card, { className: 'p-6' },

      React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-4' }, 'Address Information'),

      React.createElement('div', { className: 'space-y-4' },

        React.createElement('div', null,

          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Address'),

          React.createElement(Input, {

            type: 'text',

            value: formData.address,

            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('address', e.target.value),

            className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500',

            placeholder: 'Enter full address'

          })

        ),



        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },

          React.createElement('div', null,

            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'State'),

            React.createElement('select', {

              value: formData.state,

              onChange: (e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('state', e.target.value),

              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'

            },

              React.createElement('option', { value: '' }, 'Select State'),

              React.createElement('option', { value: 'Lagos' }, 'Lagos'),

              React.createElement('option', { value: 'Abuja' }, 'Abuja'),

              React.createElement('option', { value: 'Kano' }, 'Kano')

            )

          ),



          React.createElement('div', null,

            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'LGA'),

            React.createElement('select', {

              value: formData.lga,

              onChange: (e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('lga', e.target.value),

              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'

            },

              React.createElement('option', { value: '' }, 'Select LGA'),

              React.createElement('option', { value: 'Eti-Osa' }, 'Eti-Osa'),

              React.createElement('option', { value: 'Ikeja' }, 'Ikeja'),

              React.createElement('option', { value: 'Surulere' }, 'Surulere')

            )

          ),



          React.createElement('div', null,

            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Ward'),

            React.createElement(Input, {

              type: 'text',

              value: formData.ward,

              onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('ward', e.target.value),

              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500',

              placeholder: 'Enter ward'

            })

          ),



          React.createElement('div', null,

            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Polling Unit'),

            React.createElement(Input, {

              type: 'text',

              value: formData.pollingUnit,

              onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('pollingUnit', e.target.value),

              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500',

              placeholder: 'Enter polling unit'

            })

          )

        )

      )

    ),



    // Preferences

    React.createElement(Card, { className: 'p-6' },

      React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-4' }, 'Preferences'),

      React.createElement('div', { className: 'space-y-4' },

        React.createElement('div', { className: 'flex items-center justify-between' },

          React.createElement('div', null,

            React.createElement('label', { className: 'text-sm font-medium text-gray-700' }, 'Push Notifications'),

            React.createElement('p', { className: 'text-xs text-gray-500' }, 'Receive notifications about elections and updates')

          ),

          React.createElement('input', {

            type: 'checkbox',

            checked: formData.preferences.notifications,

            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handlePreferenceChange('notifications', e.target.checked),

            className: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'

          })

        ),



        React.createElement('div', { className: 'flex items-center justify-between' },

          React.createElement('div', null,

            React.createElement('label', { className: 'text-sm font-medium text-gray-700' }, 'Email Updates'),

            React.createElement('p', { className: 'text-xs text-gray-500' }, 'Receive updates via email')

          ),

          React.createElement('input', {

            type: 'checkbox',

            checked: formData.preferences.emailUpdates,

            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handlePreferenceChange('emailUpdates', e.target.checked),

            className: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'

          })

        ),



        React.createElement('div', { className: 'flex items-center justify-between' },

          React.createElement('div', null,

            React.createElement('label', { className: 'text-sm font-medium text-gray-700' }, 'SMS Updates'),

            React.createElement('p', { className: 'text-xs text-gray-500' }, 'Receive updates via SMS')

          ),

          React.createElement('input', {

            type: 'checkbox',

            checked: formData.preferences.smsUpdates,

            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handlePreferenceChange('smsUpdates', e.target.checked),

            className: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'

          })

        ),



        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },

          React.createElement('div', null,

            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Language'),

            React.createElement('select', {

              value: formData.preferences.language,

              onChange: (e: React.ChangeEvent<HTMLSelectElement>) => handlePreferenceChange('language', e.target.value),

              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'

            },

              React.createElement('option', { value: 'en' }, 'English'),

              React.createElement('option', { value: 'yo' }, 'Yoruba'),

              React.createElement('option', { value: 'ig' }, 'Igbo'),

              React.createElement('option', { value: 'ha' }, 'Hausa')

            )

          ),



          React.createElement('div', null,

            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Theme'),

            React.createElement('select', {

              value: formData.preferences.theme,

              onChange: (e: React.ChangeEvent<HTMLSelectElement>) => handlePreferenceChange('theme', e.target.value),

              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'

            },

              React.createElement('option', { value: 'light' }, 'Light'),

              React.createElement('option', { value: 'dark' }, 'Dark'),

              React.createElement('option', { value: 'auto' }, 'Auto')

            )

          )

        )

      )

    ),



    // Form Actions

    React.createElement('div', { className: 'flex justify-end space-x-4' },

      React.createElement(Button, {

        type: 'button',

        onClick: onCancel,

        className: 'px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2'

      },

        React.createElement(Cancel, null),

        React.createElement(Text, null, 'Cancel')

      ),

      React.createElement(Button, {

        type: 'submit',

        disabled: isLoading,

        className: 'px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2'

      },

        isLoading ? 

          React.createElement('div', { className: 'animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full' }) :

          React.createElement(Save, null),

        React.createElement(Text, null, isLoading ? 'Saving...' : 'Save Changes')

      )

    )

  );

}



/**

 * Profile Stats Component

 */




/**

 * Main Profile Section Component

 */

export function VoterProfileSection({

  profile,

  onUpdate,

  onImageUpload,

  onDownloadProfile,

  className = '',

}: ProfileSectionProps) {

  const [isEditing, setIsEditing] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(false);



  const handleSave = async (data: ProfileFormData) => {

    setIsLoading(true);

    try {

      await onUpdate(data);

      setIsEditing(false);

    } catch (error) {

      console.error('Profile update failed:', error);

    } finally {

      setIsLoading(false);

    }

  };



  const handleCancel = () => {

    setIsEditing(false);

  };



  const handleEdit = () => {

    setIsEditing(true);

  };



  // Mock stats

  const stats = {

    totalVotes: 15,

    electionsParticipated: 8,

    accountAge: 365,

    lastLogin: new Date().toISOString()

  };



  return React.createElement('div', { className: `space-y-6 ${className}` },

    // Profile Header

    React.createElement(ProfileHeader, {

      profile,

      onEdit: handleEdit,

      onImageUpload,

      isEditing

    }),



    // Profile Content

    isEditing ? 

      React.createElement(ProfileForm, {

        profile,

        onSave: handleSave,

        onCancel: handleCancel,

        isLoading

      }) :

      React.createElement(React.Fragment, null,




        // Action Buttons

        React.createElement('div', { className: 'flex justify-end space-x-4' },

          React.createElement(Button, {

            onClick: onDownloadProfile,

            className: 'px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2'

          },

            React.createElement(Download, null),

            React.createElement(Text, null, 'Download Profile')

          )

        )

      )

  );

}



export default VoterProfileSection;


