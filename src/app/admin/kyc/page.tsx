"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import tableStyles from "@/components/admin/AdminTable.module.css";
import styles from "./page.module.css";
import {
  MOCK_KYC_APPLICATIONS,
  formatSubmittedDate,
  loadKycApplications,
  saveKycApplications,
  type KycApplication,
} from "@/lib/kycApplications";
import type { KycStatus } from "@/types/kyc";

const STATUS_FILTERS: (KycStatus | "All")[] = [
  "All",
  "pending",
  "verified",
  "rejected",
];

const STATUS_LABEL: Record<KycStatus, string> = {
  not_submitted: "Not submitted",
  pending: "Pending review",
  verified: "Verified",
  rejected: "Rejected",
};

const DOCUMENT_LABEL: Record<KycApplication["documentType"], string> = {
  citizenship: "Citizenship certificate",
  passport: "Passport",
  national_id: "National ID card",
};

export default function AdminKycPage() {
  const [applications, setApplications] = useState<KycApplication[]>(
    MOCK_KYC_APPLICATIONS
  );
  const [statusFilter, setStatusFilter] = useState<KycStatus | "All">("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);

  // Hydrate from local storage so decisions made in a previous session (or
  // by the seller resubmitting on /profile) are reflected here.
  useEffect(() => {
    setApplications(loadKycApplications());
  }, []);

  const rows = useMemo(() => {
    return applications
      .filter((app) => statusFilter === "All" || app.status === statusFilter)
      .sort(
        (a, b) =>
          new Date(b.submittedAt ?? 0).getTime() -
          new Date(a.submittedAt ?? 0).getTime()
      );
  }, [applications, statusFilter]);

  const pendingCount = applications.filter((a) => a.status === "pending").length;

  function toggleExpanded(app: KycApplication) {
    if (expandedId === app.id) {
      setExpandedId(null);
      setNoteDraft("");
      setRejectError(null);
    } else {
      setExpandedId(app.id);
      setNoteDraft(app.note ?? "");
      setRejectError(null);
    }
  }

  function decide(id: string, status: KycStatus) {
    if (status === "rejected" && !noteDraft.trim()) {
      setRejectError("Add a note explaining why this application is being rejected.");
      return;
    }

    // Mocked — no admin/kyc endpoint exists yet, see lib/api.ts::submitKyc
    // for the shape of the real submission this would review. Persisted to
    // local storage so the seller's profile page can show the decision.
    setApplications((prev) => {
      const updated = prev.map((app) =>
        app.id === id ? { ...app, status, note: noteDraft.trim() || undefined } : app
      );
      saveKycApplications(updated);
      return updated;
    });
    setExpandedId(null);
    setNoteDraft("");
    setRejectError(null);
  }

  return (
    <div>
      <AdminPageHeader
        title="KYC review"
        description={`${pendingCount} application${
          pendingCount !== 1 ? "s" : ""
        } waiting on a decision.`}
      />

      <div className={tableStyles.toolbar}>
        <select
          className={tableStyles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as KycStatus | "All")}
        >
          {STATUS_FILTERS.map((status) => (
            <option key={status} value={status}>
              {status === "All" ? "All statuses" : STATUS_LABEL[status]}
            </option>
          ))}
        </select>
      </div>

      <div className={tableStyles.tableWrap}>
        {rows.length === 0 ? (
          <p className={tableStyles.emptyState}>No applications match that filter.</p>
        ) : (
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Document</th>
                <th>Name on document</th>
                <th>Submitted</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((app) => (
                <Fragment key={app.id}>
                  <tr>
                    <td>
                      <div>{app.userName}</div>
                      <div className={tableStyles.muted}>{app.userEmail}</div>
                    </td>
                    <td>
                      <div>{DOCUMENT_LABEL[app.documentType]}</div>
                      <div className={tableStyles.muted}>{app.documentNumber}</div>
                    </td>
                    <td>{app.fullNameOnDocument}</td>
                    <td className={tableStyles.muted}>
                      {formatSubmittedDate(app.submittedAt)}
                    </td>
                    <td>
                      <span
                        className={tableStyles.tag}
                        data-tone={
                          app.status === "verified"
                            ? "accepted"
                            : app.status === "rejected"
                              ? "declined"
                              : undefined
                        }
                      >
                        {STATUS_LABEL[app.status]}
                      </span>
                      {app.note && app.status !== "pending" && (
                        <div className={tableStyles.muted} title={app.note}>
                          {app.note}
                        </div>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={styles.reviewBtn}
                        onClick={() => toggleExpanded(app)}
                      >
                        {expandedId === app.id ? "Close" : "Review"}
                      </button>
                    </td>
                  </tr>

                  {expandedId === app.id && (
                    <tr>
                      <td colSpan={6}>
                        <div className={styles.detailPanel}>
                          <div className={styles.fileRow}>
                            <span className={styles.fileChip}>
                              📎 Front: {app.frontFileName ?? "not provided"}
                            </span>
                            {app.backFileName && (
                              <span className={styles.fileChip}>
                                📎 Back: {app.backFileName}
                              </span>
                            )}
                          </div>
                          <p className={styles.mockNote}>
                            Preview isn&apos;t available in this mock — a real
                            integration would show the uploaded images here.
                          </p>

                          <label className={styles.noteLabel} htmlFor={`note-${app.id}`}>
                            Reviewer note (required to reject)
                          </label>
                          <textarea
                            id={`note-${app.id}`}
                            className={styles.noteInput}
                            rows={2}
                            value={noteDraft}
                            onChange={(e) => {
                              setNoteDraft(e.target.value);
                              if (rejectError) setRejectError(null);
                            }}
                            placeholder="e.g. Name mismatch, please resubmit."
                          />
                          {rejectError && expandedId === app.id && (
                            <p className={styles.rejectError}>{rejectError}</p>
                          )}

                          <div className={styles.decisionRow}>
                            <button
                              type="button"
                              className={styles.rejectBtn}
                              onClick={() => decide(app.id, "rejected")}
                            >
                              Reject
                            </button>
                            <button
                              type="button"
                              className={styles.approveBtn}
                              onClick={() => decide(app.id, "verified")}
                            >
                              Approve
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
