import { DemoScenario, HealthState, Phase, TimelineEvent } from "../types";
import { PRNG } from "../utils/prng";
import { addDays, differenceInDays } from "date-fns";

export class HealthStateGenerator {
  private prng: PRNG;

  constructor(private scenario: DemoScenario) {
    this.prng = new PRNG(scenario.seed);
  }

  public generate(): HealthState[] {
    const states: HealthState[] = [];
    const startDate = new Date(this.scenario.timeline.startDate);
    const endDate = new Date(this.scenario.timeline.endDate);
    const totalDays = Math.max(1, differenceInDays(endDate, startDate));

    for (let day = 0; day <= totalDays; day++) {
      const currentDate = addDays(startDate, day);
      const phase = this.getPhaseForDay(day) || this.scenario.phases[this.scenario.phases.length - 1];
      const activeEvents = this.getActiveEventsForDay(day);

      // Linear interpolation factor within the phase
      const phaseDuration = Math.max(1, phase.endDayOffset - phase.startDayOffset);
      const phaseProgress = Math.max(0, Math.min(1, (day - phase.startDayOffset) / phaseDuration));

      // Base metrics interpolated
      let baseWeight = phase.startMetrics.weightKg + (phase.endMetrics.weightKg - phase.startMetrics.weightKg) * phaseProgress;
      const baseFat = phase.startMetrics.bodyFatPct + (phase.endMetrics.bodyFatPct - phase.startMetrics.bodyFatPct) * phaseProgress;
      let baseStress = phase.startMetrics.stressLevel + (phase.endMetrics.stressLevel - phase.startMetrics.stressLevel) * phaseProgress;
      let baseActivity = phase.startMetrics.activityLevel + (phase.endMetrics.activityLevel - phase.startMetrics.activityLevel) * phaseProgress;

      // Apply event impacts
      let sleepQuality = 7; // Default good sleep
      const hydration = 7; // Default good hydration

      for (const event of activeEvents) {
        if (event.impact.weightOffset) baseWeight += event.impact.weightOffset;
        if (event.impact.stressOffset) baseStress += event.impact.stressOffset;
        if (event.impact.activityOffset) baseActivity += event.impact.activityOffset;
        if (event.impact.sleepQualityOffset) sleepQuality += event.impact.sleepQualityOffset;
      }

      // Add daily noise based on volatility
      let volatilityMultiplier = 1;
      if (phase.volatility === "high") volatilityMultiplier = 2.0;
      if (phase.volatility === "low") volatilityMultiplier = 0.5;

      const weightNoise = this.prng.range(-0.4, 0.4) * volatilityMultiplier;
      const fatNoise = this.prng.range(-0.2, 0.2) * volatilityMultiplier;
      const stressNoise = this.prng.range(-1, 1) * volatilityMultiplier;
      const activityNoise = this.prng.range(-1, 1) * volatilityMultiplier;
      const sleepNoise = this.prng.range(-1, 1) * volatilityMultiplier;
      const hydrationNoise = this.prng.range(-1.5, 1.5) * volatilityMultiplier;

      states.push({
        date: currentDate,
        weightKg: Math.max(40, baseWeight + weightNoise),
        bodyFatPct: Math.max(3, baseFat + fatNoise),
        stressLevel: this.clamp(baseStress + stressNoise, 0, 10),
        activityLevel: this.clamp(baseActivity + activityNoise, 0, 10),
        sleepQuality: this.clamp(sleepQuality + sleepNoise, 0, 10),
        hydration: this.clamp(hydration + hydrationNoise, 0, 10),
        activeEvents,
      });
    }

    return states;
  }

  private getPhaseForDay(dayOffset: number): Phase | undefined {
    return this.scenario.phases.find(
      (p) => dayOffset >= p.startDayOffset && dayOffset <= p.endDayOffset
    );
  }

  private getActiveEventsForDay(dayOffset: number): TimelineEvent[] {
    return this.scenario.events.filter(
      (e) => dayOffset >= e.dayOffset && dayOffset < e.dayOffset + e.durationDays
    );
  }

  private clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
  }
}
