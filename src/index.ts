// Imports authentication functions and checks token on page load
import { checkTokenAndRedirect } from './auth';

declare const window: Window;

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', checkTokenAndRedirect);
}
