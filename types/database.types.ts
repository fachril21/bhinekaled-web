// Placeholder — generate ulang file ini pakai Supabase CLI setelah schema
// di-inject ke project Supabase:
//
//   npx supabase gen types typescript --project-id <project-id> > types/database.types.ts
//
// Sampai saat itu, tipe di bawah ini cuma stub supaya import tidak error.

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
