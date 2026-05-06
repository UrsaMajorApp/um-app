import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { useAuth } from '$contexts/AuthContext';
import { useDevDataVersion } from '$lib/devDataEvents';
import { createClientUuid, isUuid } from '$lib/idUtils';
import { isSupabaseConfigured, supabase } from '$lib/supabase';
import type { Child } from '$types/child';
import type { Diagnostic } from '$types/diagnostic';

const devTariffKey = (userId: string) => `um_dev_tariff_${userId}`;
type AgeGroup = '6-8' | '9-11' | '12-14' | '15-17';

interface ParentProfileData {
  firstName: string;
  lastName?: string;
  phone?: string;
  tariff?: 'basic' | 'pro';
}

type RemoteParentProfileRow = {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  tariff: ParentProfileData['tariff'] | null;
};

type RemoteChildProfileRow = {
  id: string | number;
  name: string | null;
  age: number | string | null;
  interests: string | string[] | null;
  age_category: Child['ageCategory'] | null;
  talent_profile: Diagnostic | null;
};

interface ChildDraft {
  id: string;
  name: string;
  ageGroup: AgeGroup | null;
  phone?: string;
  qrPin?: string;
  qrPinExpiresAt?: Date;
  qrPinOneTimeUse?: boolean;
}

interface ParentDataContextType {
  parentProfile: ParentProfileData | null;
  childrenProfile: Child[];
  activeChildId: string | null;
  isLoading: boolean;
  setActiveChildId: (id: string | null) => void;
  addChild: (child: Child) => Promise<void>;
  removeChild: (childId: string) => Promise<void>;
  updateChild: (childId: string, patch: Partial<Child>) => Promise<void>;
  updateParentProfile: (profile: Partial<ParentProfileData>) => Promise<void>;
  saveParentProfile: (profile: ParentProfileData, draftChildren: ChildDraft[]) => Promise<void>;
  updateChildDiagnostic: (childId: string, diagnostic: Diagnostic) => Promise<void>;
  setParentTariff: (tariff: 'basic' | 'pro') => Promise<void>;
}

const ParentDataContext = createContext<ParentDataContextType | undefined>(undefined);

function ageGroupToCategory(ageGroup: AgeGroup | null): Child['ageCategory'] {
  if (ageGroup === '6-8' || ageGroup === '9-11') return 'child';
  if (ageGroup === '12-14' || ageGroup === '15-17') return 'teen';
  return 'child';
}

function ageGroupToAge(ageGroup: AgeGroup | null) {
  if (ageGroup === '6-8') return 7;
  if (ageGroup === '9-11') return 10;
  if (ageGroup === '12-14') return 13;
  if (ageGroup === '15-17') return 16;
  return 10;
}

function normalizeChild(child: Child): Child {
  return {
    ...child,
    interests: Array.isArray(child.interests) ? child.interests : [],
    ageCategory: child.ageCategory || 'child',
  };
}

export function ParentDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const devDataVersion = useDevDataVersion();
  const [parentProfile, setParentProfile] = useState<ParentProfileData | null>(null);
  const [childrenProfile, setChildrenProfile] = useState<Child[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // True only when a real Supabase session exists (not for dev-bypass users).
  const [hasRealSession, setHasRealSession] = useState(false);

  useEffect(() => {
    void devDataVersion;
    const loadParentData = async () => {
      if (!user) {
        setParentProfile(null);
        setChildrenProfile([]);
        setActiveChildId(null);
        setHasRealSession(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      let nextProfile: ParentProfileData | null = null;
      let nextChildren: Child[] = [];

      if (supabase && isSupabaseConfigured) {
        // Check for a real auth session — dev-bypass users have none.
        const { data: sessionData } = await supabase.auth.getSession();
        const realSession = !!sessionData.session;
        setHasRealSession(realSession);

        if (!realSession) {
          // Dev-bypass or unauthenticated: skip DB, hydrate from auth user only.
          const storedTariff = await AsyncStorage.getItem(devTariffKey(user.id));
          setParentProfile({
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            tariff: (storedTariff as 'basic' | 'pro') || 'basic',
          });
          setChildrenProfile([]);
          setActiveChildId(null);
          setIsLoading(false);
          return;
        }

        const [remoteParentResponse, remoteChildrenResponse] = await Promise.all([
          supabase
            .from('parent_profiles')
            .select('first_name, last_name, phone, tariff')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('child_profiles')
            .select('id, name, age, interests, age_category, talent_profile')
            .eq('parent_user_id', user.id)
            .order('created_at', { ascending: true }),
        ]);

        if (!remoteParentResponse.error && remoteParentResponse.data) {
          const d = remoteParentResponse.data as RemoteParentProfileRow;
          nextProfile = {
            firstName: d.first_name || user.firstName,
            lastName: d.last_name || user.lastName,
            phone: d.phone || user.phone,
            tariff: d.tariff || 'basic',
          };
        }

        if (!remoteChildrenResponse.error && remoteChildrenResponse.data) {
          nextChildren = (remoteChildrenResponse.data as RemoteChildProfileRow[]).map((item) => {
            const parsedInterests =
              typeof item.interests === 'string'
                ? item.interests
                    .split(',')
                    .map((value: string) => value.trim())
                    .filter(Boolean)
                : Array.isArray(item.interests)
                  ? item.interests
                  : [];

            return normalizeChild({
              id: String(item.id),
              parentId: user.id,
              name: item.name || 'Ребенок',
              age: Number(item.age || 10),
              ageCategory: item.age_category || 'child',
              interests: parsedInterests,
              talentProfile:
                item.talent_profile && typeof item.talent_profile === 'object'
                  ? (item.talent_profile as Diagnostic)
                  : undefined,
            });
          });
        }
      }

      // Fall back to auth user data if no remote profile
      if (!nextProfile) {
        nextProfile = {
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
        };
      }

      setParentProfile(nextProfile);
      setChildrenProfile(nextChildren);
      setActiveChildId((current) => {
        if (current && nextChildren.some((child) => child.id === current)) {
          return current;
        }
        return nextChildren[0]?.id || null;
      });

      setIsLoading(false);
    };

    loadParentData();
  }, [user, devDataVersion]);

  const updateParentProfile = async (profile: Partial<ParentProfileData>) => {
    if (!user || !parentProfile) return;

    const updatedProfile: ParentProfileData = {
      ...parentProfile,
      ...profile,
    };

    setParentProfile(updatedProfile);

    if (supabase && isSupabaseConfigured && hasRealSession) {
      await supabase.from('parent_profiles').upsert(
        {
          user_id: user.id,
          first_name: updatedProfile.firstName,
          last_name: updatedProfile.lastName || null,
          phone: updatedProfile.phone || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );
    }
  };

  const saveParentProfile = async (profile: ParentProfileData, draftChildren: ChildDraft[]) => {
    if (!user) return;

    const normalizedProfile: ParentProfileData = {
      firstName: profile.firstName.trim() || user.firstName,
      lastName: profile.lastName?.trim() || user.lastName,
      phone: profile.phone?.trim() || user.phone,
      tariff: profile.tariff || parentProfile?.tariff || 'basic',
    };

    const mappedChildren = draftChildren
      .filter((entry) => entry.name.trim() && entry.ageGroup)
      .map((entry) =>
        normalizeChild({
          id: hasRealSession && !isUuid(entry.id) ? createClientUuid() : entry.id,
          parentId: user.id,
          name: entry.name.trim(),
          age: ageGroupToAge(entry.ageGroup),
          ageCategory: ageGroupToCategory(entry.ageGroup),
          interests: [],
          phone: entry.phone?.trim() || undefined,
          qrPin: entry.qrPin || undefined,
          qrPinExpiresAt: entry.qrPinExpiresAt ? entry.qrPinExpiresAt.toISOString() : undefined,
          qrPinOneTimeUse: entry.qrPinOneTimeUse || false,
        }),
      );

    setParentProfile(normalizedProfile);
    setChildrenProfile(mappedChildren);
    setActiveChildId(mappedChildren[0]?.id || null);

    if (supabase && isSupabaseConfigured && hasRealSession) {
      await supabase.from('parent_profiles').upsert(
        {
          user_id: user.id,
          first_name: normalizedProfile.firstName,
          last_name: normalizedProfile.lastName || null,
          phone: normalizedProfile.phone || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );

      for (const child of mappedChildren) {
        await supabase.from('child_profiles').upsert(
          {
            id: child.id,
            parent_user_id: user.id,
            name: child.name,
            age: child.age,
            age_category: child.ageCategory,
            interests: child.interests,
            talent_profile: child.talentProfile || null,
            phone: child.phone || null,
            qr_pin: child.qrPin || null,
            qr_pin_expires_at: child.qrPinExpiresAt || null,
            qr_pin_one_time_use: child.qrPinOneTimeUse || false,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' },
        );
      }
    }
  };

  const addChild = async (child: Child) => {
    if (!user) return;

    const normalizedChild = normalizeChild({
      ...child,
      id: hasRealSession && !isUuid(child.id) ? createClientUuid() : child.id,
      parentId: user.id,
    });

    const nextChildren = [...childrenProfile, normalizedChild];
    setChildrenProfile(nextChildren);
    setActiveChildId(normalizedChild.id);

    if (supabase && isSupabaseConfigured && hasRealSession) {
      await supabase.from('child_profiles').upsert(
        {
          id: normalizedChild.id,
          parent_user_id: user.id,
          name: normalizedChild.name,
          age: normalizedChild.age,
          age_category: normalizedChild.ageCategory,
          interests: normalizedChild.interests,
          talent_profile: normalizedChild.talentProfile || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      );
    }
  };

  const removeChild = async (childId: string) => {
    const next = childrenProfile.filter((c) => c.id !== childId);
    setChildrenProfile(next);
    if (activeChildId === childId) setActiveChildId(next[0]?.id ?? null);
    if (supabase && isSupabaseConfigured && hasRealSession) {
      await supabase.from('child_profiles').delete().eq('id', childId);
    }
  };

  const updateChild = async (childId: string, patch: Partial<Child>) => {
    const next = childrenProfile.map((c) =>
      c.id === childId ? normalizeChild({ ...c, ...patch }) : c,
    );
    setChildrenProfile(next);
    const updated = next.find((c) => c.id === childId);
    if (supabase && isSupabaseConfigured && hasRealSession && updated) {
      await supabase
        .from('child_profiles')
        .update({
          name: updated.name,
          age: updated.age,
          age_category: updated.ageCategory,
          interests: updated.interests,
          phone: updated.phone || null,
          qr_pin: updated.qrPin || null,
          qr_pin_expires_at: updated.qrPinExpiresAt || null,
          qr_pin_one_time_use: updated.qrPinOneTimeUse || false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', childId);
    }
  };

  const updateChildDiagnostic = async (childId: string, diagnostic: Diagnostic) => {
    const nextChildren = childrenProfile.map((child) => {
      if (child.id === childId) {
        return normalizeChild({ ...child, talentProfile: diagnostic });
      }
      return child;
    });

    setChildrenProfile(nextChildren);

    if (supabase && isSupabaseConfigured && hasRealSession) {
      await supabase
        .from('child_profiles')
        .update({
          talent_profile: diagnostic,
          updated_at: new Date().toISOString(),
        })
        .eq('id', childId);
    }
  };

  const setParentTariff = async (tariff: 'basic' | 'pro') => {
    if (!parentProfile || !user) return;

    const updatedProfile = { ...parentProfile, tariff };
    setParentProfile(updatedProfile);

    if (supabase && isSupabaseConfigured && hasRealSession) {
      await supabase.from('parent_profiles').update({ tariff }).eq('user_id', user.id);
    } else {
      await AsyncStorage.setItem(devTariffKey(user.id), tariff);
    }
  };

  return (
    <ParentDataContext.Provider
      value={{
        parentProfile,
        childrenProfile,
        activeChildId,
        isLoading,
        setActiveChildId,
        addChild,
        removeChild,
        updateChild,
        saveParentProfile,
        updateParentProfile,
        updateChildDiagnostic,
        setParentTariff,
      }}
    >
      {children}
    </ParentDataContext.Provider>
  );
}

export function useParentData() {
  const context = useContext(ParentDataContext);
  if (context === undefined) {
    throw new Error('useParentData must be used within a ParentDataProvider');
  }
  return context;
}
