
import Cookies from 'js-cookie';
import '@testing-library/jest-dom';
import { setSessionCookie } from '../../../src/modules/Auth/application/getSessionCookie';
import { getSessionCookie } from '../../../src/modules/Auth/application/setSessionCookie';
import { removeSessionCookie } from '../../../src/modules/Auth/application/deleteSessionCookie';
import {cookieUserData} from './__mocks__/cookieData';

jest.mock('js-cookie', () => ({
  set: jest.fn(),
  get: jest.fn(),
  remove: jest.fn(),
}));

describe('setSessionCookie', () => {
  it('sets the session cookie successfully', () => {
    const userData = {cookieUserData};
    setSessionCookie(userData);

    expect(Cookies.set).toHaveBeenCalledWith('userSession', JSON.stringify(userData), { expires: 1 });
    expect(console.log).toHaveBeenCalledWith('Session cookie set successfully.');
    expect(console.log).toHaveBeenCalledWith(userData);
  });

  it('logs an error if setting the session cookie fails', () => {
    (Cookies.set as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    setSessionCookie({});

    expect(console.error).toHaveBeenCalledWith('Error setting session cookie:', expect.any(Error));
  });
});

describe('getSessionCookie', () => {
  it('retrieves the session cookie successfully', () => {
    const userData = {cookieUserData};
    (Cookies.get as jest.Mock).mockReturnValueOnce(JSON.stringify(userData));

    const result = getSessionCookie();

    expect(Cookies.get).toHaveBeenCalledWith('userSession');
    expect(console.log).toHaveBeenCalledWith('Session cookie retrieved successfully:', userData);
    expect(result).toEqual(userData);
  });

  it('returns null if the session cookie is not present', () => {
    (Cookies.get as jest.Mock).mockReturnValueOnce(null);

    const result = getSessionCookie();

    expect(Cookies.get).toHaveBeenCalledWith('userSession');
    expect(console.log).toHaveBeenCalledWith('Session cookie retrieved successfully:', null);
    expect(result).toBeNull();
  });

  it('logs an error if retrieving the session cookie fails', () => {
    (Cookies.get as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    const result = getSessionCookie();

    expect(console.error).toHaveBeenCalledWith('Error retrieving session cookie:', expect.any(Error));
    expect(result).toBeNull();
  });
});

describe('removeSessionCookie', () => {
  it('removes the session cookie successfully', () => {
    removeSessionCookie();

    expect(Cookies.remove).toHaveBeenCalledWith('userSession');
    expect(console.log).toHaveBeenCalledWith('Session cookie removed successfully.');
  });

  it('logs an error if removing the session cookie fails', () => {
    (Cookies.remove as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    removeSessionCookie();

    expect(console.error).toHaveBeenCalledWith('Error removing session cookie:', expect.any(Error));
  });
});