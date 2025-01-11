let supabase;

(async () => {
  try {
    const response = await fetch("/supabase-config");
    if (!response.ok) {
      throw new Error("Failed to fetch Supabase configuration.");
    }

    const { SUPABASE_URL, SUPABASE_KEY } = await response.json();
    console.log("Supabase configuration received:", { SUPABASE_URL, SUPABASE_KEY });

    // Initialize Supabase client globally
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("Supabase initialized successfully");
  } catch (error) {
    console.error("Error initializing Supabase:", error.message);
  }
})();
