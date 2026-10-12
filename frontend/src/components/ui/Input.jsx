export function Input({ className = "", ...props }) {
  return (
    <input
      className={`theme-input ${className}`}
      {...props}
    />
  );
}

export default Input;