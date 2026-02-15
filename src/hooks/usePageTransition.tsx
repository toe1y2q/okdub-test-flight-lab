import { useLocation } from 'react-router-dom'

export const usePageTransition = () => {
  useLocation() // keep reactivity for future use
  return { isLoading: false }
}
