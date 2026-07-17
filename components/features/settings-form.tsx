"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { ageFromDateOfBirth } from "@/lib/dates";
import type { AppSettings } from "@/lib/types";
import { Button, Field, Input, Panel, Select, Textarea } from "@/components/ui";
import { updateSettingsAction } from "@/lib/actions/settings";

export function SettingsForm({ initialSettings }: { initialSettings: AppSettings }) {
  const [form, setForm] = useState<AppSettings>(initialSettings);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const age = ageFromDateOfBirth(form.dateOfBirth) ?? form.ageFallback;

  async function handleSave() {
    setIsSaving(true);
    setMessage("Saving...");
    const response = await updateSettingsAction(form);
    setIsSaving(false);
    
    if (response.success) {
      setMessage("Settings saved.");
      setForm(response.data);
    } else {
      setMessage(response.error || "Unable to save settings.");
    }
  }

  return (
    <>
      <Panel className="grid gap-4 p-5 md:grid-cols-2">
        <div className="grid content-start gap-3">
          <h2 className="font-semibold text-lg border-b border-[rgb(var(--border))] pb-1">Profile</h2>
          
          <Field label="Name">
            <Input 
              value={form.name ?? ""} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
            />
          </Field>
          
          <Field label="Date of birth">
            <Input 
              type="date" 
              value={form.dateOfBirth ?? ""} 
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} 
            />
          </Field>
          
          <Field label={form.dateOfBirth ? `Calculated age${age !== undefined ? `: ${age}` : ""}` : "Age fallback"}>
            <Input 
              type="number" 
              value={form.ageFallback ?? ""} 
              onChange={(e) => setForm({ ...form, ageFallback: e.target.value ? Number(e.target.value) : undefined })} 
            />
          </Field>
          
          <Field label="Sex">
            <Select 
              value={form.sex ?? "not_specified"} 
              onChange={(e) => setForm({ ...form, sex: e.target.value as AppSettings["sex"] })}
            >
              <option value="not_specified">Prefer not to specify</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>
          </Field>
          
          <Field label="Height" unit="cm">
            <Input 
              type="number" 
              value={form.heightCm ?? ""} 
              onChange={(e) => setForm({ ...form, heightCm: e.target.value ? Number(e.target.value) : undefined })} 
            />
          </Field>
        </div>

        <div className="grid content-start gap-3">
          <h2 className="font-semibold text-lg border-b border-[rgb(var(--border))] pb-1">Goals</h2>
          
          <Field label="Target weight" unit="kg">
            <Input 
              type="number" 
              step="any" 
              value={form.targetWeightKg ?? ""} 
              onChange={(e) => setForm({
                ...form,
                targetWeightKg: e.target.value ? Number(e.target.value) : undefined
              })} 
            />
          </Field>
          
          <Field label="Target body fat" unit="%">
            <Input 
              type="number" 
              step="any" 
              value={form.targetBodyFatPercent ?? ""} 
              onChange={(e) => setForm({
                ...form,
                targetBodyFatPercent: e.target.value ? Number(e.target.value) : undefined
              })} 
            />
          </Field>
          
          <Field label="Target date">
            <Input 
              type="date" 
              value={form.targetDate ?? ""} 
              onChange={(e) => setForm({
                ...form,
                targetDate: e.target.value
              })} 
            />
          </Field>
          
          <Field label="Goal note">
            <Textarea 
              value={form.goalNote ?? ""} 
              onChange={(e) => setForm({
                ...form,
                goalNote: e.target.value
              })} 
            />
          </Field>
        </div>

        <div className="grid content-start gap-3 md:col-span-2">
          <h2 className="font-semibold text-lg border-b border-[rgb(var(--border))] pb-1">Preferences & Display</h2>
          
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Weight unit">
              <Select 
                value={form.preferredWeightUnit ?? "kg"} 
                onChange={(e) => setForm({
                  ...form,
                  preferredWeightUnit: e.target.value as AppSettings["preferredWeightUnit"]
                })}
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </Select>
            </Field>
            
            <Field label="Height unit">
              <Select 
                value={form.preferredHeightUnit ?? "cm"} 
                onChange={(e) => setForm({
                  ...form,
                  preferredHeightUnit: e.target.value as AppSettings["preferredHeightUnit"]
                })}
              >
                <option value="cm">cm</option>
                <option value="ft-in">ft/in</option>
              </Select>
            </Field>
            
            <Field label="Glucose unit">
              <Select 
                value={form.preferredGlucoseUnit ?? "mg/dL"} 
                onChange={(e) => setForm({
                  ...form,
                  preferredGlucoseUnit: e.target.value as AppSettings["preferredGlucoseUnit"]
                })}
              >
                <option value="mg/dL">mg/dL</option>
                <option value="mmol/L">mmol/L</option>
              </Select>
            </Field>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 mt-2">
            <Field label="Timezone">
              <Input 
                value={form.timezone ?? "Asia/Kolkata"} 
                onChange={(e) => setForm({ ...form, timezone: e.target.value })} 
              />
            </Field>
            
            <Field label="Theme">
              <Select 
                value={form.theme ?? "system"} 
                onChange={(e) => setForm({ ...form, theme: e.target.value as AppSettings["theme"] })}
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </Select>
            </Field>
          </div>
        </div>
      </Panel>

      <div className="flex items-center gap-3 mt-4">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save settings"}
        </Button>
        <span className="text-sm text-[rgb(var(--muted))]">{message}</span>
      </div>
    </>
  );
}
