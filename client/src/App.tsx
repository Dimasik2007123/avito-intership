import { RouterProvider } from "react-router-dom";
import router from "./routes";
import "./assets/styles/fonts.css";
import "./assets/styles/animations.css";
import "./assets/styles/style.css";

function App() {
  return <RouterProvider router={router} />;
}

export default App;
