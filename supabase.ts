import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://kasmcuzswsaodmhhcwbe.supabase.co',
    process.env.EXPO_PUBLIC_SUPABASE_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imthc21jdXpzd3Nhb2RtaGhjd2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk3NDcyMDQsImV4cCI6MjAxNTMyMzIwNH0.1mNMUZec2ALYyrzP9qD24hHnC-26wDuh0iAdNI3sgCY', 
    {
        auth: {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        }
    }
);