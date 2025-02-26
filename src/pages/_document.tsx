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
                // Preventative fix for navigation issues
                (function() {
                  // Wait for Next.js to load
                  window.addEventListener('load', function() {
                    // Original history methods
                    var originalPushState = history.pushState;
                    var originalReplaceState = history.replaceState;
                    
                    // Extract company from path
                    function extractCompany(path) {
                      const match = path.match(/\\/([^/]+)\\/iso50001/);
                      return match ? match[1] : '';
                    }
                    
                    // Fix URLs before they're applied
                    function fixUrl(url) {
                      if (!url) return url;
                      
                      // Extract company from current path
                      const company = extractCompany(window.location.pathname);
                      
                      if (company && url.includes('/iso50001/' + company + '/iso50001')) {
                        return url.replace('/iso50001/' + company + '/iso50001', '/' + company + '/iso50001');
                      }
                      
                      // Handle next.js client-side routing that might add /iso50001 prefix
                      if (company && url.startsWith('/iso50001/') && !url.includes('/_next/')) {
                        return '/' + company + url;
                      }
                      
                      return url;
                    }
                    
                    // Override pushState to prevent problematic URLs
                    history.pushState = function(state, title, url) {
                      const fixedUrl = fixUrl(url);
                      return originalPushState.call(history, state, title, fixedUrl);
                    };
                    
                    // Override replaceState to prevent problematic URLs
                    history.replaceState = function(state, title, url) {
                      const fixedUrl = fixUrl(url);
                      return originalReplaceState.call(history, state, title, fixedUrl);
                    };
                    
                    // If we already have a bad URL, fix it once
                    const company = extractCompany(window.location.pathname);
                    if (company && window.location.pathname.includes('/iso50001/' + company + '/iso50001')) {
                      window.location.replace(
                        window.location.pathname.replace(
                          '/iso50001/' + company + '/iso50001', 
                          '/' + company + '/iso50001'
                        )
                      );
                    }
                    
                    // Also patch Next.js router if available
                    if (window.__NEXT_DATA__ && window.__NEXT_DATA__.props && window.__NEXT_DATA__.props.pageProps) {
                      // Mark that we've applied our fix
                      window.__NEXT_DATA__.patchedRouter = true;
                    }
                  });
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
