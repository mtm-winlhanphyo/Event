import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import EventPage from "../pages/Event/EventPage";
import UserPage from "../pages/User/UserPage";
import CreatePage from "../pages/User/CreatePage";
import EditPage from "../pages/User/EditPage";
import LoginPage from "../pages/Login/LoginPage";
import HeaderPage from "../components/Header/HeaderPage";
import RegisterPage from "../pages/Register/RegisterPage";

const AppRouter = () => {
    return (
        <Suspense fallback={<SkeltonLoading />}>
            <Routes>
                <Route path="/admin/header" element={<HeaderPage/>}/>
                <Route path="/admin/register" element={<RegisterPage/>} />
                <Route path="/admin/login" element={<LoginPage/>} />
                <Route path="/admin/events" element={<EventPage/>} />
                <Route path="/admin/users" element={<UserPage/>} />
                <Route path="/admin/create" element={<CreatePage/>} />
                <Route path="/admin/edit/:id" element={<EditPage/>} />
            </Routes>
        </Suspense>
    );
};

const SkeltonLoading = () => {  
    return <></>;
};

export default AppRouter;
