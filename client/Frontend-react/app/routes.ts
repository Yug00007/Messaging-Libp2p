import { type RouteConfig, index,layout,route } from "@react-router/dev/routes";

export default [
    // index("routes/home.tsx"),
    // layout("./layouts/auth.tsx", [
    //     route("login", "./auth/login.tsx"),
    //     route("register", "./auth/register.tsx"),
    // ]),
    layout("./layouts/MainLayout.tsx", [
        index( "./routes/dashboard.tsx"),
        route("chats", "./routes/chats.tsx"),
    ]),

] satisfies RouteConfig;
