import { Outlet } from "react-router";
import { Toaster } from "./ui/sonner";

export function Root() {
  return (
    <>
      <Outlet />
      <Toaster position="top-right" richColors />
    </>
  );
}
