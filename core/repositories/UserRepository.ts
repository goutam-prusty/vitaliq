import { getSupabaseServer } from "@/lib/database/client";

export interface UserRow {
  id: string; // Clerk userId
  email?: string | null;
  display_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export class UserRepository {
  private getSupabase() {
    return getSupabaseServer();
  }

  async findById(id: string): Promise<UserRow | null> {
    const { data, error } = await this.getSupabase()
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error in UserRepository.findById:", error);
      throw error;
    }
    return data;
  }

  async syncNewUser(user: UserRow): Promise<UserRow> {
    const supabase = this.getSupabase();
    
    // 1. Sync Clerk user into users table
    const { data: newUser, error: userError } = await supabase
      .from("users")
      .upsert({
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (userError) {
      console.error("Error in UserRepository.syncNewUser (users table):", userError);
      throw userError;
    }

    // 2. Provision default preferences
    const { error: prefError } = await supabase
      .from("user_preferences")
      .upsert({
        user_id: user.id,
        weight_unit: "kg",
        height_unit: "cm",
        glucose_unit: "mg/dL",
        timezone: process.env.APP_TIMEZONE || "Asia/Kolkata",
        theme: "system",
      }, { onConflict: "user_id" });

    if (prefError) {
      console.error("Error provisioning user_preferences in sync:", prefError);
    }

    // 3. Provision default empty profile
    const { error: profileError } = await supabase
      .from("user_profiles")
      .upsert({
        user_id: user.id,
      }, { onConflict: "user_id" });

    if (profileError) {
      console.error("Error provisioning user_profiles in sync:", profileError);
    }

    // 4. Provision default empty goals
    const { error: goalError } = await supabase
      .from("user_goals")
      .upsert({
        user_id: user.id,
      }, { onConflict: "user_id" });

    if (goalError) {
      console.error("Error provisioning user_goals in sync:", goalError);
    }

    return newUser;
  }

  async upsert(user: UserRow): Promise<UserRow> {
    const { data: updated, error } = await this.getSupabase()
      .from("users")
      .upsert({
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error in UserRepository.upsert:", error);
      throw error;
    }
    return updated;
  }
}
