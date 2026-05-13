// DevSettingsContext: хранит переключатели demo-сценариев, например реальный или тестовый OTP.
/**
 * DevSettingsContext — lightweight context for dev-only UI toggles.
 *
 * Consumed by MentorHome and OrgHome to simulate approved/unapproved
 * states without touching real DB data. In production __DEV__ is false
 * so DevRoleSwitcher never renders and these values are always the
 * "approved" defaults.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

const USE_REAL_OTP_KEY = 'um_dev_use_real_otp';

interface DevSettings {
  mentorApproved: boolean;
  setMentorApproved: (v: boolean) => void;
  orgVerified: boolean;
  setOrgVerified: (v: boolean) => void;
  /** When false (default): DEV_OTP env var is used and SMS is skipped.
   *  When true: real Supabase OTP is sent and the actual code is required. */
  useRealOtp: boolean;
  setUseRealOtp: (v: boolean) => Promise<void>;
  devYouthAge: number;
  setDevYouthAge: (v: number) => void;
  disableHomeRedirect: boolean;
  setDisableHomeRedirect: (v: boolean) => void;
}

const DevSettingsContext = createContext<DevSettings>({
  mentorApproved: true,
  setMentorApproved: () => {},
  orgVerified: true,
  setOrgVerified: () => {},
  useRealOtp: false,
  setUseRealOtp: async () => {},
  devYouthAge: 12, // Default age
  setDevYouthAge: () => {},
  disableHomeRedirect: false,
  setDisableHomeRedirect: () => {},
});

export function DevSettingsProvider({ children }: { children: React.ReactNode }) {
  const [mentorApproved, setMentorApproved] = useState(false);
  const [orgVerified, setOrgVerified] = useState(false);
  const [useRealOtp, setUseRealOtpState] = useState(false);
  const [devYouthAge, setDevYouthAge] = useState(12);
  const [disableHomeRedirect, setDisableHomeRedirect] = useState(false);

  // Hydrate persisted value on mount
  useEffect(() => {
    AsyncStorage.getItem(USE_REAL_OTP_KEY).then((v) => {
      if (v !== null) setUseRealOtpState(v === 'true');
    });
  }, []);

  const setUseRealOtp = async (v: boolean) => {
    setUseRealOtpState(v);
    await AsyncStorage.setItem(USE_REAL_OTP_KEY, v ? 'true' : 'false');
  };

  return (
    <DevSettingsContext.Provider
      value={{
        mentorApproved,
        setMentorApproved,
        orgVerified,
        setOrgVerified,
        useRealOtp,
        setUseRealOtp,
        devYouthAge,
        setDevYouthAge,
        disableHomeRedirect,
        setDisableHomeRedirect,
      }}
    >
      {children}
    </DevSettingsContext.Provider>
  );
}

export function useDevSettings(): DevSettings {
  return useContext(DevSettingsContext);
}

/** Read the persisted real-OTP flag outside of React (used in AuthContext hooks). */
export async function getUseRealOtpSetting(): Promise<boolean> {
  const v = await AsyncStorage.getItem(USE_REAL_OTP_KEY);
  return v === 'true';
}
