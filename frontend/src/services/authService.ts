import { httpClientWithoutVersion } from './httpClient';
import Cookies from 'js-cookie';

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
  } catch (error) {
    console.log(error);
    throw new Error('Error getting current user');
  }
};

export const login = async (email: string, password: string) => {
  try {
    const response = await httpClientWithoutVersion.post('/users/sign_in', { user: {email, password} });
    const { token } = response.data;
    Cookies.set('token', token);
    return response.data;
  } catch (error: any) {
    if(error.response.status==401) {
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
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  } catch (error: any) {
    throw new Error(error?.response?.data.status.error);
  }
};

export const logout = async () => {
  try {
    const token = Cookies.get('token');
    if (token) {
      await httpClientWithoutVersion.delete('/users/sign_out', {headers: { "Authorization": `Bearer ${token}`}});
      Cookies.remove('token');
    }
  } catch (error) {
    console.log(error);
    throw new Error('Error logging out');
  }
};
