// components/Sidebar.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Define jQuery interface
interface JQuery {
  Treeview(action: string): void;
}

interface TreeviewStatic {
  (action: string): void;
}

interface JQueryStatic {
  (selector: string): JQuery & {
    Treeview: TreeviewStatic;
  };
}

declare global {
  interface Window {
    $: JQueryStatic;
  }
}
const Sidebar = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && window.$) {
      try {
        window.$('[data-widget="treeview"]').Treeview("init");
      } catch (error) {
        console.error("Failed to initialize Treeview:", error);
      }
    }
  }, []);

  return (
    <>
      {/* Navbar */}
      <nav className="main-header navbar navbar-expand navbar-dark">
        <ul className="navbar-nav">
          <li className="nav-item">
            <button
              className="nav-link"
              data-widget="pushmenu"
              role="button"
              suppressHydrationWarning
            >
              <i className="fas fa-bars"></i>
            </button>
          </li>
        </ul>
      </nav>

      {/* Main Sidebar Container */}
      <aside className="main-sidebar sidebar-dark-primary elevation-4">
        {/* Brand Logo */}
        <Link href="/" className="brand-link">
          <span className="brand-text font-weight-light">能耗管理</span>
        </Link>

        {/* Sidebar */}
        <div className="sidebar">
          {/* Sidebar user panel */}
          <div className="user-panel mt-3 pb-3 mb-3 d-flex">
            <div className="user-icon-wrapper">
              <i className="fas fa-user-circle user-icon"></i>
            </div>
            <div className="info">
              <a href="#" className="d-block" suppressHydrationWarning>
                User
              </a>
            </div>
          </div>

          {/* Sidebar Menu */}
          <nav className="mt-2">
            <ul
              className="nav nav-pills nav-sidebar flex-column"
              data-widget="treeview"
              role="menu"
              data-accordion="false"
            >
              <li className="nav-item">
                <Link
                  href="/energy-ecf"
                  className={`nav-link ${
                    pathname === "/energy-ecf" ? "active" : ""
                  }`}
                >
                  <i className="nav-icon fas fa-bolt"></i>
                  <p>能源ECF</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  href="/org-energy-usage"
                  className={`nav-link ${
                    pathname === "/org-energy-usage" ? "active" : ""
                  }`}
                >
                  <i className="nav-icon fas fa-industry"></i>
                  <p>組織能源使用</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  href="/site-settings"
                  className={`nav-link ${
                    pathname === "/site-settings" ? "active" : ""
                  }`}
                >
                  <i className="nav-icon fas fa-map-marker-alt"></i>
                  <p>場域設定</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  href="/energy-equipment"
                  className={`nav-link ${
                    pathname === "/energy-equipment" ? "active" : ""
                  }`}
                >
                  <i className="nav-icon fas fa-clipboard-list"></i>
                  <p>耗能設備一覽表</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  href="/energy-subject-settings"
                  className={`nav-link ${
                    pathname === "/energy-subject-settings" ? "active" : ""
                  }`}
                >
                  <i className="nav-icon fas fa-layer-group"></i>
                  <p>同類耗能主體設定</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  href="/energy-review"
                  className={`nav-link ${
                    pathname === "/energy-review" ? "active" : ""
                  }`}
                >
                  <i className="nav-icon fas fa-search"></i>
                  <p>能源審查</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  href="/seu"
                  className={`nav-link ${pathname === "/seu" ? "active" : ""}`}
                >
                  <i className="nav-icon fas fa-chart-line"></i>
                  <p>重大能源使用SEU</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  href="/enb"
                  className={`nav-link ${pathname === "/enb" ? "active" : ""}`}
                >
                  <i className="nav-icon fas fa-chart-area"></i>
                  <p>EnB能源基線</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  href="/enpi"
                  className={`nav-link ${pathname === "/enpi" ? "active" : ""}`}
                >
                  <i className="nav-icon fas fa-tachometer-alt"></i>
                  <p>EnPI能源績效指標</p>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
