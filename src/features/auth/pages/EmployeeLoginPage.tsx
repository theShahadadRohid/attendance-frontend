import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../useAuth";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { normalizeBangladeshPhone } from "../../../utils/phone";

import { LoginLayout } from "../components/LoginLayout";
import { FormError } from "../components/FormError";

import { BsArrowRight } from "react-icons/bs";
import { BiPhone } from "react-icons/bi";
import { FiEye, FiEyeOff } from "react-icons/fi";

export function EmployeeLoginPage() {
  const { loginEmployee } = useAuth();
  const navigate = useNavigate();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      await loginEmployee({
        phoneNumber: normalizeBangladeshPhone(phoneNumber),
        password,
      });

      navigate("/employee/dashboard", { replace: true });
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <LoginLayout
      title="Employee Login"
      description="Sign in to access your attendance account."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Phone number */}
        <div>
          <label
            htmlFor="employee-phone"
            className="mb-2 block text-sm font-semibold text-[#030708]"
          >
            Phone number
          </label>

          <div className="relative">
            <BiPhone
              size={20}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F40026]"
            />

            <input
              id="employee-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="username"
              required
              maxLength={11}
              pattern="01[3-9][0-9]{8}"
              value={phoneNumber}
              onChange={(event) =>
                setPhoneNumber(
                  event.target.value.replace(/\D/g, "").slice(0, 11),
                )
              }
              placeholder="01712345678"
              title="Enter an 11-digit Bangladeshi mobile number."
              className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm text-[#030708] outline-none transition placeholder:text-gray-400 focus:border-[#F40026] focus:ring-4 focus:ring-[#F40026]/10"
            />
          </div>

          <p className="mt-2 text-xs text-[#030708]/45">
            Enter your 11-digit mobile number.
          </p>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="employee-password"
            className="mb-2 block text-sm font-semibold text-[#030708]"
          >
            Password
          </label>

          <div className="relative">
            <input
              id="employee-password"
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
          {isSubmitting ? "Signing in..." : "Sign in as Employee"}

          {!isSubmitting && <BsArrowRight size={18} />}
        </button>
      </form>
    </LoginLayout>
  );
}
