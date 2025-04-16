
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Set initial value if window is available (client-side)
    if (typeof window !== "undefined") {
      return window.innerWidth < MOBILE_BREAKPOINT
    }
    return false
  })

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Add event listener for resize with debounce for performance
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    const debouncedHandleResize = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(handleResize, 100)
    }
    
    window.addEventListener("resize", debouncedHandleResize)
    
    // Initial check
    handleResize()
    
    // Cleanup
    return () => {
      window.removeEventListener("resize", debouncedHandleResize)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  return isMobile
}

// Additional helper for specific breakpoints if needed
export function useBreakpoint(breakpoint: number) {
  const [isBelow, setIsBelow] = React.useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < breakpoint
    }
    return false
  })

  React.useEffect(() => {
    const handleResize = () => {
      setIsBelow(window.innerWidth < breakpoint)
    }
    
    window.addEventListener("resize", handleResize)
    handleResize()
    
    return () => window.removeEventListener("resize", handleResize)
  }, [breakpoint])

  return isBelow
}
