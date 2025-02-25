// components/Sidebar.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WorkflowStepper } from "./WorkflowStepper";
import { useCompanyUrl } from "@/hooks/useCompanyUrl";

// Define jQuery interface
interface JQuery {
  Treeview(action?: string): void;
  length: number;
}

interface TreeviewStatic {
  (action?: string): void;
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
  const { buildUrl } = useCompanyUrl();

  useEffect(() => {
    // Wait for AdminLTE to be loaded
    const initTreeview = () => {
      if (
        typeof window !== "undefined" &&
        window.$ &&
        window.$('[data-widget="treeview"]').length
      ) {
        try {
          // Initialize without any parameters
          window.$('[data-widget="treeview"]').Treeview();

          // Add click handler for backdrop
          document.addEventListener("click", (e) => {
            const target = e.target as HTMLElement;
            const sidebar = document.querySelector(".main-sidebar");
            const burgerMenu = document.querySelector(
              '[data-widget="pushmenu"]'
            );

            // If clicking outside sidebar and burger menu, and sidebar is open
            if (
              document.body.classList.contains("sidebar-open") &&
              !sidebar?.contains(target) &&
              !burgerMenu?.contains(target)
            ) {
              // Trigger click on burger menu to close sidebar
              (burgerMenu as HTMLElement)?.click();
            }
          });
        } catch (error) {
          console.error("Failed to initialize:", error);
          // Retry after a short delay if initialization fails
          setTimeout(initTreeview, 500);
        }
      } else {
        // Retry if AdminLTE is not loaded yet
        setTimeout(initTreeview, 500);
      }
    };

    // Start initialization
    initTreeview();

    // Cleanup
    return () => {
      document.removeEventListener("click", () => {});
    };
  }, []);

  return (
    <>
      {/* Navbar - Update position and z-index */}
      <nav
        className="main-header navbar navbar-expand navbar-dark"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          left: 0,
          zIndex: 1030,
        }}
      >
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
        <div className="flex-grow-1">
          <WorkflowStepper />
        </div>
      </nav>

      {/* Main Sidebar Container - Update position and height */}
      <aside
        className="main-sidebar sidebar-dark-primary elevation-4"
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          overflowY: "auto",
        }}
      >
        {/* Brand Logo */}
        <Link href={buildUrl("/")} className="brand-link">
          <span className="brand-text font-weight-light">Iso50001能耗管理</span>
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
                  href={buildUrl("/energy-ecf")}
                  className={`nav-link ${
                    pathname?.includes("/energy-ecf") ? "active" : ""
                  }`}
                >
                  <i className="nav-icon fas fa-bolt"></i>
                  <p>能源ECF</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  href={buildUrl("/org-energy-usage")}
                  className={`nav-link ${
                    pathname?.includes("/org-energy-usage") ? "active" : ""
                  }`}
                >
                  <i className="nav-icon fas fa-industry"></i>
                  <p>組織能源使用</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  href={buildUrl("/area-settings")}
                  className={`nav-link ${
                    pathname?.includes("/area-settings") ? "active" : ""
                  }`}
                >
                  <i className="nav-icon fas fa-map-marker-alt"></i>
                  <p>場域設定</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  href={buildUrl("/energy-subject-settings")}
                  className={`nav-link ${
                    pathname?.includes("/energy-subject-settings")
                      ? "active"
                      : ""
                  }`}
                >
                  <i className="nav-icon fas fa-layer-group"></i>
                  <p>同類耗能主體設定</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  href={buildUrl("/energy-equipment")}
                  className={`nav-link ${
                    pathname?.includes("/energy-equipment") ? "active" : ""
                  }`}
                >
                  <i className="nav-icon fas fa-clipboard-list"></i>
                  <p>耗能設備一覽表</p>
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  href={buildUrl("/energy-review")}
                  className={`nav-link ${
                    pathname?.includes("/energy-review") ? "active" : ""
                  }`}
                >
                  <i className="nav-icon fas fa-search"></i>
                  <p>能源審查</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  href={buildUrl("/seu")}
                  className={`nav-link ${
                    pathname?.includes("/seu") ? "active" : ""
                  }`}
                >
                  <i className="nav-icon fas fa-chart-line"></i>
                  <p>重大能源使用SEU</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  href={buildUrl("/enb")}
                  className={`nav-link ${
                    pathname?.includes("/enb") ? "active" : ""
                  }`}
                >
                  <i className="nav-icon fas fa-chart-area"></i>
                  <p>EnB能源基線</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  href={buildUrl("/enpi")}
                  className={`nav-link ${
                    pathname?.includes("/enpi") ? "active" : ""
                  }`}
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
