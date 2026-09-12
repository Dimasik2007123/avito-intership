import {
  createRoutesFromElements,
  createBrowserRouter,
  Route,
} from "react-router-dom";

import Layout from "./components/Layout";
import AdDetail from "./pages/AdDetail";
import AdEdit from "./pages/AdEdit";
import AdsList from "./pages/AdsList";
import AdCreate from "./pages/AdCreate";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index={true} element={<AdsList />} />
      <Route path="ads" element={<AdsList />} />
      <Route path="all-ads" element={<AdsList />} />
      <Route path="ads/new" element={<AdCreate />} />
      <Route path="ads/:id" element={<AdDetail />} />
      <Route path="ads/:id/edit" element={<AdEdit />} />
    </Route>,
  ),
);

export default router;
