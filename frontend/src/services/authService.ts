import axios from 'axios';
import { httpClientWithoutVersion } from './httpClient';
import Cookies from 'js-cookie';

const COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

const getErrorStatus = (error: unknown) => {
  if (axios.isAxiosError(error)) return error.response?.status;
  return undefined;
};

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) return error.response?.data?.status?.error as string | undefined;
  return undefined;
};

export const getCurrentUser = async () => {
  try {
    const token = Cookies.get('token');
    if(token) {
      const response = await httpClientWithoutVersion.get('/users/current_user', {
        headers: {
          Authorization: 'Bearer ' + token
        }
      });
      return response.data;
    }
    return ''
  } catch {
    throw new Error('Error getting current user');
  }
};

export const login = async (email: string, password: string) => {
  try {
    const response = await httpClientWithoutVersion.post('/users/sign_in', { user: {email, password} });
    const { token } = response.data;
    Cookies.set('token', token, COOKIE_OPTIONS);
    return response.data;
  } catch (error) {
    if(getErrorStatus(error) === 401) {
      throw new Error('Email or password is incorrect');
    } else {
      throw new Error("Error logging in");
    }
  }
};

export const register = async (email: string, password: string) => {
  try {
    const response = await httpClientWithoutVersion.post('/users', { user: {email, password} });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error) || 'Error registering user');
  }
};

export const logout = async () => {
  try {
    const token = Cookies.get('token');
    if (token) {
      await httpClientWithoutVersion.delete('/users/sign_out', {headers: { "Authorization": `Bearer ${token}`}});
      Cookies.remove('token');
    }
  } catch {
    throw new Error('Error logging out');
  }
};
