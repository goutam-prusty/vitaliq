"use client";

import { useState, useTransition, useEffect } from "react";
import { Plus } from "lucide-react";
import { LogKind, AppSettings } from "@/lib/types";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { createRecordAction } from "@/lib/actions/records";
import { nowParts } from "@/lib/dates";
import { useToast } from "@/components/toast";

interface LogFormProps {
  settings: AppSettings;
  onSaveSuccess?: () => void;
}

export function LogForm({ settings, onSaveSuccess }: LogFormProps) {
  const [activeTab, setActiveTab] = useState<LogKind>("body");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  // Validation errors from Server Action
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Input states
  const [common, setCommon] = useState({ date: "", time: "", notes: "" });
  const [body, setBody] = useState<any>({ weightKg: "" });
  const [pressure, setPressure] = useState<any>({ systolic: "", diastolic: "" });
  const [glucose, setGlucose] = useState<any>({ glucoseMgDl: "" });

  // Initialize date/time with timezone parts on mount or tab change
  const resetDateTime = () => {
    const parts = nowParts(settings.timezone);
    setCommon({
      date: parts.date,
      time: parts.time,
      notes: "",
    });
    setValidationErrors({});
  };

  useEffect(() => {
    resetDateTime();
  }, [activeTab, settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    // Build correct payload based on active category tab
    let payload: Record<string, any> = {
      date: common.date,
      time: common.time,
      notes: common.notes,
    };

    if (activeTab === "body") {
      payload = {
        ...payload,
        weightKg: body.weightKg ? Number(body.weightKg) : undefined,
        bmi: body.bmi ? Number(body.bmi) : undefined,
        bodyFatPercent: body.bodyFatPercent ? Number(body.bodyFatPercent) : undefined,
        muscleRatePercent: body.muscleRatePercent ? Number(body.muscleRatePercent) : undefined,
        bodyWaterPercent: body.bodyWaterPercent ? Number(body.bodyWaterPercent) : undefined,
        boneMassKg: body.boneMassKg ? Number(body.boneMassKg) : undefined,
        bmrKcal: body.bmrKcal ? Number(body.bmrKcal) : undefined,
        metabolicAge: body.metabolicAge ? Number(body.metabolicAge) : undefined,
        visceralFatPercent: body.visceralFatPercent ? Number(body.visceralFatPercent) : undefined,
        subcutaneousFatPercent: body.subcutaneousFatPercent ? Number(body.subcutaneousFatPercent) : undefined,
        proteinMassKg: body.proteinMassKg ? Number(body.proteinMassKg) : undefined,
        muscleMassKg: body.muscleMassKg ? Number(body.muscleMassKg) : undefined,
        weightWithoutFatKg: body.weightWithoutFatKg ? Number(body.weightWithoutFatKg) : undefined,
        obesityLevel: body.obesityLevel || undefined,
        skeletalMuscleMassKg: body.skeletalMuscleMassKg ? Number(body.skeletalMuscleMassKg) : undefined,
      };
    } else if (activeTab === "pressure") {
      payload = {
        ...payload,
        systolic: pressure.systolic ? Number(pressure.systolic) : undefined,
        diastolic: pressure.diastolic ? Number(pressure.diastolic) : undefined,
        pulse: pressure.pulse ? Number(pressure.pulse) : undefined,
      };
    } else if (activeTab === "glucose") {
      payload = {
        ...payload,
        glucoseMgDl: glucose.glucoseMgDl ? Number(glucose.glucoseMgDl) : undefined,
      };
    }

    startTransition(async () => {
      try {
        const response = await createRecordAction(activeTab, payload);
        if (response.success) {
          toast(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} record saved successfully.`, "success");
          // Clear inputs
          setBody({ weightKg: "" });
          setPressure({ systolic: "", diastolic: "" });
          setGlucose({ glucoseMgDl: "" });
          resetDateTime();

          if (onSaveSuccess) {
            onSaveSuccess();
          }
        } else {
          toast(response.error || "Failed to save record.", "error");
          if (response.validationErrors) {
            setValidationErrors(response.validationErrors);
          }
        }
      } catch (err: any) {
        toast(err.message || "An unexpected error occurred.", "error");
      }
    });
  };

  const getError = (field: string) => {
    return validationErrors[field]?.[0];
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 content-start">
      {/* Category Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-[rgb(var(--border))] rounded-md">
        {(["body", "pressure", "glucose"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md focus-ring transition-colors ${
              activeTab === tab
                ? "bg-[rgb(var(--panel))] text-[rgb(var(--text))]"
                : "text-[rgb(var(--muted))] hover:text-[rgb(var(--text))]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Date & Time Fields */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Date" error={getError("date")}>
          <Input
            type="date"
            value={common.date}
            onChange={(e) => setCommon({ ...common, date: e.target.value })}
            required
            autoFocus
          />
        </Field>
        <Field label="Time" error={getError("time")}>
          <Input
            type="time"
            value={common.time}
            onChange={(e) => setCommon({ ...common, time: e.target.value })}
            required
          />
        </Field>
      </div>

      {/* Measurement specific input fields */}
      {activeTab === "body" && (
        <div className="grid gap-3">
          <Field label="Weight" unit="kg" error={getError("weightKg")}>
            <Input
              type="number"
              step="any"
              value={body.weightKg}
              onChange={(e) => setBody({ ...body, weightKg: e.target.value })}
              required
            />
          </Field>
          
          <div className="grid grid-cols-2 gap-3">
            <Field label="Body Fat" unit="%" error={getError("bodyFatPercent")}>
              <Input
                type="number"
                step="any"
                value={body.bodyFatPercent || ""}
                onChange={(e) => setBody({ ...body, bodyFatPercent: e.target.value })}
              />
            </Field>
            <Field label="Muscle Rate" unit="%" error={getError("muscleRatePercent")}>
              <Input
                type="number"
                step="any"
                value={body.muscleRatePercent || ""}
                onChange={(e) => setBody({ ...body, muscleRatePercent: e.target.value })}
              />
            </Field>
          </div>

          <details className="text-xs text-[rgb(var(--muted))] cursor-pointer group mt-1">
            <summary className="font-semibold text-[rgb(var(--accent))] select-none hover:underline pb-1">
              Show advanced body composition metrics
            </summary>
            <div className="grid grid-cols-2 gap-3 mt-2 pl-1 border-l border-[rgb(var(--border))]">
              <Field label="Body Water" unit="%">
                <Input
                  type="number"
                  step="any"
                  value={body.bodyWaterPercent || ""}
                  onChange={(e) => setBody({ ...body, bodyWaterPercent: e.target.value })}
                />
              </Field>
              <Field label="Bone Mass" unit="kg">
                <Input
                  type="number"
                  step="any"
                  value={body.boneMassKg || ""}
                  onChange={(e) => setBody({ ...body, boneMassKg: e.target.value })}
                />
              </Field>
              <Field label="BMR" unit="kcal">
                <Input
                  type="number"
                  value={body.bmrKcal || ""}
                  onChange={(e) => setBody({ ...body, bmrKcal: e.target.value })}
                />
              </Field>
              <Field label="Metabolic Age">
                <Input
                  type="number"
                  value={body.metabolicAge || ""}
                  onChange={(e) => setBody({ ...body, metabolicAge: e.target.value })}
                />
              </Field>
              <Field label="Visceral Fat" unit="%">
                <Input
                  type="number"
                  step="any"
                  value={body.visceralFatPercent || ""}
                  onChange={(e) => setBody({ ...body, visceralFatPercent: e.target.value })}
                />
              </Field>
              <Field label="Subcutaneous Fat" unit="%">
                <Input
                  type="number"
                  step="any"
                  value={body.subcutaneousFatPercent || ""}
                  onChange={(e) => setBody({ ...body, subcutaneousFatPercent: e.target.value })}
                />
              </Field>
            </div>
          </details>
        </div>
      )}

      {activeTab === "pressure" && (
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Systolic" unit="mmHg" error={getError("systolic")}>
              <Input
                type="number"
                value={pressure.systolic}
                onChange={(e) => setPressure({ ...pressure, systolic: e.target.value })}
                required
              />
            </Field>
            <Field label="Diastolic" unit="mmHg" error={getError("diastolic")}>
              <Input
                type="number"
                value={pressure.diastolic}
                onChange={(e) => setPressure({ ...pressure, diastolic: e.target.value })}
                required
              />
            </Field>
          </div>
          <Field label="Pulse" unit="bpm" error={getError("pulse")}>
            <Input
              type="number"
              value={pressure.pulse || ""}
              onChange={(e) => setPressure({ ...pressure, pulse: e.target.value })}
            />
          </Field>
        </div>
      )}

      {activeTab === "glucose" && (
        <Field label="Blood Glucose" unit="mg/dL" error={getError("glucoseMgDl")}>
          <Input
            type="number"
            value={glucose.glucoseMgDl}
            onChange={(e) => setGlucose({ ...glucose, glucoseMgDl: e.target.value })}
            required
          />
        </Field>
      )}

      {/* Notes Textarea */}
      <Field label="Notes" error={getError("notes")}>
        <Textarea
          value={common.notes}
          onChange={(e) => setCommon({ ...common, notes: e.target.value })}
          placeholder="Optional notes..."
        />
      </Field>

      {/* Action triggers */}
      <Button type="submit" disabled={isPending} className="w-full mt-2">
        {isPending ? (
          <span className="flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" />Saving...</span>
        ) : (
          <span className="flex items-center gap-2"><Plus className="h-4 w-4" />Log {activeTab} record</span>
        )}
      </Button>
    </form>
  );
}

function RefreshCw({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
  );
}
