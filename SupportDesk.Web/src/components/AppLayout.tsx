import {
    NavLink,
    Outlet,
    useNavigate,
} from "react-router-dom";

import {
    useAuth,
} from "../contexts/AuthContext";

import {
    canManageUsers,
    canManageCategories,
    canViewDeletedTickets,
} from "../utils/permissions";

function AppLayout() {
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();

    const canManageUserList =
        user
            ? canManageUsers(user.role)
            : false;

    const canManageCategoryList =
        user
            ? canManageCategories(user.role)
            : false;

    const canViewDeletedTicketList =
        user
            ? canViewDeletedTickets(user.role)
            : false;

    const userInitials = user?.name
        ? user.name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) =>
                part.charAt(0).toUpperCase()
            )
            .join("")
        : "SD";

    const roleLabel =
        user?.role === "Admin"
            ? "Administrador"
            : user?.role === "Agent"
                ? "Agente"
                : "Usuario";

    function handleLogout() {
        logoutUser();
        navigate("/login");
    }

    return (
        <div className="app-layout">

            {/* ========================================
                SIDEBAR
                ======================================== */}

            <aside className="sidebar">

                {/* LOGO */}

                <div className="sidebar-brand">
                    <div className="sidebar-logo">
                        SD
                    </div>

                    <div>
                        <h2>
                            SupportDesk
                        </h2>

                        <span>
                            Service Management
                        </span>
                    </div>
                </div>

                {/* ========================================
                    NAVEGACIÓN
                    ======================================== */}

                <nav className="sidebar-navigation">

                    <div className="sidebar-section">

                        <span className="sidebar-section-title">
                            GENERAL
                        </span>

                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) =>
                                isActive
                                    ? "sidebar-link active"
                                    : "sidebar-link"
                            }
                        >
                            <span className="sidebar-link-icon">
                                ◈
                            </span>

                            <span>
                                Dashboard
                            </span>
                        </NavLink>

                    </div>

                    <div className="sidebar-section">

                        <span className="sidebar-section-title">
                            TICKETS
                        </span>

                        <NavLink
                            to="/tickets"
                            end
                            className={({ isActive }) =>
                                isActive
                                    ? "sidebar-link active"
                                    : "sidebar-link"
                            }
                        >
                            <span className="sidebar-link-icon">
                                ▣
                            </span>

                            <span>
                                Tickets
                            </span>
                        </NavLink>

                        <NavLink
                            to="/tickets/create"
                            className={({ isActive }) =>
                                isActive
                                    ? "sidebar-link active"
                                    : "sidebar-link"
                            }
                        >
                            <span className="sidebar-link-icon">
                                ＋
                            </span>

                            <span>
                                Crear ticket
                            </span>
                        </NavLink>

                    </div>

                    <div className="sidebar-section">

                        <span className="sidebar-section-title">
                            CUENTA
                        </span>

                        <NavLink
                            to="/profile"
                            className={({ isActive }) =>
                                isActive
                                    ? "sidebar-link active"
                                    : "sidebar-link"
                            }
                        >
                            <span className="sidebar-link-icon">
                                ◎
                            </span>

                            <span>
                                Mi perfil
                            </span>
                        </NavLink>

                    </div>

                    {(canManageUserList ||
                        canManageCategoryList ||
                        canViewDeletedTicketList) && (

                            <div className="sidebar-section">

                                <span className="sidebar-section-title">
                                    ADMINISTRACIÓN
                                </span>

                                {canManageUserList && (
                                    <NavLink
                                        to="/admin/users"
                                        className={({ isActive }) =>
                                            isActive
                                                ? "sidebar-link active"
                                                : "sidebar-link"
                                        }
                                    >
                                        <span className="sidebar-link-icon">
                                            ♙
                                        </span>

                                        <span>
                                            Usuarios
                                        </span>
                                    </NavLink>
                                )}

                                {canManageCategoryList && (
                                    <NavLink
                                        to="/admin/categories"
                                        className={({ isActive }) =>
                                            isActive
                                                ? "sidebar-link active"
                                                : "sidebar-link"
                                        }
                                    >
                                        <span className="sidebar-link-icon">
                                            ◫
                                        </span>

                                        <span>
                                            Categorías
                                        </span>
                                    </NavLink>
                                )}

                                {canViewDeletedTicketList && (
                                    <NavLink
                                        to="/admin/deleted-tickets"
                                        className={({ isActive }) =>
                                            isActive
                                                ? "sidebar-link active"
                                                : "sidebar-link"
                                        }
                                    >
                                        <span className="sidebar-link-icon">
                                            ♲
                                        </span>

                                        <span>
                                            Tickets eliminados
                                        </span>
                                    </NavLink>
                                )}

                            </div>
                        )}

                </nav>

                {/* ========================================
                    USUARIO
                    ======================================== */}

                <div className="sidebar-user">

                    <div className="sidebar-user-info">

                        <div className="user-avatar">
                            {userInitials}
                        </div>

                        <div className="sidebar-user-text">

                            <strong>
                                {user?.name}
                            </strong>

                            <span>
                                {roleLabel}
                            </span>

                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="logout-button"
                    >
                        <span>
                            ↪
                        </span>

                        Cerrar sesión
                    </button>

                </div>

            </aside>

            {/* ========================================
                CONTENIDO
                ======================================== */}

            <div className="app-content">

                {/* TOPBAR */}

                <header className="topbar">

                    <div className="topbar-title">
                        <strong>
                            SupportDesk
                        </strong>

                        <span>
                            Centro de soporte
                        </span>
                    </div>

                    <div className="topbar-user">

                        <div className="topbar-avatar">
                            {userInitials}
                        </div>

                        <div>
                            <strong>
                                {user?.name}
                            </strong>

                            <span>
                                {roleLabel}
                            </span>
                        </div>

                    </div>

                </header>

                <main className="main-content">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}

export default AppLayout;