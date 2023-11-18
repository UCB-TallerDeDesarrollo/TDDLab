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

export const removeSessionCookie = () => {
  try {
    Cookies.remove('userSession');
    console.log('Session cookie removed successfully.');
  } catch (error) {
    console.error('Error removing session cookie:', error);
  }
};

export const getSessionCookie = () => {
  try {
    const cookie = Cookies.get('userSession');
    const parsedCookie = cookie ? JSON.parse(cookie) : null;
    console.log('Session cookie retrieved successfully:', parsedCookie);
    return parsedCookie;
  } catch (error) {
    console.error('Error retrieving session cookie:', error);
    return null;
  }
};

