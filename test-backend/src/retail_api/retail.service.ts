import { Injectable } from '@nestjs/common'
import { CrmType, Order, OrdersFilter, RetailPagination } from './types'
import axios, { AxiosInstance } from 'axios'
import { ConcurrencyManager } from 'axios-concurrency'
import { serialize } from '../tools'
import { plainToClass } from 'class-transformer'
import { OrdersResponse } from '../graphql'

process.env.RETAIL_KEY="xYBZBsA1vUTKPYwXXJ1XAmbPXQt0ByTc"
process.env.RETAIL_URL="https://example.retailcrm.ru"

@Injectable()
export class RetailService {
  private readonly axios: AxiosInstance

  constructor() {

    this.axios = axios.create({
      baseURL: `${process.env.RETAIL_URL}/api/v5`,
      timeout: 10000,
      headers: {
        'X-API-KEY': process.env.RETAIL_KEY
      },
    })

    this.axios.interceptors.request.use((config) => {
      //console.log(config.url)
      return config
    })
    this.axios.interceptors.response.use(
      (r) => {
        // console.log("Result:", r.data)
        return r
      },
      (r) => {
        // console.log("Error:", r.response.data)
        return r
      },
    )
  }

  async orders(filter?: OrdersFilter): Promise<[Order[], RetailPagination]> {
    const params = serialize(filter, '')
 
    const resp = await this.axios.get('/orders?' + params )

    if (!resp.data) throw new Error('RETAIL CRM ERROR')

    const orders = plainToClass(Order, resp.data.orders as Array<any>)
    const pagination: RetailPagination = resp.data.pagination
    return [orders, pagination]
  }

  async findOrder(id: string): Promise<Order | null> {
    const num: number = +id
    const filter: OrdersFilter = {
      filter: {
        ids: [num]
      }
    }
    const params = serialize(filter, '')

    const resp = await this.axios.get(`/orders?${params}`)
    
    if (!resp.data) throw new Error('RETAIL CRM ERROR')

    const order = plainToClass(Order, resp.data.orders)
    
    return resp.data.orders.length > 0 ? order[0] : null
  }

  async orderStatuses(): Promise<CrmType[]> {
    const res = await this.axios.get('/reference/statuses')
    if (!res.data) throw new Error('RETAIL CRM ERROR')
    const resp =  Object.values(res.data.statuses)
    return resp.map(item => ({
      name: item['name'],
      code: item['code']
    }))
  }

  async productStatuses(): Promise<CrmType[]> {
    const res = await this.axios.get('/reference/product-statuses')
    if (!res.data) throw new Error('RETAIL CRM ERROR')
    const resp =  Object.values(res.data.productStatuses)
    return resp.map(item => ({
      name: item['name'],
      code: item['code']
    }))
  }

  async deliveryTypes(): Promise<CrmType[]> {
    const res = await this.axios.get('/reference/delivery-types')
    if (!res.data) throw new Error('RETAIL CRM ERROR')
    const resp =  Object.values(res.data.deliveryTypes)

    return resp.map(item => {
      return {
        name: item['name'],
        code: item['code']
      }
    })
  }
}
