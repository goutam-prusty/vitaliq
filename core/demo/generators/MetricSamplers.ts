import { DemoScenario, HealthState } from "../types";
import { PRNG } from "../utils/prng";

export class MetricSamplers {
  private prng: PRNG;

  constructor(private scenario: DemoScenario) {
    this.prng = new PRNG(scenario.seed + "-samplers");
  }

  public sampleBodyRecords(states: HealthState[]): any[] {
    const records = [];
    const heightM = this.scenario.profile.heightCm / 100;

    for (let i = 0; i < states.length; i++) {
      // Sample every ~3 days
      if (i % 3 === 0) {
        // sometimes skip a day, or add one (simulate user behavior)
        const offset = this.prng.intRange(0, 1);
        if (i + offset >= states.length) continue;
        
        const state = states[i + offset];
        
        // Derive BMI
        const bmi = state.weightKg / (heightM * heightM);
        
        // Very basic approximations for a male/female
        // Fat free mass = Weight - (Weight * BodyFatPct / 100)
        const fatFreeMass = state.weightKg * (1 - state.bodyFatPct / 100);
        const muscleMassKg = fatFreeMass * 0.75 + this.prng.range(-0.5, 0.5); // Approx
        const muscleRatePct = (muscleMassKg / state.weightKg) * 100;
        const bodyWaterPct = (fatFreeMass * 0.73 / state.weightKg) * 100 + this.prng.range(-1, 1);
        const boneMassKg = fatFreeMass * 0.05 + this.prng.range(-0.1, 0.1);
        const proteinMassKg = fatFreeMass * 0.20 + this.prng.range(-0.2, 0.2);
        
        let notes = null;
        // Check if there's a new event starting today
        const startingEvent = state.activeEvents.find(e => {
            const startDayOffset = Math.round((state.date.getTime() - new Date(this.scenario.timeline.startDate).getTime()) / (1000 * 3600 * 24));
            return e.dayOffset === startDayOffset;
        });
        if (startingEvent) notes = startingEvent.note;

        records.push({
          userId: this.scenario.user.id,
          measuredAt: state.date.toISOString(),
          weightKg: Number(state.weightKg.toFixed(1)),
          bmi: Number(bmi.toFixed(1)),
          bodyFatPct: Number(state.bodyFatPct.toFixed(1)),
          muscleRatePct: Number(muscleRatePct.toFixed(1)),
          bodyWaterPct: Number(bodyWaterPct.toFixed(1)),
          boneMassKg: Number(boneMassKg.toFixed(2)),
          proteinMassKg: Number(proteinMassKg.toFixed(2)),
          muscleMassKg: Number(muscleMassKg.toFixed(1)),
          weightWithoutFatKg: Number(fatFreeMass.toFixed(1)),
          source: 'smart_scale',
          notes: notes
        });
      }
    }
    return records;
  }

  public samplePressureRecords(states: HealthState[]): any[] {
    const records = [];

    for (let i = 0; i < states.length; i++) {
      const state = states[i];
      
      // Base BP derived from weight and stress
      // A 80kg person might have 120/80. Let's add (weight - 80) * 0.5 to systolic.
      const systolicBase = 120 + (state.weightKg - 80) * 0.8 + (state.stressLevel - 5) * 1.5;
      const diastolicBase = 80 + (state.weightKg - 80) * 0.5 + (state.stressLevel - 5) * 1.0;
      const pulseBase = 70 + (state.stressLevel - 5) * 2 - (state.activityLevel - 5) * 1.5;

      const systolicNoise = this.prng.range(-3, 3);
      const diastolicNoise = this.prng.range(-2, 2);
      const pulseNoise = this.prng.range(-4, 4);

      let notes = null;
      const startingEvent = state.activeEvents.find(e => {
          const startDayOffset = Math.round((state.date.getTime() - new Date(this.scenario.timeline.startDate).getTime()) / (1000 * 3600 * 24));
          return e.dayOffset === startDayOffset;
      });
      // We only attach note to one record per day to avoid duplication. 
      // We attached it to Body if they coincided, but it's okay to attach to BP as well, or exclusively. Let's just attach if BP is generated.
      if (startingEvent && i % 3 !== 0) notes = startingEvent.note; // Avoid exact same note on Body and BP on the same day if we can help it, though it's fine.

      records.push({
        userId: this.scenario.user.id,
        measuredAt: state.date.toISOString(),
        systolic: Math.round(systolicBase + systolicNoise),
        diastolic: Math.round(diastolicBase + diastolicNoise),
        pulse: Math.round(pulseBase + pulseNoise),
        source: 'bp_monitor',
        notes: notes
      });
    }
    return records;
  }

  public sampleGlucoseRecords(states: HealthState[]): any[] {
    const records = [];

    for (let i = 0; i < states.length; i++) {
      // Sample every ~2 days
      if (i % 2 === 0) {
        const state = states[i];
        
        // Base Glucose derived from weight and stress
        const glucoseBase = 90 + (state.weightKg - 80) * 1.2 + (state.stressLevel - 5) * 1.0 - (state.activityLevel - 5) * 0.5;
        const glucoseNoise = this.prng.range(-4, 4);

        records.push({
          userId: this.scenario.user.id,
          measuredAt: state.date.toISOString(),
          glucoseMgDl: Math.round(glucoseBase + glucoseNoise),
          source: 'glucose_meter'
        });
      }
    }
    return records;
  }
}
