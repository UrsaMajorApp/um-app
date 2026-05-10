import type { UserRole } from '$contexts/AuthContext';
import type { AppHref, AppRouter } from '$types/router';

export const YOUTH_ROLES = new Set<UserRole>(['youth', 'child', 'young-adult']);
const HOME_ROUTE: AppHref = '/(tabs)/home';

export type AppRouteIntent =
  | { name: 'home' }
  | { name: 'profile' }
  | { name: 'chats' }
  | { name: 'calendar' }
  | { name: 'clubs' }
  | { name: 'courseDetails'; courseId: string }
  | { name: 'payments' }
  | { name: 'subscriptionUpsell' }
  | { name: 'parentChildren' }
  | { name: 'parentChildDetails'; childId: string }
  | { name: 'parentMentors' }
  | { name: 'parentReports' }
  | { name: 'mentorStudents' }
  | { name: 'mentorStudentDetails'; studentId: string }
  | { name: 'mentorSessions' }
  | { name: 'mentorWallet' }
  | { name: 'mentorGroups' }
  | { name: 'mentorGroupDetails'; groupId: string }
  | { name: 'mentorLearningPath' }
  | { name: 'orgApplications' }
  | { name: 'orgCourses' }
  | { name: 'orgCourseCreate' }
  | { name: 'orgCourseDetails'; courseId: string }
  | { name: 'orgCourseEdit'; courseId: string }
  | { name: 'orgGroups' }
  | { name: 'orgGroupCreate'; courseId?: string }
  | { name: 'orgGroupDetails'; groupId: string }
  | { name: 'orgGroupEdit'; groupId: string }
  | { name: 'orgGroupAttendance'; groupId: string }
  | { name: 'orgSchedule' }
  | { name: 'orgStaff' }
  | { name: 'orgStaffAdd' }
  | { name: 'orgStaffDetails'; staffId: string }
  | { name: 'orgStudents' }
  | { name: 'orgStudentDetails'; studentId: string }
  | { name: 'orgStudentFeedback'; studentId: string }
  | { name: 'orgTasks' }
  | { name: 'orgTaskCreate' }
  | { name: 'orgVerification' }
  | { name: 'orgWallet' }
  | { name: 'teacherGroups' }
  | { name: 'teacherGroupDetails'; groupId: string }
  | { name: 'teacherJournal'; groupId: string }
  | { name: 'teacherStudentDetails'; studentId: string }
  | { name: 'adminUsers' }
  | { name: 'adminOrganizations' }
  | { name: 'adminBilling' }
  | { name: 'adminSupport' }
  | { name: 'adminSettings' };

export function isYouthRole(role: UserRole) {
  return YOUTH_ROLES.has(role);
}

function canUseYouthDiagnostic(role: UserRole) {
  return role === 'parent' || isYouthRole(role);
}

const tabSectionAccess: Record<string, (role: UserRole) => boolean> = {
  admin: (role) => role === 'admin',
  parent: (role) => role === 'parent',
  youth: isYouthRole,
  mentor: (role) => role === 'mentor',
  organization: (role) => role === 'org',
  teacher: (role) => role === 'teacher',
  chats: (role) => role !== 'child',
  catalog: (role) => role !== 'mentor' && role !== 'org',
};

const profileSectionAccess: Record<string, (role: UserRole) => boolean> = {
  admin: (role) => role === 'admin',
  parent: (role) => role === 'parent',
  organization: (role) => role === 'org',
  mentor: (role) => role === 'mentor',
  teacher: (role) => role === 'teacher',
};

const rootAccess: Record<string, (role: UserRole) => boolean> = {
  parent: (role) => role === 'parent',
  mentor: (role) => role === 'mentor',
  organization: (role) => role === 'org',
  teacher: (role) => role === 'teacher',
};

function canAccessYouthProfileRoute(role: UserRole, screen?: string) {
  if (screen === 'create-profile-child') return role === 'parent';
  if (screen === 'create-profile' || screen === 'create-profile-young-adult') {
    return isYouthRole(role);
  }
  return canUseYouthDiagnostic(role);
}

export function canAccessRouteSegments(role: UserRole, segments: string[]) {
  const root = segments[0];
  const section = segments[1];
  const screen = segments[2];

  if (root === '(tabs)') return tabSectionAccess[section]?.(role) ?? true;

  if (root === 'profile') {
    if (section === 'youth') return canAccessYouthProfileRoute(role, screen);
    return profileSectionAccess[section]?.(role) ?? true;
  }

  return rootAccess[root]?.(role) ?? true;
}

export function getRoleGuardRedirect(role: UserRole, segments: string[]): AppHref | null {
  return canAccessRouteSegments(role, segments) ? null : HOME_ROUTE;
}

function roleRoute(
  role: UserRole | null | undefined,
  allowedRoles: readonly UserRole[],
  href: AppHref,
): AppHref {
  return role && allowedRoles.includes(role) ? href : HOME_ROUTE;
}

export function resolveAppRoute(
  role: UserRole | null | undefined,
  intent: AppRouteIntent,
): AppHref {
  switch (intent.name) {
    case 'home':
      return HOME_ROUTE;
    case 'profile':
      return '/(tabs)/profile';
    case 'chats':
      return role === 'child' ? HOME_ROUTE : '/(tabs)/chats';
    case 'calendar':
      return role === 'parent' ? '/parent/calendar' : '/analytics';
    case 'clubs':
      return role === 'parent' ? '/parent/clubs' : '/catalog';
    case 'courseDetails':
      return role === 'parent'
        ? (`/parent/club/${intent.courseId}` as AppHref)
        : (`/modal/course?id=${intent.courseId}` as AppHref);
    case 'payments':
    case 'subscriptionUpsell':
      return '/profile/common/subscribe';
    case 'parentChildren':
      return roleRoute(role, ['parent'], '/(tabs)/parent/children');
    case 'parentChildDetails':
      return roleRoute(role, ['parent'], `/(tabs)/parent/child/${intent.childId}` as AppHref);
    case 'parentMentors':
      return roleRoute(role, ['parent'], '/parent/mentors');
    case 'parentReports':
      return roleRoute(role, ['parent'], '/(tabs)/parent/reports');
    case 'mentorStudents':
      return roleRoute(role, ['mentor'], '/(tabs)/mentor/students');
    case 'mentorStudentDetails':
      return roleRoute(role, ['mentor'], `/(tabs)/mentor/student/${intent.studentId}` as AppHref);
    case 'mentorSessions':
      return roleRoute(role, ['mentor'], '/(tabs)/mentor/sessions');
    case 'mentorWallet':
      return roleRoute(role, ['mentor'], '/(tabs)/mentor/wallet');
    case 'mentorGroups':
      return roleRoute(role, ['mentor'], '/(tabs)/mentor/groups');
    case 'mentorGroupDetails':
      return roleRoute(role, ['mentor'], `/mentor/group/${intent.groupId}` as AppHref);
    case 'mentorLearningPath':
      return roleRoute(role, ['mentor'], '/(tabs)/mentor/learning-path');
    case 'orgApplications':
      return roleRoute(role, ['org'], '/(tabs)/organization/applications');
    case 'orgCourses':
      return roleRoute(role, ['org'], '/(tabs)/organization/courses');
    case 'orgCourseCreate':
      return roleRoute(role, ['org'], '/organization/course/create');
    case 'orgCourseDetails':
      return roleRoute(role, ['org'], `/organization/course/${intent.courseId}` as AppHref);
    case 'orgCourseEdit':
      return roleRoute(role, ['org'], `/organization/course/${intent.courseId}/edit` as AppHref);
    case 'orgGroups':
      return roleRoute(role, ['org'], '/(tabs)/organization/groups');
    case 'orgGroupCreate':
      return roleRoute(
        role,
        ['org'],
        (intent.courseId
          ? `/organization/group/create?courseId=${intent.courseId}`
          : '/organization/group/create') as AppHref,
      );
    case 'orgGroupDetails':
      return roleRoute(role, ['org'], `/organization/group/${intent.groupId}` as AppHref);
    case 'orgGroupEdit':
      return roleRoute(role, ['org'], `/organization/group/${intent.groupId}/edit` as AppHref);
    case 'orgGroupAttendance':
      return roleRoute(
        role,
        ['org'],
        `/organization/group/${intent.groupId}/attendance` as AppHref,
      );
    case 'orgSchedule':
      return roleRoute(role, ['org'], '/organization/schedule');
    case 'orgStaff':
      return roleRoute(role, ['org'], '/(tabs)/organization/staff');
    case 'orgStaffAdd':
      return roleRoute(role, ['org'], '/organization/staff/add');
    case 'orgStaffDetails':
      return roleRoute(role, ['org'], `/organization/staff/${intent.staffId}` as AppHref);
    case 'orgStudents':
      return roleRoute(role, ['org'], '/(tabs)/organization/students');
    case 'orgStudentDetails':
      return roleRoute(role, ['org'], `/organization/student/${intent.studentId}` as AppHref);
    case 'orgStudentFeedback':
      return roleRoute(
        role,
        ['org'],
        `/organization/student/${intent.studentId}/feedback` as AppHref,
      );
    case 'orgTasks':
      return roleRoute(role, ['org'], '/(tabs)/organization/tasks');
    case 'orgTaskCreate':
      return roleRoute(role, ['org'], '/organization/task/create');
    case 'orgVerification':
      return roleRoute(role, ['org'], '/(tabs)/organization/verification');
    case 'orgWallet':
      return roleRoute(role, ['org'], '/(tabs)/organization/wallet');
    case 'teacherGroups':
      return roleRoute(role, ['teacher'], '/(tabs)/teacher/groups');
    case 'teacherGroupDetails':
      return roleRoute(role, ['teacher'], `/teacher/group/${intent.groupId}` as AppHref);
    case 'teacherJournal':
      return roleRoute(role, ['teacher'], `/teacher/group/${intent.groupId}/journal` as AppHref);
    case 'teacherStudentDetails':
      return roleRoute(role, ['teacher'], `/(tabs)/teacher/student/${intent.studentId}` as AppHref);
    case 'adminUsers':
      return roleRoute(role, ['admin'], '/(tabs)/admin/users');
    case 'adminOrganizations':
      return roleRoute(role, ['admin'], '/(tabs)/admin/organizations');
    case 'adminBilling':
      return roleRoute(role, ['admin'], '/(tabs)/admin/billing');
    case 'adminSupport':
      return roleRoute(role, ['admin'], '/(tabs)/admin/support');
    case 'adminSettings':
      return roleRoute(role, ['admin'], '/(tabs)/admin/settings');
  }
}

export function navigateApp(
  router: AppRouter,
  role: UserRole | null | undefined,
  intent: AppRouteIntent,
) {
  router.push(resolveAppRoute(role, intent));
}
