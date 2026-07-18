import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const isMock = process.env.MOCK_AUTH === "true";

function getTableName(table: any): string {
  if (!table) return "";
  if (typeof table === "string") return table;
  const symbolKey = Object.getOwnPropertySymbols(table).find(sym => sym.toString().includes("drizzle:Name"));
  if (symbolKey) {
    return (table[symbolKey] as string) || "";
  }
  return table?._?.name || "";
}

function getMockDataset(tableName: string, limitVal = 100): any[] {
  if (tableName === "users") {
    return [
      {
        id: "user_3Gf78YL6ntovOyXcyjv1pi2OlEt",
        email: "rajshamani@gmail.com",
        displayName: "Raj Shamani",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }
  
  if (tableName === "user_preferences") {
    return [
      {
        id: "pref-1",
        userId: "user_3Gf78YL6ntovOyXcyjv1pi2OlEt",
        weightUnit: "kg",
        heightUnit: "cm",
        glucoseUnit: "mg/dL",
        timezone: "Asia/Kolkata",
        theme: "system",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }
  
  if (tableName === "user_profiles") {
    return [
      {
        id: "prof-1",
        userId: "user_3Gf78YL6ntovOyXcyjv1pi2OlEt",
        dateOfBirth: "1995-01-01",
        ageFallback: 31,
        sex: "male",
        heightCm: "180.0",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }
  
  if (tableName === "user_goals") {
    return [
      {
        id: "goal-1",
        userId: "user_3Gf78YL6ntovOyXcyjv1pi2OlEt",
        targetWeightKg: "75.0",
        targetBodyFatPct: "14.0",
        targetDate: "2026-12-31",
        goalStartDate: "2026-01-01",
        goalNote: "Goal is to get lean",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }
  
  if (tableName === "body_composition_logs") {
    const records: any[] = [];
    // Generate 31 sequential daily logs
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      records.push({
        id: `body-${i}`,
        userId: "user_3Gf78YL6ntovOyXcyjv1pi2OlEt",
        measuredAt: date,
        weightKg: String(80 - (30 - i) * 0.1),
        bmi: "24.5",
        bodyFatPct: "16.0",
        muscleRatePct: "42.0",
        bodyWaterPct: "55.0",
        boneMassKg: "3.20",
        bmrKcal: 1750,
        metabolicAge: 28,
        visceralFatPct: "8.0",
        subcutaneousFatPct: "12.0",
        proteinMassKg: "14.50",
        muscleMassKg: "64.0",
        weightWithoutFatKg: "67.2",
        obesityLevel: "normal",
        skeletalMuscleMassKg: "34.0",
        notes: i === 0 ? "Latest weight reading notes" : `Cardio day ${30-i}`,
        source: "manual",
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    return records.slice(0, limitVal);
  }
  
  if (tableName === "blood_pressure_logs") {
    const records: any[] = [];
    for (let i = 15; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i * 2);
      records.push({
        id: `bp-${i}`,
        userId: "user_3Gf78YL6ntovOyXcyjv1pi2OlEt",
        measuredAt: date,
        systolic: 120 + (i % 3),
        diastolic: 80 + (i % 2),
        pulse: 72,
        notes: `BP measurement notes ${i}`,
        source: "manual",
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    return records.slice(0, limitVal);
  }
  
  if (tableName === "blood_glucose_logs") {
    const records: any[] = [];
    for (let i = 15; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i * 2);
      records.push({
        id: `glucose-${i}`,
        userId: "user_3Gf78YL6ntovOyXcyjv1pi2OlEt",
        measuredAt: date,
        glucoseMgDl: 95 + (i % 5),
        notes: `Glucose reading notes ${i}`,
        source: "manual",
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    return records.slice(0, limitVal);
  }
  
  return [];
}

function createMockBuilder(tableName: string, limitVal?: number): any {
  const mockPromise = {
    then(onfulfilled: any) {
      const data = getMockDataset(tableName, limitVal);
      return Promise.resolve(onfulfilled(data));
    },
    catch(onrejected: any) {
      return Promise.resolve();
    }
  };

  const proxy: any = new Proxy(mockPromise, {
    get(target, prop) {
      if (prop === "then" || prop === "catch") {
        return (target as any)[prop].bind(target);
      }
      if (prop === "limit") {
        return (limit: number) => createMockBuilder(tableName, limit);
      }
      return () => proxy;
    }
  });

  return proxy;
}

export const db: any = isMock
  ? new Proxy({}, {
      get(target, prop) {
        if (prop === "select") {
          return () => ({
            from: (table: any) => createMockBuilder(getTableName(table))
          });
        }
        if (prop === "insert") {
          return (table: any) => ({
            values: (val: any) => ({
              returning: () => Promise.resolve([Array.isArray(val) ? val[0] : val]),
              onConflictDoUpdate: () => ({
                returning: () => Promise.resolve([Array.isArray(val) ? val[0] : val])
              }),
              onConflictDoNothing: () => Promise.resolve(),
            })
          });
        }
        if (prop === "update") {
          return (table: any) => ({
            set: (val: any) => ({
              where: () => ({
                returning: () => Promise.resolve([val])
              })
            })
          });
        }
        if (prop === "delete") {
          return (table: any) => ({
            where: () => ({
              returning: () => Promise.resolve([{ id: "deleted-id" }]),
              then: (resolve: any) => resolve()
            })
          });
        }
        return () => {};
      }
    })
  : drizzle({ client: neon(process.env.DATABASE_URL!), schema });
