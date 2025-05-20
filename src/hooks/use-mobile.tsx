import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile(): boolean | undefined {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    // Ensure this only runs on the client
    if (typeof window !== 'undefined') {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
      
      const handleChange = () => {
        setIsMobile(mql.matches);
      };
      
      // Set initial state based on current media query status
      handleChange(); 
      
      // Add listener for changes
      try {
        mql.addEventListener('change', handleChange);
      } catch (e) {
        // Fallback for older browsers
        mql.addListener(handleChange);
      }
      
      // Cleanup listener on unmount
      return () => {
        try {
          mql.removeEventListener('change', handleChange);
        } catch (e) {
          mql.removeListener(handleChange);
        }
      };
    }
  }, []); // Empty dependency array ensures this runs once on mount/unmount on client

  return isMobile;
}
