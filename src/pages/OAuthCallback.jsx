import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userParam = params.get("user");

    if (token && userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));

        // Ensure avatar_url is properly stored
        console.log("User data received:", userData);

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));

        navigate("/");
        window.location.reload();
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
        color: "white",
      }}
    >
      <h2>Authenticating...</h2>
    </div>
  );
};

export default OAuthCallback;
