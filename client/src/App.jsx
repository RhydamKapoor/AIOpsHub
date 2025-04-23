import { Routes, Route } from "react-router-dom";
// import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Singup";


function App() {
  return (
    <Routes>
      <Route element={<Navbar />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>
    </Routes>
  );
}

export default App;
