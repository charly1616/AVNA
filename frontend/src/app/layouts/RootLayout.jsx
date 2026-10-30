import { Outlet } from "react-router";

/**
 * Minimal root layout. Feature pages render their own content inside Outlet.
 */
export function RootLayout() {
  return <Outlet />;
}

export default RootLayout;
