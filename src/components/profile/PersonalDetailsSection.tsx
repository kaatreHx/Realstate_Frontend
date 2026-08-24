"use client";

import { FormEvent, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { updateProfile } from "@/lib/api";
import type { UserProfile } from "@/types/profile";
import styles from "./ProfileSection.module.css";

const MOCK_PROFILE: UserProfile = {
  firstName: "Asha",
  lastName: "Gurung",
  email: "asha.gurung@email.com",
  phone: "+977 98-0000-0000",
  bio: "Looking for a two-bed apartment in Kathmandu, ideally near the river.",
};

export default function PersonalDetailsSection() {
  const [profile, setProfile] = useState<UserProfile>(MOCK_PROFILE);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus(null);
    setError(null);

    if (!profile.firstName || !profile.lastName || !profile.email) {
      setError("Name and email can't be empty.");
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile(profile);
      setStatus("Profile updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your changes.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.card} noValidate>
      <h2 className={styles.title}>Personal details</h2>
      <p className={styles.description}>
        This is how agents and other users will see you on Meridian.
      </p>

      <div className={styles.fieldRow}>
        <Input
          label="First name"
          type="text"
          value={profile.firstName}
          onChange={(e) => updateField("firstName", e.target.value)}
          required
        />
        <Input
          label="Last name"
          type="text"
          value={profile.lastName}
          onChange={(e) => updateField("lastName", e.target.value)}
          required
        />
      </div>

      <Input
        label="Email"
        type="email"
        value={profile.email}
        onChange={(e) => updateField("email", e.target.value)}
        required
      />
      <Input
        label="Phone"
        type="text"
        value={profile.phone}
        onChange={(e) => updateField("phone", e.target.value)}
      />

      <div className={styles.field}>
        <label className={styles.label} htmlFor="bio">
          About
        </label>
        <textarea
          id="bio"
          className={styles.textarea}
          rows={3}
          value={profile.bio}
          onChange={(e) => updateField("bio", e.target.value)}
          placeholder="What kind of property are you looking for?"
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {status && <p className={styles.success}>{status}</p>}

      <div className={styles.actions}>
        <Button type="submit" isLoading={isSaving}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
