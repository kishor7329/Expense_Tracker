import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Homepage from "./Frontend/homepage";
import Navbar from "./Frontend/navbar";
import Footer from "./Frontend/footer";
import Goals from "./Frontend/goals";
import Notes from "./Frontend/notes";
import OAuthCallback from "./pages/OAuthCallback";
import AIAssistant from "./Frontend/AIAssistant";

function AppContent() {
  const location = useLocation();
  const hideFooterPaths = ["/ai-assistant"];
  const shouldHideFooter = hideFooterPaths.includes(location.pathname);

  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
      </Routes>
      {!shouldHideFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
