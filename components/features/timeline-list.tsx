"use client";

import { useState, useTransition, useEffect } from "react";
import { Search, Edit, Trash, X, Save, AlertCircle } from "lucide-react";
import { HealthRecord, LogKind, AppSettings } from "@/lib/types";
import { Button, Field, Input, Panel, Textarea, EmptyState } from "@/components/ui";
import { updateRecordAction, deleteRecordAction } from "@/lib/actions/records";
import { fetchTimelineAction } from "@/lib/actions/timeline";
import { displayWeight, displayGlucose } from "@/lib/units";
import { useToast } from "@/components/toast";

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
  const { toast } = useToast();

  // Mutation and inline editing states
  const [editing, setEditing] = useState<HealthRecord | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [deleting, setDeleting] = useState<HealthRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null);

  // Esc key listener and focus management
  useEffect(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const activeDialog = editing || deleting;
    
    if (activeDialog) {
      if (!triggerEl && typeof document !== "undefined") {
        setTriggerEl(document.activeElement as HTMLElement);
      }
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setEditing(null);
          setDeleting(null);
        }
        
        if (e.key === "Tab" && isMobile) {
          const dialogNode = document.querySelector('[role="dialog"]');
          if (!dialogNode) return;
          
          const focusables = dialogNode.querySelectorAll('button, [href], input, select, textarea, [tabindex="0"]');
          if (focusables.length === 0) return;
          
          const first = focusables[0] as HTMLElement;
          const last = focusables[focusables.length - 1] as HTMLElement;
          
          if (e.shiftKey && document.activeElement === first) {
            last.focus();
            e.preventDefault();
          } else if (!e.shiftKey && document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      };
      
      window.addEventListener("keydown", handleKeyDown);
      
      if (isMobile) {
        setTimeout(() => {
          const dialogNode = document.querySelector('[role="dialog"]');
          const firstInput = dialogNode?.querySelector('input, select, textarea, button') as HTMLElement;
          firstInput?.focus();
        }, 50);
      }
      
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      if (triggerEl) {
        triggerEl.focus();
        setTriggerEl(null);
      }
    }
  }, [editing, deleting, triggerEl]);

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
    try {
      const response = await updateRecordAction(editing.kind, editing.id, editForm);
      if (response.success) {
        toast("Record updated successfully.", "success");
        // Update local state list inline
        setRecords((prev) =>
          prev.map((r) => (r.id === editing.id ? (response.data as HealthRecord) : r))
        );
        setEditing(null);
      } else {
        toast(response.error || "Save failed.", "error");
      }
    } catch (err: any) {
      toast(err.message || "Save failed.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRecord = async (record: HealthRecord) => {
    setIsSaving(true);
    try {
      const response = await deleteRecordAction(record.kind, record.id);
      if (response.success) {
        toast("Record deleted successfully.", "success");
        setRecords((prev) => prev.filter((r) => r.id !== record.id));
        setDeleting(null);
      } else {
        toast(response.error || "Failed to delete record.", "error");
      }
    } catch (err: any) {
      toast(err.message || "Failed to delete.", "error");
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

          <div className="relative flex items-center max-w-xs w-full bg-[rgb(var(--panel))] rounded-md border border-[rgb(var(--border))] focus-within:border-[rgb(var(--accent))] focus-within:ring-1 focus-within:ring-[rgb(var(--accent))] transition-all duration-200">
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
        <Panel variant="none" elevation={1} className="overflow-hidden divide-y divide-[rgb(var(--border))]">
          {records.length === 0 ? (
            <div className="p-8 flex justify-center items-center">
              <EmptyState 
                title="No records match filters" 
                body="Try adjusting your category selection or search keywords." 
                icon={Search}
              />
            </div>
          ) : (
            records.map((record) => (
              <div 
                key={record.id} 
                className={`flex items-start justify-between p-4 transition-all-spring hover:bg-[rgb(var(--panel-soft))]/40 ${
                  editing?.id === record.id ? "bg-[rgb(var(--panel-soft))]/60 border-l-2 border-[rgb(var(--accent))]" : ""
                }`}
              >
                <div className="grid gap-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                      record.kind === "body" 
                        ? "bg-orange-500/5 text-orange-500 border-orange-500/10" 
                        : record.kind === "pressure"
                        ? "bg-sky-500/5 text-sky-500 border-sky-500/10"
                        : "bg-purple-500/5 text-purple-500 border-purple-500/10"
                    }`}>
                      {record.kind}
                    </span>
                    <span className="text-xs font-mono text-[rgb(var(--muted))]" suppressHydrationWarning>
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
                    aria-label={`Edit entry from ${record.date} ${record.time}`}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleting(record)}
                    className="p-2 rounded-md hover:bg-[rgb(var(--border))] text-[rgb(var(--muted))] hover:text-[rgb(var(--danger))] focus-ring"
                    title="Delete entry"
                    aria-label={`Delete entry from ${record.date} ${record.time}`}
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
      <div className="max-md:contents md:grid md:gap-4 md:content-start">
        {editing && (
          <>
            {/* Backdrop overlay for mobile (hidden on desktop) */}
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 md:hidden animate-fade-in" 
              onClick={() => setEditing(null)}
              aria-hidden="true"
            />
            {/* Drawer/Dialog container */}
            <div 
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-dialog-title"
              className="max-md:fixed max-md:bottom-0 max-md:inset-x-0 max-md:z-50 max-md:bg-[rgb(var(--panel))] max-md:border-t max-md:border-[rgb(var(--border))] max-md:rounded-t-2xl max-md:shadow-2xl max-md:p-6 max-md:max-h-[85vh] max-md:overflow-y-auto max-md:animate-slide-up-drawer max-md:pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:relative md:block"
            >
              <Panel elevation={2} variant="compact" className="border-[rgb(var(--accent))] relative max-md:border-none max-md:bg-transparent max-md:p-0 max-md:shadow-none">
                <button
                  onClick={() => setEditing(null)}
                  className="absolute top-4 right-4 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] focus-ring"
                  aria-label="Close edit drawer"
                >
                  <X className="h-4 w-4" />
                </button>
                <h3 id="edit-dialog-title" className="font-semibold mb-4 text-sm uppercase tracking-wider text-[rgb(var(--accent))]">
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
                </div>
              </Panel>
            </div>
          </>
        )}

        {deleting && (
          <>
            {/* Backdrop overlay for mobile (hidden on desktop) */}
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 md:hidden animate-fade-in" 
              onClick={() => setDeleting(null)}
              aria-hidden="true"
            />
            {/* Drawer/Dialog container */}
            <div 
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-dialog-title"
              className="max-md:fixed max-md:bottom-0 max-md:inset-x-0 max-md:z-50 max-md:bg-[rgb(var(--panel))] max-md:border-t max-md:border-[rgb(var(--border))] max-md:rounded-t-2xl max-md:shadow-2xl max-md:p-6 max-md:max-h-[85vh] max-md:overflow-y-auto max-md:animate-slide-up-drawer max-md:pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:relative md:block"
            >
              <Panel elevation={2} variant="compact" className="border-[rgb(var(--danger))] max-md:border-none max-md:bg-transparent max-md:p-0 max-md:shadow-none">
                <h3 id="delete-dialog-title" className="font-semibold mb-3 text-sm text-[rgb(var(--danger))] flex items-center">
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}
