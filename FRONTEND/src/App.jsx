import { BrowserRouter, Routes, Route } from "react-router-dom";
import InterviewRoom from "./pages/InterviewRoom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Keep your existing routes here */}

        <Route path="/interview/:interviewId" element={<InterviewRoom />}
        />
      </Routes>
    </BrowserRouter>
  );
}