import { useState } from "react";
import { isSupabaseConfigured, supabase } from "$lib/supabase";

export type OrgVerificationDocKey =
  | "bin_doc"
  | "registration_doc"
  | "license_doc";

type OrgVerificationDocs = Record<OrgVerificationDocKey, boolean>;

type UseOrgVerificationParams = {
  orgId: string | null | undefined;
  refreshOrgProfile: () => Promise<void>;
};

export function useOrgVerification({
  orgId,
  refreshOrgProfile,
}: UseOrgVerificationParams) {
  const [bin, setBin] = useState("");
  const [docs, setDocs] = useState<OrgVerificationDocs>({
    bin_doc: false,
    registration_doc: false,
    license_doc: false,
  });
  const [offerAccepted, setOfferAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const binValid = /^\d{12}$/.test(bin);
  const allDocsUploaded =
    docs.bin_doc && docs.registration_doc && docs.license_doc;
  const canSubmit = binValid && allDocsUploaded && offerAccepted;

  const setFormattedBin = (value: string) => {
    setBin(value.replace(/\D/g, "").slice(0, 12));
  };

  const toggleDoc = (key: OrgVerificationDocKey) => {
    setDocs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleOfferAccepted = () => {
    setOfferAccepted((prev) => !prev);
  };

  const submit = async () => {
    setError(null);
    if (!binValid) {
      setError("БИН должен содержать ровно 12 цифр.");
      return;
    }
    if (!allDocsUploaded) {
      setError("Загрузите все три документа.");
      return;
    }
    if (!offerAccepted) {
      setError("Примите условия публичной оферты.");
      return;
    }
    if (!orgId) {
      setError("Профиль организации не найден.");
      return;
    }

    setSubmitting(true);
    try {
      if (supabase && isSupabaseConfigured) {
        const { error: updateErr } = await supabase
          .from("organizations")
          .update({
            bin,
            bin_doc_url: "uploaded_bin.pdf",
            registration_url: "uploaded_registration.pdf",
            license_url: "uploaded_license.pdf",
            offer_accepted: true,
            status: "ready_for_review",
          })
          .eq("id", orgId);

        if (updateErr) {
          setError(updateErr.message);
          return;
        }
      }

      await refreshOrgProfile();
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    bin,
    setFormattedBin,
    docs,
    offerAccepted,
    submitting,
    error,
    submitted,
    binValid,
    allDocsUploaded,
    canSubmit,
    toggleDoc,
    toggleOfferAccepted,
    submit,
  };
}
