import Cookies from 'js-cookie';

export const setSessionCookie = (userData: any) => {
  try {
    Cookies.set('userSession', JSON.stringify(userData), { expires: 1 });
    console.log('Session cookie set successfully.');
    console.log(userData);
  } catch (error) {
    console.error('Error setting session cookie:', error);
  }
};