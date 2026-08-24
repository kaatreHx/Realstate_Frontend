"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  CURRENT_SELLER_ID,
  CURRENT_SELLER_NAME,
  createDraftProperty,
  formatPrice,
} from "@/lib/properties";
import type { ListingStatus, PropertyType } from "@/types/property";
import styles from "./ListPropertyForm.module.css";

const PROPERTY_TYPES: PropertyType[] = [
  "House",
  "Apartment",
  "Land",
  "Commercial",
];

const STATUS_OPTIONS: ListingStatus[] = ["For Sale", "For Rent"];

interface FormState {
  title: string;
  address: string;
  city: string;
  price: string;
  beds: string;
  baths: string;
  areaSqm: string;
  type: PropertyType;
  status: ListingStatus;
}

const INITIAL_STATE: FormState = {
  title: "",
  address: "",
  city: "",
  price: "",
  beds: "",
  baths: "",
  areaSqm: "",
  type: "Apartment",
  status: "For Sale",
};

export default function ListPropertyForm() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<null | { title: string; priceLabel: string }>(
    null
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.title.trim()) nextErrors.title = "Give your listing a title.";
    if (!form.address.trim()) nextErrors.address = "Street address is required.";
    if (!form.city.trim()) nextErrors.city = "City is required.";

    const price = Number(form.price);
    if (!form.price.trim() || Number.isNaN(price) || price <= 0) {
      nextErrors.price = "Enter a valid price.";
    }

    const areaSqm = Number(form.areaSqm);
    if (!form.areaSqm.trim() || Number.isNaN(areaSqm) || areaSqm <= 0) {
      nextErrors.areaSqm = "Enter the floor area in m².";
    }

    if (form.beds.trim() && Number.isNaN(Number(form.beds))) {
      nextErrors.beds = "Beds must be a number.";
    }
    if (form.baths.trim() && Number.isNaN(Number(form.baths))) {
      nextErrors.baths = "Baths must be a number.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const draft = createDraftProperty(
        {
          title: form.title.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          price: Number(form.price),
          status: form.status,
          type: form.type,
          beds: form.beds.trim() ? Number(form.beds) : 0,
          baths: form.baths.trim() ? Number(form.baths) : 0,
          areaSqm: Number(form.areaSqm),
        },
        CURRENT_SELLER_ID,
        CURRENT_SELLER_NAME
      );

      // Mocked — no create-listing endpoint exists yet, see
      // lib/properties.ts::createDraftProperty for where the real
      // POST call would go.
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSubmitted({
        title: draft.title,
        priceLabel: formatPrice(draft.price, draft.status),
      });
      setForm(INITIAL_STATE);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className={styles.successCard}>
        <span className={styles.successIcon}>✓</span>
        <h2 className={styles.successTitle}>Listing created</h2>
        <p className={styles.successBody}>
          <strong>{submitted.title}</strong> ({submitted.priceLabel}) is now
          live. Buyers can start sending purchase requests — you&apos;ll see
          them on your listings page.
        </p>
        <div className={styles.successActions}>
          <Link href="/seller/listings" className={styles.primaryLink}>
            View purchase requests
          </Link>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => setSubmitted(null)}
          >
            List another property
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={styles.form}>
      <Input
        label="Listing title"
        placeholder="Riverside two-bed apartment"
        value={form.title}
        onChange={(e) => update("title", e.target.value)}
        error={errors.title}
        required
      />

      <div className={styles.row}>
        <Input
          label="Street address"
          placeholder="12 Willow Court"
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
          error={errors.address}
          required
        />
        <Input
          label="City"
          placeholder="Kathmandu"
          value={form.city}
          onChange={(e) => update("city", e.target.value)}
          error={errors.city}
          required
        />
      </div>

      <div className={styles.row}>
        <div className={styles.selectField}>
          <label className={styles.selectLabel} htmlFor="type">
            Property type
          </label>
          <select
            id="type"
            className={styles.select}
            value={form.type}
            onChange={(e) => update("type", e.target.value as PropertyType)}
          >
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.selectField}>
          <label className={styles.selectLabel} htmlFor="status">
            Listing status
          </label>
          <select
            id="status"
            className={styles.select}
            value={form.status}
            onChange={(e) => update("status", e.target.value as ListingStatus)}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.row}>
        <Input
          label={form.status === "For Rent" ? "Monthly rent (USD)" : "Price (USD)"}
          type="number"
          inputMode="numeric"
          placeholder="185000"
          value={form.price}
          onChange={(e) => update("price", e.target.value)}
          error={errors.price}
          required
        />
        <Input
          label="Floor area (m²)"
          type="number"
          inputMode="numeric"
          placeholder="86"
          value={form.areaSqm}
          onChange={(e) => update("areaSqm", e.target.value)}
          error={errors.areaSqm}
          required
        />
      </div>

      <div className={styles.row}>
        <Input
          label="Bedrooms"
          type="number"
          inputMode="numeric"
          placeholder="2"
          value={form.beds}
          onChange={(e) => update("beds", e.target.value)}
          error={errors.beds}
        />
        <Input
          label="Bathrooms"
          type="number"
          inputMode="numeric"
          placeholder="2"
          value={form.baths}
          onChange={(e) => update("baths", e.target.value)}
          error={errors.baths}
        />
      </div>

      <Button type="submit" isLoading={isSubmitting}>
        List property
      </Button>
    </form>
  );
}
