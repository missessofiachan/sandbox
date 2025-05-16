// Entry point for frontend TypeScript
// Imports authentication functions and checks token on page load
import { checkTokenAndRedirect, login } from './auth';

window.addEventListener('DOMContentLoaded', checkTokenAndRedirect);

// Example usage
// login('admin', 'password123');
