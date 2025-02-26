/* eslint-disable @next/next/no-sync-scripts */
// pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="zh-TW">
        <Head>
          {/* Add a script to fix navigation with dynamic company detection */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
    // Fix for Next.js routing issues
    (function() {
      // Fix URLs with problematic paths
      function fixPath(path) {
        if (!path) return path;
        
        // Fix double iso50001 in paths
        return path.replace(/\\/iso50001\\/iso50001\\//g, '/iso50001/');
      }
      
      // Intercept navigation
      if (typeof window !== 'undefined') {
        // Patch pushState and replaceState
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;
        
        history.pushState = function() {
          const args = Array.from(arguments);
          if (typeof args[2] === 'string') {
            args[2] = fixPath(args[2]);
          }
          return originalPushState.apply(this, args);
        };
        
        history.replaceState = function() {
          const args = Array.from(arguments);
          if (typeof args[2] === 'string') {
            args[2] = fixPath(args[2]);
          }
          return originalReplaceState.apply(this, args);
        };
        
        // Listen for URL changes
        window.addEventListener('popstate', function() {
          const currentPath = window.location.pathname;
          if (currentPath.includes('/iso50001/iso50001/')) {
            const fixedPath = fixPath(currentPath);
            if (fixedPath !== currentPath) {
              window.history.replaceState({}, '', fixedPath + window.location.search);
            }
          }
        });
        
        // Fix current URL if needed
        window.addEventListener('load', function() {
          const currentPath = window.location.pathname;
          if (currentPath.includes('/iso50001/iso50001/')) {
            const fixedPath = fixPath(currentPath);
            if (fixedPath !== currentPath) {
              window.history.replaceState({}, '', fixedPath + window.location.search);
            }
          }
        });
      }
    })();
  `,
            }}
          />

          {/* Your existing head content */}
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
          />
          <link
            href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css"
            rel="stylesheet"
          />
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/admin-lte@3.2/dist/css/adminlte.min.css"
          />
        </Head>
        <body className="sidebar-mini">
          <Main />
          <NextScript />
          {/* Your existing scripts */}
          <script
            src="https://code.jquery.com/jquery-3.6.0.min.js"
            integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4="
            crossOrigin="anonymous"
          />
          <script
            src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"
            integrity="sha384-Fy6S3B9q64WdZWQUiU+q4/2Lc9npb8tCaSX9FK7E8HnRr0Jz8D6OP9dO5Vg3Q9ct"
            crossOrigin="anonymous"
          />
          <script src="https://cdn.jsdelivr.net/npm/admin-lte@3.2/dist/js/adminlte.min.js" />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
