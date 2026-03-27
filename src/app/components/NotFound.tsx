import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Home } from "lucide-react";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <Button onClick={() => navigate("/")}>
          <Home className="w-4 h-4 mr-2" />
          Go to Home
        </Button>
      </div>
    </div>
  );
}
