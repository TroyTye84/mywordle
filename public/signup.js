import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Fetch Supabase Configuration
async function loadSupabaseConfig() {
  try {
    const response = await fetch("/supabase-config");
    if (!response.ok) {
      throw new Error("Failed to fetch Supabase configuration.");
    }

    const { SUPABASE_URL, SUPABASE_KEY } = await response.json();
    return createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch (error) {
    console.error("Error loading Supabase configuration:", error.message);
    alert("Failed to load Supabase configuration. Please try again later.");
  }
}

// Initialize Supabase
let supabase;
(async () => {
  supabase = await loadSupabaseConfig();
})();

// DOM Elements
const signupForm = document.getElementById("signup-form");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signupFeedback = document.getElementById("signup-feedback");

// Utility to Display Feedback
function displayFeedback(message, isError = false) {
  signupFeedback.textContent = message;
  signupFeedback.style.color = isError ? "red" : "green";
}

// Validate Input Fields
function validateInputs(username, email, password) {
  if (!username || !email || !password) {
    displayFeedback("Username, email, and password are required.", true);
    return false;
  }

  if (password.length < 6) {
    displayFeedback("Password must be at least 6 characters long.", true);
    return false;
  }

  if (username.length < 3) {
    displayFeedback("Username must be at least 3 characters long.", true);
    return false;
  }

  return true;
}

// Handle Sign-Up Form Submission
signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!supabase) {
    displayFeedback("Supabase is not initialized. Please try again later.", true);
    return;
  }

  if (!validateInputs(username, email, password)) {
    return; // Exit if validation fails
  }

  try {
    // Create a new user in the Supabase Auth system
    displayFeedback("Attempting to sign up user...");
    const { user, session, error } = await supabase.auth.signUp({ email, password });

    console.log("Sign-up response:", { user, session, error }); // Debugging

    if (error) {
      throw error;
    }

    if (!user) {
      displayFeedback(
        "Sign-up successful! Please check your email to confirm your account.",
        false
      );
      signupForm.reset();
      return; // Stop further processing until email confirmation is completed
    }

    // Add the username to the `users` table
    const { data, error: insertError } = await supabase
      .from("users")
      .insert([{ id: user.id, username, email }]); // Match `id` with Auth UID

    console.log("Insert response:", data, insertError); // Debugging

    if (insertError) {
      throw insertError;
    }

    displayFeedback(
      "Sign-up successful! Please check your email to confirm your account."
    );
    signupForm.reset();
  } catch (error) {
    console.error("Error during sign-up:", error);
    displayFeedback(`Sign-up failed: ${error.message}`, true);
  }
});
