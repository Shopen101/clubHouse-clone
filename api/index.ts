import Cookies from 'nookies'
import { GetServerSidePropsContext } from 'next'
import axios from 'axios'
import { UserApi } from './UserApi'
import { RoomApi } from './RoomApi'

type ApiReturnType = ReturnType<typeof UserApi> & ReturnType<typeof RoomApi>

// TODO: Типизировать
export const Api = (ctx: GetServerSidePropsContext): ApiReturnType => {
  const cookies = Cookies.get(ctx)
  const token = cookies.token

  const instance = axios.create({
    baseURL: 'http://localhost:3001',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  })

  return {
    ...UserApi(instance),
    ...RoomApi(instance),
  }
}
