// Supabase Configuration
const SUPABASE_URL = "https://your-supabase-url.supabase.co"; // Replace with your Supabase URL
const SUPABASE_KEY = "your-supabase-api-key"; // Replace with your Supabase API Key
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM Elements
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("login-email");
const passwordInput = document.getElementById("login-password");
const loginFeedback = document.getElementById("login-feedback");

// Handle Login Form Submission
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    const { session, error } = await supabase.auth.signIn({ email, password });

    if (error) {
      throw error;
    }

    loginFeedback.textContent = "Login successful!";
    loginFeedback.style.color = "green";
    // Redirect to game page
    window.location.href = "index.html";
  } catch (error) {
    loginFeedback.textContent = `Login failed: ${error.message}`;
    loginFeedback.style.color = "red";
  }
});
