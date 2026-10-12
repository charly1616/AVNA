export function Button({ className = "", variant = "default", ...props }) {
  const variants = {
    default: "theme-button theme-button-primary",
    outline: "theme-button theme-button-secondary",
    ghost: "theme-button theme-button-ghost",
  };

  return (
    <button
      className={`${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export default Button;