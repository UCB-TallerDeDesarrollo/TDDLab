import Cookies from 'js-cookie';

export const removeSessionCookie = () => {
  try {
    Cookies.remove('userSession');
    console.log('Session cookie removed successfully.');
  } catch (error) {
    console.error('Error removing session cookie:', error);
  }
};