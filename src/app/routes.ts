import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { LoginPage } from "./components/LoginPage";
import { EmployeeDashboard } from "./components/EmployeeDashboard";
import { ManagerDashboard } from "./components/ManagerDashboard";
import { StaffDashboard } from "./components/StaffDashboard";
import { CourseSelection } from "./components/CourseSelection";
import { NotFound } from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: LoginPage },
      { path: "employee", Component: EmployeeDashboard },
      { path: "manager", Component: ManagerDashboard },
      { path: "staff", Component: StaffDashboard },
      { path: "select-course", Component: CourseSelection },
      { path: "*", Component: NotFound },
    ],
  },
]);
