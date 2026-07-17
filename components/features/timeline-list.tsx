"use client";

import { useState, useTransition } from "react";
import { Search, Edit, Trash, X, Save, AlertCircle } from "lucide-react";
import { HealthRecord, LogKind, AppSettings } from "@/lib/types";
import { Button, Field, Input, Panel, Select, Textarea } from "@/components/ui";
import { updateRecordAction, deleteRecordAction } from "@/lib/actions/records";
import { fetchTimelineAction } from "@/lib/actions/timeline";
import { displayWeight, displayGlucose } from "@/lib/units";

interface TimelineListProps {
  initialRecords: HealthRecord[];
  initialCursor?: string;
  settings: AppSettings;
}

export function TimelineList({ initialRecords, initialCursor, settings }: TimelineListProps) {
  const [records, setRecords] = useState<HealthRecord[]>(initialRecords);
  const [cursor, setCursor] = useState<string | undefined>(initialCursor);
  const [kindFilter, setKindFilter] = useState<LogKind | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Mutation and inline editing states
  const [editing, setEditing] = useState<HealthRecord | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [deleting, setDeleting] = useState<HealthRecord | null>(null);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Trigger reloading of the timeline when search or category filter updates
  const handleFilterChange = (newKind: LogKind | "all", newSearch: string) => {
    setKindFilter(newKind);
    startTransition(async () => {
      try {
        const result = await fetchTimelineAction({
          limit: 20,
          kind: newKind,
          search: newSearch || undefined,
        });
        setRecords(result.records);
        setCursor(result.nextCursor);
      } catch (err) {
        console.error("Failed to filter timeline:", err);
      }
    });
  };

  const handleLoadMore = () => {
    if (!cursor) return;
    startTransition(async () => {
      try {
        const result = await fetchTimelineAction({
          limit: 20,
          kind: kindFilter,
          search: searchQuery || undefined,
          cursor,
        });
        setRecords((prev) => [...prev, ...result.records]);
        setCursor(result.nextCursor);
      } catch (err) {
        console.error("Failed to load more page:", err);
      }
    });
  };

  const handleStartEdit = (record: HealthRecord) => {
    setEditing(record);
    setMessage("");
    // Seed initial values from record based on kind
    if (record.kind === "body") {
      setEditForm({
        date: record.date,
        time: record.time,
        weightKg: record.weightKg,
        bmi: record.bmi,
        bodyFatPercent: record.bodyFatPercent,
        muscleRatePercent: record.muscleRatePercent,
        bodyWaterPercent: record.bodyWaterPercent,
        boneMassKg: record.boneMassKg,
        bmrKcal: record.bmrKcal,
        metabolicAge: record.metabolicAge,
        visceralFatPercent: record.visceralFatPercent,
        subcutaneousFatPercent: record.subcutaneousFatPercent,
        proteinMassKg: record.proteinMassKg,
        muscleMassKg: record.muscleMassKg,
        weightWithoutFatKg: record.weightWithoutFatKg,
        obesityLevel: record.obesityLevel,
        skeletalMuscleMassKg: record.skeletalMuscleMassKg,
        notes: record.notes || "",
      });
    } else if (record.kind === "pressure") {
      setEditForm({
        date: record.date,
        time: record.time,
        systolic: record.systolic,
        diastolic: record.diastolic,
        pulse: record.pulse,
        notes: record.notes || "",
      });
    } else if (record.kind === "glucose") {
      setEditForm({
        date: record.date,
        time: record.time,
        glucoseMgDl: record.glucoseMgDl,
        notes: record.notes || "",
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setIsSaving(true);
    setMessage("Saving...");
    try {
      const response = await updateRecordAction(editing.kind, editing.id, editForm);
      if (response.success) {
        setMessage("Saved successfully.");
        // Update local state list inline
        setRecords((prev) =>
          prev.map((r) => (r.id === editing.id ? (response.data as HealthRecord) : r))
        );
        setEditing(null);
      } else {
        setMessage(response.error || "Save failed.");
      }
    } catch (err: any) {
      setMessage(err.message || "Save failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRecord = async (record: HealthRecord) => {
    setIsSaving(true);
    try {
      const response = await deleteRecordAction(record.kind, record.id);
      if (response.success) {
        setRecords((prev) => prev.filter((r) => r.id !== record.id));
        setDeleting(null);
      } else {
        alert(response.error || "Failed to delete record.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="grid gap-4 content-start">
        {/* Filters and search inputs */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1">
            {(["all", "body", "pressure", "glucose"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  handleFilterChange(tab, searchQuery);
                }}
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md focus-ring border transition-all ${
                  kindFilter === tab
                    ? "bg-[rgb(var(--accent-soft))] text-[rgb(var(--accent))] border-[rgb(var(--accent))]"
                    : "bg-[rgb(var(--panel))] text-[rgb(var(--muted))] border-[rgb(var(--border))] hover:bg-[rgb(var(--panel-soft))]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative flex items-center max-w-xs w-full bg-[rgb(var(--panel))] rounded-md border border-[rgb(var(--border))]">
            <Search className="absolute left-3 h-4 w-4 text-[rgb(var(--muted))]" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                handleFilterChange(kindFilter, val);
              }}
              className="w-full bg-transparent pl-9 pr-3 py-1.5 text-sm outline-none text-[rgb(var(--text))]"
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery("");
                  handleFilterChange(kindFilter, "");
                }} 
                className="absolute right-3 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Ledger List */}
        <Panel className="p-0 overflow-hidden divide-y divide-[rgb(var(--border))]">
          {records.length === 0 ? (
            <div className="p-8 text-center text-[rgb(var(--muted))]">No records matched filters.</div>
          ) : (
            records.map((record) => (
              <div 
                key={record.id} 
                className={`flex items-start justify-between p-4 transition-colors hover:bg-[rgb(var(--panel-soft))] ${
                  editing?.id === record.id ? "bg-[rgb(var(--panel-soft))]" : ""
                }`}
              >
                <div className="grid gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[rgb(var(--border))] text-[rgb(var(--muted))]">
                      {record.kind}
                    </span>
                    <span className="text-xs font-mono text-[rgb(var(--muted))]">
                      {record.date} {record.time}
                    </span>
                  </div>
                  
                  {/* Format displays based on kind */}
                  <div className="text-sm font-semibold text-[rgb(var(--text))]">
                    {record.kind === "body" && (
                      <span>
                        Weight: {displayWeight(record.weightKg, settings)} | BMI: {record.bmi ?? "--"}{" "}
                        {record.bodyFatPercent && `| Fat: ${record.bodyFatPercent}%`}
                      </span>
                    )}
                    {record.kind === "pressure" && (
                      <span>
                        BP: {record.systolic}/{record.diastolic} mmHg{" "}
                        {record.pulse && `| Pulse: ${record.pulse} bpm`}
                      </span>
                    )}
                    {record.kind === "glucose" && (
                      <span>Glucose: {displayGlucose(record.glucoseMgDl, settings)}</span>
                    )}
                  </div>

                  {record.notes && (
                    <p className="text-xs text-[rgb(var(--muted))] max-w-xl italic mt-1 leading-relaxed">
                      "{record.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(record)}
                    className="p-2 rounded-md hover:bg-[rgb(var(--border))] text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] focus-ring"
                    title="Edit entry"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleting(record)}
                    className="p-2 rounded-md hover:bg-[rgb(var(--border))] text-[rgb(var(--muted))] hover:text-[rgb(var(--danger))] focus-ring"
                    title="Delete entry"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </Panel>

        {/* Load more button */}
        {cursor && (
          <div className="flex justify-center mt-2">
            <Button
              onClick={handleLoadMore}
              disabled={isPending}
              className="text-xs font-semibold px-4 py-2 border border-[rgb(var(--border))] hover:bg-[rgb(var(--panel-soft))]"
            >
              {isPending ? "Loading more..." : "Load More Records"}
            </Button>
          </div>
        )}
      </div>

      {/* Editing & Deleting Slide-over Panels */}
      <div className="grid gap-4 content-start">
        {editing && (
          <Panel className="p-4 border border-[rgb(var(--accent))] relative">
            <button
              onClick={() => setEditing(null)}
              className="absolute top-4 right-4 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))]"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-[rgb(var(--accent))]">
              Edit {editing.kind} entry
            </h3>
            
            <div className="grid gap-3">
              <Field label="Date">
                <Input
                  type="date"
                  value={editForm.date || ""}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                />
              </Field>
              <Field label="Time">
                <Input
                  type="time"
                  value={editForm.time || ""}
                  onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                />
              </Field>

              {editing.kind === "body" && (
                <>
                  <Field label="Weight" unit="kg">
                    <Input
                      type="number"
                      step="any"
                      value={editForm.weightKg ?? ""}
                      onChange={(e) => setEditForm({ ...editForm, weightKg: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </Field>
                  <Field label="Body Fat" unit="%">
                    <Input
                      type="number"
                      step="any"
                      value={editForm.bodyFatPercent ?? ""}
                      onChange={(e) => setEditForm({ ...editForm, bodyFatPercent: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </Field>
                  <Field label="Muscle Rate" unit="%">
                    <Input
                      type="number"
                      step="any"
                      value={editForm.muscleRatePercent ?? ""}
                      onChange={(e) => setEditForm({ ...editForm, muscleRatePercent: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </Field>
                </>
              )}

              {editing.kind === "pressure" && (
                <>
                  <Field label="Systolic" unit="mmHg">
                    <Input
                      type="number"
                      value={editForm.systolic ?? ""}
                      onChange={(e) => setEditForm({ ...editForm, systolic: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </Field>
                  <Field label="Diastolic" unit="mmHg">
                    <Input
                      type="number"
                      value={editForm.diastolic ?? ""}
                      onChange={(e) => setEditForm({ ...editForm, diastolic: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </Field>
                  <Field label="Pulse" unit="bpm">
                    <Input
                      type="number"
                      value={editForm.pulse ?? ""}
                      onChange={(e) => setEditForm({ ...editForm, pulse: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </Field>
                </>
              )}

              {editing.kind === "glucose" && (
                <Field label="Glucose" unit="mg/dL">
                  <Input
                    type="number"
                    value={editForm.glucoseMgDl ?? ""}
                    onChange={(e) => setEditForm({ ...editForm, glucoseMgDl: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </Field>
              )}

              <Field label="Notes">
                <Textarea
                  value={editForm.notes || ""}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                />
              </Field>

              <div className="flex items-center gap-2 mt-2">
                <Button onClick={handleSaveEdit} disabled={isSaving} className="w-full">
                  <Save className="h-4 w-4 mr-2" /> Save
                </Button>
                <button
                  onClick={() => setEditing(null)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-md border border-[rgb(var(--border))] text-[rgb(var(--muted))] hover:bg-[rgb(var(--panel-soft))]"
                >
                  Cancel
                </button>
              </div>
              {message && <span className="text-xs text-[rgb(var(--muted))] mt-1">{message}</span>}
            </div>
          </Panel>
        )}

        {deleting && (
          <Panel className="p-4 border border-[rgb(var(--danger))]">
            <h3 className="font-semibold mb-3 text-sm text-[rgb(var(--danger))] flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" /> Confirm Deletion
            </h3>
            <p className="text-xs text-[rgb(var(--muted))] mb-4 leading-relaxed">
              Are you sure you want to delete this {deleting.kind} record from {deleting.date} {deleting.time}? This action is permanent.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDeleteRecord(deleting)}
                disabled={isSaving}
                className="w-full px-3 py-2 bg-[rgb(var(--danger))] hover:opacity-90 text-white text-xs font-semibold rounded-md transition-opacity"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleting(null)}
                className="w-full px-3 py-2 border border-[rgb(var(--border))] text-[rgb(var(--muted))] hover:bg-[rgb(var(--panel-soft))] text-xs font-semibold rounded-md"
              >
                Cancel
              </button>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
