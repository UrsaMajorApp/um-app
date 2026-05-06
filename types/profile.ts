export type ChildAgeGroup = '6-8' | '9-11' | '12-14' | '15-17';

export type ParentProfileChildDraft = {
  id: string;
  name: string;
  ageGroup: ChildAgeGroup | null;
  hasPhone: boolean | null;
  phone: string;
  qrPin: string | null;
  qrPinExpiresAt: Date | null;
  qrPinOneTimeUse: boolean;
};

export type ApprovalStep = {
  label: string;
  done: boolean;
};
