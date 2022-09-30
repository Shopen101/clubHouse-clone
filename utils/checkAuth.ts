import { Axios } from '../core/axios'
import Cookies from 'nookies'

import { GetServerSidePropsContext } from 'next'

import { UserApi } from '../api/UserApi'
import { UserData } from '../pages'

export const checkAuth = async (
  ctx: GetServerSidePropsContext,
): Promise<UserData | null> => {
  try {
    const cookies = Cookies.get(ctx)

    if (cookies.token) {
      Axios.defaults.headers['Authorization'] = 'Bearer ' + cookies.token
    }

    return await UserApi.getMe()
  } catch (error) {
    console.log(error)

    return null
  }
}
