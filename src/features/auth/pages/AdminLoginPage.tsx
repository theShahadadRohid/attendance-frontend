import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../useAuth";
import { getErrorMessage } from "../../../utils/getErrorMessage";

import { LoginLayout } from "../components/LoginLayout";
import { FormError } from "../components/FormError";

import { MdEmail } from "react-icons/md";
import { BsArrowRight } from "react-icons/bs";
import { FiEye, FiEyeOff } from "react-icons/fi";

export function AdminLoginPage() {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      await loginAdmin({
        email: email.trim(),
        password,
      });

      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <LoginLayout
      title="Admin Login"
      description="Sign in to manage your attendance system."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <label
            htmlFor="admin-email"
            className="mb-2 block text-sm font-semibold text-[#030708]"
          >
            Email address
          </label>

          <div className="relative">
            <MdEmail
              size={19}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F40026]"
            />

            <input
              id="admin-email"
              type="email"
              inputMode="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) =>
                setEmail(event.target.value.replace(/[^A-Za-z@._+-]/g, ""))
              }
              placeholder="admin@example.com"
              className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm text-[#030708] outline-none transition placeholder:text-gray-400 focus:border-[#F40026] focus:ring-4 focus:ring-[#F40026]/10"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="admin-password"
            className="mb-2 block text-sm font-semibold text-[#030708]"
          >
            Password
          </label>

          <div className="relative">
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 pr-12 text-sm text-[#030708] outline-none transition placeholder:text-gray-400 focus:border-[#F40026] focus:ring-4 focus:ring-[#F40026]/10"
            />

            <button
              type="button"
              onClick={() => setShowPassword((previous) => !previous)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#030708]/40 transition hover:text-[#F40026] focus:outline-none"
            >
              {showPassword ? <FiEyeOff size={19} /> : <FiEye size={19} />}
            </button>
          </div>
        </div>

        <FormError message={error} />

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#F40026] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#F40026]/15 transition hover:bg-[#d90021] focus:outline-none focus:ring-4 focus:ring-[#F40026]/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Sign in as Admin"}

          {!isSubmitting && <BsArrowRight size={18} />}
        </button>
      </form>

      <div className="mt-7 border-t border-gray-100 pt-5 text-center text-sm text-[#030708]/60">
        Employee?
        <Link
          to="/employee/login"
          className="ml-1 font-semibold text-[#F40026] transition hover:text-[#d90021]"
        >
          Employee login
        </Link>
      </div>
    </LoginLayout>
  );
}
