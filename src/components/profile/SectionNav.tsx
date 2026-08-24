"use client";

import styles from "./SectionNav.module.css";

export type ProfileSection = "personal" | "security" | "kyc";

interface SectionNavProps {
  active: ProfileSection;
  onChange: (section: ProfileSection) => void;
  kycBadge?: "pending" | "verified" | "rejected" | null;
}

const SECTIONS: { id: ProfileSection; label: string; hint: string }[] = [
  {
    id: "personal",
    label: "Personal details",
    hint: "Name, email, phone",
  },
  {
    id: "security",
    label: "Password & security",
    hint: "Login credentials",
  },
  {
    id: "kyc",
    label: "KYC verification",
    hint: "Identity documents",
  },
];

export default function SectionNav({ active, onChange, kycBadge }: SectionNavProps) {
  return (
    <nav className={styles.nav}>
      {SECTIONS.map((section) => (
        <button
          key={section.id}
          type="button"
          className={`${styles.item} ${active === section.id ? styles.itemActive : ""}`}
          onClick={() => onChange(section.id)}
        >
          <span className={styles.itemLabel}>
            {section.label}
            {section.id === "kyc" && kycBadge && (
              <span className={`${styles.badge} ${styles[`badge_${kycBadge}`]}`}>
                {kycBadge}
              </span>
            )}
          </span>
          <span className={styles.itemHint}>{section.hint}</span>
        </button>
      ))}
    </nav>
  );
}
