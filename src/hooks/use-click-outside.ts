
import { useEffect, RefObject } from 'react';

/**
 * Hook that executes a callback when a click occurs outside of a specified element
 * @param ref Reference to the element to monitor for outside clicks
 * @param callback Function to call when a click outside occurs
 */
export function useClickOutside(ref: RefObject<HTMLElement>, callback: () => void) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
}
