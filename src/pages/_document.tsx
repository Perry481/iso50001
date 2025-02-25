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
              // Fix navigation to maintain correct URL format
              (function() {
                var originalPushState = history.pushState;
                var originalReplaceState = history.replaceState;
                
                // Extract company from path
                function extractCompany(path) {
                  const match = path.match(/\\/([^/]+)\\/iso50001/);
                  return match ? match[1] : '';
                }
                
                // Fix URLs with double iso50001 paths
                function fixUrl(url) {
                  if (!url) return url;
                  
                  // Extract company from current path if available
                  const company = extractCompany(window.location.pathname);
                  
                  if (url.includes('/iso50001/' + company + '/iso50001')) {
                    return url.replace('/iso50001/' + company + '/iso50001', '/' + company + '/iso50001');
                  }
                  return url;
                }
                
                // Override pushState
                history.pushState = function(state, title, url) {
                  return originalPushState.call(history, state, title, fixUrl(url));
                };
                
                // Override replaceState
                history.replaceState = function(state, title, url) {
                  return originalReplaceState.call(history, state, title, fixUrl(url));
                };
                
                // Check current URL and fix if needed
                const company = extractCompany(window.location.pathname);
                if (company && window.location.pathname.includes('/iso50001/' + company + '/iso50001')) {
                  window.location.replace(
                    window.location.pathname.replace(
                      '/iso50001/' + company + '/iso50001', 
                      '/' + company + '/iso50001'
                    )
                  );
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
