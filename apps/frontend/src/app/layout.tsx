import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { Providers } from './providers'
import '../styles/globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CMS Web Manager',
  description: 'Content management system for catalog, orders and inventory',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var originalAppendChild = Element.prototype.appendChild;
                  var originalInsertBefore = Element.prototype.insertBefore;
                  var originalRemoveChild = Element.prototype.removeChild;
                  Object.defineProperty(Element.prototype, 'appendChild', {
                    value: function(child) {
                      return originalAppendChild.call(this, child);
                    },
                    writable: true,
                    configurable: true
                  });
                  Object.defineProperty(Element.prototype, 'insertBefore', {
                    value: function(newChild, refChild) {
                      return originalInsertBefore.call(this, newChild, refChild);
                    },
                    writable: true,
                    configurable: true
                  });
                  Object.defineProperty(Element.prototype, 'removeChild', {
                    value: function(child) {
                      return originalRemoveChild.call(this, child);
                    },
                    writable: true,
                    configurable: true
                  });
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${poppins.className} antialiased`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
