'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useHealthStore } from '@/lib/stores/health-store';
import { Avatar, Button, Card, CardContent, Input, Textarea, ImageCropper } from '@/components/ui';

function calculateAge(birthdate: string): number {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export default function ProfilePage() {
  const router = useRouter();
  const profile = useHealthStore((state) => state.profile);
  const saveProfile = useHealthStore((state) => state.saveProfile);

  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [birthdate, setBirthdate] = useState(profile?.birthdate || '');
  const [medicalConditions, setMedicalConditions] = useState(profile?.medical_conditions || '');
  const [emergencyContact, setEmergencyContact] = useState(profile?.emergency_contact || '');
  const [avatar, setAvatar] = useState(profile?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [tempImage, setTempImage] = useState('');
  const [showCropper, setShowCropper] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [touched, setTouched] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split('T')[0];
  const nameError = touched && !name.trim() ? 'Name is required' : undefined;

  const handleAvatarClick = () => {
    setShowAvatarMenu(!showAvatarMenu);
  };

  const handleReplaceImage = () => {
    setShowAvatarMenu(false);
    fileInputRef.current?.click();
  };

  const handleEditImage = () => {
    setShowAvatarMenu(false);
    const currentAvatar = avatar || profile?.avatar;
    if (currentAvatar) {
      setTempImage(currentAvatar);
      setShowCropper(true);
    }
  };

  const handleDeleteImage = () => {
    setShowAvatarMenu(false);
    setAvatar('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleCropComplete = (croppedImage: string) => {
    setAvatar(croppedImage);
    setTempImage('');
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    await saveProfile({
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      birthdate: birthdate || undefined,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      medical_conditions: medicalConditions.trim() || undefined,
      emergency_contact: emergencyContact.trim() || undefined,
      avatar: avatar || undefined,
    });
    setIsSaving(false);
    router.push('/user');
  };

  const calculatedAge = birthdate ? calculateAge(birthdate) : null;

  return (
    <div className="flex flex-col gap-3 pt-2">
      <header>
        <h1 className="text-xl font-bold text-[#1a1a1a]">Profile</h1>
      </header>

      <Card>
        <CardContent className="py-3 flex flex-col gap-3">
          {/* Avatar + Name */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button onClick={handleAvatarClick} className="relative group" aria-label="Edit profile photo">
                <Avatar src={avatar || profile?.avatar} name={name} size="md" />
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </button>
              {showAvatarMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowAvatarMenu(false)} />
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[140px]">
                    <button
                      onClick={handleReplaceImage}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Replace
                    </button>
                    {(avatar || profile?.avatar) && (
                      <>
                        <button
                          onClick={handleEditImage}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={handleDeleteImage}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex-1">
              <Input
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="Enter your name"
                error={nameError}
              />
            </div>
          </div>

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
          />

          <Input
            label="Phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
          />

          <div>
            <Input
              label={`Birthdate${calculatedAge !== null ? ` (${calculatedAge} years old)` : ''}`}
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              max={today}
            />
          </div>

          <div className="border-t border-gray-100" />

          <Input
            label="Emergency Contact"
            value={emergencyContact}
            onChange={(e) => setEmergencyContact(e.target.value)}
            placeholder="Name and phone number"
          />

          <Textarea
            label="Medical Conditions (optional)"
            value={medicalConditions}
            onChange={(e) => setMedicalConditions(e.target.value)}
            placeholder="List any conditions"
            rows={1}
          />

          <Button onClick={handleSave} disabled={!name.trim() || isSaving} className="w-full">
            {isSaving ? 'Saving...' : 'Save Profile'}
          </Button>
        </CardContent>
      </Card>

      <ImageCropper
        imageSrc={tempImage}
        isOpen={showCropper}
        onClose={() => setShowCropper(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
