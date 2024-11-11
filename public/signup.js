// Supabase Configuration
const SUPABASE_URL = "https://your-supabase-url.supabase.co"; // Replace with your Supabase URL
const SUPABASE_KEY = "your-supabase-api-key"; // Replace with your Supabase API Key
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM Elements
const signupForm = document.getElementById("signup-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signupFeedback = document.getElementById("signup-feedback");

// Handle Sign-Up Form Submission
signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    const { user, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      throw error;
    }

    signupFeedback.textContent = "Sign-up successful! Please check your email to confirm your account.";
    signupFeedback.style.color = "green";
    signupForm.reset();
  } catch (error) {
    signupFeedback.textContent = `Sign-up failed: ${error.message}`;
    signupFeedback.style.color = "red";
  }
});
