import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { 
  Code, 
  BookOpen, 
  Calculator, 
  Atom, 
  TrendingUp, 
  Database, 
  Laptop, 
  BarChart3,
  CheckCircle2
} from "lucide-react";

const courses = [
  { id: "bsc-cs", name: "BSc Computer Science", icon: Code, color: "text-indigo-600", bg: "bg-indigo-50" },
  { id: "bca", name: "BCA", icon: Laptop, color: "text-indigo-600", bg: "bg-indigo-50" },
  { id: "bcom", name: "BCom", icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
  { id: "ba-eco", name: "BA Economics", icon: BarChart3, color: "text-indigo-600", bg: "bg-indigo-50" },
  { id: "bsc-maths", name: "BSc Mathematics", icon: Calculator, color: "text-indigo-600", bg: "bg-indigo-50" },
  { id: "bsc-phy", name: "BSc Physics", icon: Atom, color: "text-indigo-600", bg: "bg-indigo-50" },
  { id: "mca", name: "MCA", icon: Database, color: "text-indigo-600", bg: "bg-indigo-50" },
  { id: "mba", name: "MBA", icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50" },
  { id: "msc-it", name: "MSc IT", icon: Database, color: "text-indigo-600", bg: "bg-indigo-50" },
];

export function CourseSelection() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (courseId: string) => {
    setSelectedId(courseId);
    // Store selected department/course in localStorage
    const course = courses.find(c => c.id === courseId);
    if (course) {
        localStorage.setItem("selectedCourse", course.name);
    }
    
    // Slight delay for animation to be seen
    setTimeout(() => {
      navigate("/employee"); // This is the Student Dashboard route
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl mb-4">
            Welcome to DG VAISHNAV COLLEGE
          </h1>
          <p className="text-xl text-slate-600">
            Please select your Department / Course to continue
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card 
                className={`cursor-pointer transition-all border-2 ${
                  selectedId === course.id 
                    ? "border-indigo-600 shadow-lg bg-indigo-50" 
                    : "border-transparent hover:border-indigo-200 shadow-sm"
                }`}
                onClick={() => handleSelect(course.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl ${course.bg}`}>
                      <course.icon className={`w-8 h-8 ${course.color}`} />
                    </div>
                    {selectedId === course.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-indigo-600"
                      >
                        <CheckCircle2 className="w-6 h-6" />
                      </motion.div>
                    )}
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">{course.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">Department of {course.name.split(' ').slice(1).join(' ')}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <p className="text-slate-500 text-sm">
            Not your department? Please contact the College Admin for assistance.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
