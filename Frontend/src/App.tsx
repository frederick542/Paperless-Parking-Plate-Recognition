import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Login } from "./routes/login/Login";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import { useVerifyCookie } from "./services/authService";
import { LoadingPage } from "./routes/loading/LoadingPage";
import { useLoading } from "./utils/context/loadingContext";
import { Home } from "./routes/home/Home";

function App() {
  const { loading } = useLoading();

  useVerifyCookie();

  if (loading) {
    return <LoadingPage />;
  }
  return (
    <Router>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>
        <Route path="/" element={<PrivateRoute />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
