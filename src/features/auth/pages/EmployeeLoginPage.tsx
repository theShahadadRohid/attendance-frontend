import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../useAuth";
import LoginLayout from "../components/LoginLayout";
import FormError from "../components/FormError";

import { normalizeBangladeshPhone } from "../../../utils/phone";

import { BsArrowRight } from "react-icons/bs";
import { BiPhone } from "react-icons/bi";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Login failed. Please check your credentials."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export default function EmployeeLoginPage() {
  const { loginEmployee } = useAuth();
  const navigate = useNavigate();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
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
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="employee-phone"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Phone number
          </label>

          <div className="relative">
            <BiPhone
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="employee-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="username"
              required
              maxLength={11}
              pattern="01[3-9][0-9]{8}"
              title="Enter an 11-digit Bangladeshi mobile number."
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="01712345678"
              className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="employee-password"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Password
          </label>

          <input
            id="employee-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <FormError message={error} />

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Sign in as Employee"}
          {!isSubmitting && <BsArrowRight size={17} />}
        </button>
      </form>

      <div className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
        Administrator?
        <Link
          to="/admin/login"
          className="ml-1 font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Admin login
        </Link>
      </div>
    </LoginLayout>
  );
}
