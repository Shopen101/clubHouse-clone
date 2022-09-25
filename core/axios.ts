import axios from 'axios'
import Cookies from 'js-cookie'

const Axios = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    Authorization: 'Bearer ' + Cookies.get('token'),
  },
})

export { Axios }
