# 📱 Mobile Application Architecture Specification: Tomvis Clinic

**Document ID:** `docs/MOBILE_ARCHITECTURE.md`  
**Version:** 1.0.0 (Production Mobile Standard)  
**Framework:** React Native 0.74+ (Expo SDK 51 Managed Workflow) / TypeScript 5  
**Offline Storage:** WatermelonDB (SQLite Engine) + Expo SecureStore  
**Target Platforms:** iOS (App Store), Android (Google Play), LINE LIFF WebApp  
**Compliance:** PDPA B.E. 2562, NIST 800-63B, ISO 27001  

---

## SECTION A: TECHNOLOGY STACK RECOMMENDATION & JUSTIFICATION

### 1. Primary Mobile Framework: **React Native (Expo SDK 51)**
- **Why React Native over Flutter:**
  1. **100% Code & Schema Reuse:** Shares the exact same Zod validation schemas, TypeScript interfaces, and API client logic (`@tomvis/contracts`) with the Next.js Web BFF and NestJS Backend.
  2. **Single Engineering Skillset:** The same 4–8 TypeScript developers can write both Web UI and Mobile Native Apps without hiring separate Dart/Flutter developers.
  3. **Expo Updates (Over-The-Air OTA):** Deploy urgent bug fixes and FDA อย.ส.4/5 updates directly to clinician devices in seconds without waiting 48 hours for Apple/Google App Store reviews.

### 2. Dual Patient Channel: **Expo App + LINE LIFF (LINE Front-end Framework)**
- **Native Patient App:** Published to App Store / Google Play for frequent users needing biometrics, offline records, and local medication alarms.
- **LINE LIFF App:** Lightweight web app running inside LINE Messenger. In Thailand, 95%+ of patients use LINE. Patients can view queue status, book appointments, and pay via PromptPay without installing an app from the App Store.

---

## SECTION B: PROJECT FILE STRUCTURE (`apps/mobile/`)

```
apps/mobile/
├── src/
│   ├── screens/                        # Role-based Mobile Screens
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── BiometricSetupScreen.tsx
│   │   ├── doctor/                     # Doctor Role Workspace
│   │   │   ├── DoctorScheduleScreen.tsx
│   │   │   ├── ConsultationScreen.tsx
│   │   │   ├── VoiceSoapEditorScreen.tsx
│   │   │   └── WoundPhotoCaptureScreen.tsx
│   │   ├── nurse/                      # Nurse Role Workspace
│   │   │   ├── NurseScreeningScreen.tsx
│   │   │   └── VitalSignsScreen.tsx
│   │   ├── pharmacist/                 # Pharmacist Role Workspace
│   │   │   ├── DispensingQueueScreen.tsx
│   │   │   └── BarcodeScanScreen.tsx
│   │   └── patient/                    # Patient Self-Service Workspace
│   │       ├── PatientHomeScreen.tsx
│   │       ├── LiveQueueScreen.tsx
│   │       └── MedicalRecordScreen.tsx
│   ├── components/                     # Native Mobile Components
│   │   ├── ui/                         # Native Cards, Inputs, Buttons
│   │   ├── camera/                     # Barcode/QR & Photo Scanner
│   │   └── voice/                      # Dictation Microphone Button
│   ├── database/                       # Offline-First WatermelonDB
│   │   ├── schema.ts                   # Local SQLite Schema
│   │   ├── index.ts                    # Database Initializer
│   │   └── models/
│   │       ├── PatientModel.ts
│   │       └── AppointmentModel.ts
│   ├── services/
│   │   ├── offline-sync.ts             # WatermelonDB Incremental Sync
│   │   ├── biometric-auth.ts           # FaceID / Fingerprint Manager
│   │   ├── push-notifications.ts       # FCM / APNs Push Listener
│   │   └── voice-to-text.ts            # Speech Recognition API
│   ├── hooks/
│   └── navigation/                     # React Navigation Stacks
├── app.json                            # Expo Configuration
├── package.json
└── tsconfig.json
```

---

## SECTION C: OFFLINE-FIRST SYNC ENGINE SPECIFICATION

```
┌─────────────────────────────────────────┐
│     WATERMELONDB LOCAL SQLITE STORE     │
│   (Patient List, Today's Appointments)  │
└────────────────────┬────────────────────┘
                     │
             Pull Changes / Push Queue
                     │
                     ▼
┌─────────────────────────────────────────┐
│       INCREMENTAL SYNC ENGINE           │
│   - Conflict Resolution: Server Wins    │
│   - Retry with Exponential Backoff      │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│       NESTJS BACKEND API ENGINE         │
└─────────────────────────────────────────┘
```

### `apps/mobile/src/services/offline-sync.ts`

```typescript
import { synchronize } from '@nozbe/watermelondb/sync';
import { database } from '../database';
import { apiFetch } from '@tomvis/contracts';

export async function syncMobileDatabase() {
  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
      const response = await apiFetch(`/api/v1/sync/pull?lastPulledAt=${lastPulledAt || 0}`);
      const { changes, timestamp } = response.data;
      return { changes, timestamp };
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      await apiFetch('/api/v1/sync/push', {
        method: 'POST',
        body: JSON.stringify({ changes, lastPulledAt }),
      });
    },
    migrationsEnabled: true,
  });
}
```

---

## SECTION D: BIOMETRIC AUTHENTICATION & SECURE STORAGE

### `apps/mobile/src/services/biometric-auth.ts`

```typescript
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'tomvis_patient_jwt';

export async function authenticateWithBiometrics(): Promise<string | null> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (!hasHardware || !isEnrolled) {
    throw new Error('อุปกรณ์ไม่รองรับการสแกนลายนิ้วมือหรือใบหน้า (Face ID)');
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'ยืนยันตัวตนด้วย Face ID / ลายนิ้วมือเพื่อเข้าสู่ระบบ Tomvis Clinic',
    fallbackLabel: 'กรอก รหัสผ่าน',
  });

  if (result.success) {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  }

  return null;
}

export async function saveSecureToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  });
}
```

---

## SECTION E: DOCTOR SCHEDULE & VOICE-TO-TEXT SCREEN IMPLEMENTATION

### `apps/mobile/src/screens/doctor/DoctorScheduleScreen.tsx`

```tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

export function DoctorScheduleScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [soapNotes, setSoapNotes] = useState('');

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Mock Speech Recognition API dictation
      setTimeout(() => {
        setSoapNotes((prev) => prev + ' ผู้ป่วยมีอาการไข้สูง 38.5 C เจ็บคอ 2 วัน ไอมีเสมหะเล็กน้อย');
        setIsRecording(false);
      }, 3000);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ตารางตรวจแพทย์ประจำวันนี้</Text>
        <Text style={styles.subtitle}>Doctor Schedule • OPD Exam Room 1</Text>
      </View>

      {/* Patient Card */}
      <View style={styles.card}>
        <View style={styles.badgeRow}>
          <Text style={styles.hnBadge}>HN-260916-0001</Text>
          <Text style={styles.statusBadge}>รอตรวจ (WAITING)</Text>
        </View>
        <Text style={styles.patientName}>นาย ประณีต สุขใจ</Text>
        <Text style={styles.chiefComplaint}>อาการสำคัญ: ไข้ เจ็บคอ ไอมีเสมหะ</Text>

        {/* Voice-to-Text Dictation Button */}
        <View style={styles.dictationContainer}>
          <Text style={styles.label}>บันทึกคำวินิจฉัยด้วยเสียง (Voice SOAP Note)</Text>
          <TouchableOpacity
            onPress={handleVoiceInput}
            style={[styles.micButton, isRecording && styles.micButtonActive]}
          >
            <Text style={styles.micText}>
              {isRecording ? '🎙️ กำลังฟังเสียงพูด...' : '🎤 กดเพื่อเริ่มพูดบันทึก SOAP'}
            </Text>
          </TouchableOpacity>

          {soapNotes ? (
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{soapNotes}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  header: { marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#38bdf8' },
  subtitle: { fontSize: 12, color: '#94a3b8' },
  card: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, borderMiddle: 1, borderColor: '#334155' },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  hnBadge: { color: '#34d399', fontWeight: 'bold', fontSize: 12 },
  statusBadge: { color: '#fbbf24', fontSize: 12 },
  patientName: { fontSize: 18, fontWeight: 'bold', color: '#f8fafc', marginBottom: 4 },
  chiefComplaint: { fontSize: 14, color: '#cbd5e1', marginBottom: 16 },
  dictationContainer: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#334155' },
  label: { fontSize: 12, color: '#94a3b8', marginBottom: 8 },
  micButton: { backgroundColor: '#0284c7', padding: 14, borderRadius: 12, alignItems: 'center' },
  micButtonActive: { backgroundColor: '#dc2626' },
  micText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  notesBox: { backgroundColor: '#090d16', padding: 12, borderRadius: 8, marginTop: 12 },
  notesText: { color: '#e2e8f0', fontSize: 13 },
});
```

---

## SECTION F: EAS BUILD & ENTERPRISE DEPLOYMENT

```json
{
  "cli": { "version": ">= 9.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "channel": "production",
      "autoIncrement": true
    }
  }
}
```

### Build Commands:
- **iOS App Store Build:** `eas build --platform ios --profile production`
- **Android Play Store Build:** `eas build --platform android --profile production`
- **Over-The-Air OTA Update:** `eas update --branch production --message "FDA อย.ส.4/5 Security Update"`
