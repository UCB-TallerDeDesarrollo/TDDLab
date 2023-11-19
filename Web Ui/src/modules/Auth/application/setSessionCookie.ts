import Cookies from 'js-cookie';

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

