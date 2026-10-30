import { useState } from "react";
import { useNavigate } from "react-router";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import LoginForm from "@/features/auth/components/LoginForm";
import { useAuthStore } from "../store/auth.store.js";

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async ({ name, password }) => {
    setError("");
    setIsSubmitting(true);
    try {
      await login({ name, password });
      navigate("/", { replace: true });
    } catch (err) {
      const message = err?.response?.data?.message || "Login failed";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <LoginForm onSubmit={handleSubmit} isSubmitting={isSubmitting} error={error} />
    </AuthLayout>
  );
}

export default LoginPage;
