import { DemoScenario } from "./types";
import { HealthStateGenerator } from "./generators/HealthStateGenerator";
import { MetricSamplers } from "./generators/MetricSamplers";
import { UserRepository } from "@/core/repositories/UserRepository";
import { ProfileRepository } from "@/core/repositories/ProfileRepository";
import { GoalRepository } from "@/core/repositories/GoalRepository";
import { BodyRepository } from "@/core/repositories/BodyRepository";
import { PressureRepository } from "@/core/repositories/PressureRepository";
import { GlucoseRepository } from "@/core/repositories/GlucoseRepository";

/**
 * Orchestrates the generation of demo data for a given scenario.
 * It is responsible for calling the state generator, sampling records,
 * and persisting them through the Repositories.
 */
export class DemoGenerator {
  private userRepo = new UserRepository();
  private profileRepo = new ProfileRepository();
  private goalRepo = new GoalRepository();
  private bodyRepo = new BodyRepository();
  private pressureRepo = new PressureRepository();
  private glucoseRepo = new GlucoseRepository();

  constructor(private scenario: DemoScenario) {}

  public async run(): Promise<void> {
    const userId = this.scenario.user.id;

    console.log(`[DemoGenerator] Starting generation for scenario: ${this.scenario.id}`);

    // 1. Cleanup existing demo data for this user to ensure idempotency
    console.log(`[DemoGenerator] Cleaning up existing records for user: ${userId}`);
    await this.bodyRepo.deleteByUserId(userId);
    await this.pressureRepo.deleteByUserId(userId);
    await this.glucoseRepo.deleteByUserId(userId);

    // 2. Provision or update User, Profile, Goals
    console.log(`[DemoGenerator] Provisioning user profile and goals`);
    await this.userRepo.upsert({
      id: userId,
      email: this.scenario.user.email,
      display_name: this.scenario.user.displayName,
    });

    await this.profileRepo.upsert(userId, {
      heightCm: this.scenario.profile.heightCm,
      dateOfBirth: this.scenario.profile.dateOfBirth,
      sex: this.scenario.profile.sex,
    });

    await this.goalRepo.upsert(userId, {
      targetWeightKg: this.scenario.goals.targetWeightKg,
      targetBodyFatPercent: this.scenario.goals.targetBodyFatPct,
    });

    // 3. Generate Canonical Timeline (Dense state array)
    console.log(`[DemoGenerator] Generating canonical health state timeline...`);
    const stateGenerator = new HealthStateGenerator(this.scenario);
    const timeline = stateGenerator.generate();
    console.log(`[DemoGenerator] Generated ${timeline.length} daily states.`);

    // 4. Sample the timeline to create database records
    console.log(`[DemoGenerator] Sampling metrics from timeline...`);
    const samplers = new MetricSamplers(this.scenario);
    const bodyRecords = samplers.sampleBodyRecords(timeline);
    const pressureRecords = samplers.samplePressureRecords(timeline);
    const glucoseRecords = samplers.sampleGlucoseRecords(timeline);

    console.log(`[DemoGenerator] Sampled: ${bodyRecords.length} body records, ${pressureRecords.length} BP records, ${glucoseRecords.length} glucose records.`);

    // 5. Bulk insert records
    console.log(`[DemoGenerator] Inserting records into database...`);
    await this.bodyRepo.bulkCreate(userId, bodyRecords);
    await this.pressureRepo.bulkCreate(userId, pressureRecords);
    await this.glucoseRepo.bulkCreate(userId, glucoseRecords);

    console.log(`[DemoGenerator] Successfully completed generation for scenario: ${this.scenario.id}`);
  }
}
