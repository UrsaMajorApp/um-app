import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '$constants/theme';
import { useAuth } from '$contexts/AuthContext';

import MentorProfile from '$app/profile/mentor/index';
import OrgProfile from '$app/profile/organization/index';
import ParentProfile from '$app/profile/parent/index';
import TeacherProfile from '$app/profile/teacher/index';
import YouthProfile from '$app/profile/youth/index';

type Role = 'parent' | 'youth' | 'child' | 'mentor' | 'org' | 'teacher';

export default function ProfileScreenRouter() {
  const { user, isLoading } = useAuth();
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    if (user?.role) {
      setRole(user.role as Role);
    }
  }, [user]);

  if (isLoading || !role) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  switch (role) {
    case 'parent':
      return <ParentProfile />;
    case 'youth':
    case 'child':
      return <YouthProfile />;
    case 'mentor':
      return <MentorProfile />;
    case 'org':
      return <OrgProfile />;
    case 'teacher':
      return <TeacherProfile />;
    default:
      return <ParentProfile />;
  }
}
