
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile(): boolean | undefined {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
      
      const handleChange = () => {
        setIsMobile(mql.matches);
      };
      
      handleChange(); 
      
      try {
        mql.addEventListener('change', handleChange);
      } catch (e) {
        mql.addListener(handleChange);
      }
      
      return () => {
        try {
          mql.removeEventListener('change', handleChange);
        } catch (e) {
          mql.removeListener(handleChange);
        }
      };
    }
  }, []); 

  return isMobile;
}

