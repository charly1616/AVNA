import { useState } from "react";
import { useNavigate } from "react-router";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import RegisterForm from "@/features/auth/components/RegisterForm";
import { useAuthStore } from "../store/auth.store.js";

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async ({ name, password, confirmPassword }) => {
    setError("");
    setIsSubmitting(true);
    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      await register({ name, password });
      navigate("/", { replace: true });
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Registration failed";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <RegisterForm onSubmit={handleSubmit} isSubmitting={isSubmitting} error={error} />
    </AuthLayout>
  );
}

export default RegisterPage;
