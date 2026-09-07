import { Routes, Route } from "react-router-dom";
import { UsersListPage, UserDetailPage } from "./pages";
import "./App.css";

export function UsersApp() {
  return (
    <Routes>
      <Route path="/" element={<UsersListPage />} />
      <Route path=":id" element={<UserDetailPage />} />
    </Routes>
  );
}

export default UsersApp;
