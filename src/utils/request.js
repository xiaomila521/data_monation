import axios from 'axios'

const request = axios.create({
  timeout: 30000,
})

request.interceptors.response.use(
  async (response) => {
    return response.data ?? response
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default request
