import { Args, Query, Resolver } from '@nestjs/graphql'
import { RetailService } from '../retail_api/retail.service'
import { OrdersResponse, Order } from '../graphql'
import { OrdersFilter } from 'src/retail_api/types'

@Resolver('Orders')
export class OrdersResolver {
  constructor(private retailService: RetailService) { }

  @Query()
  async order(@Args('number') id: string): Promise<Order> {
    return this.retailService.findOrder(id)
  }

  @Query()
  async getOrders(@Args('page') page: number): Promise<OrdersResponse> {
    const filter: OrdersFilter = {
      page,
    }
    const fetchOrders = await this.retailService.orders(filter)
    const response: OrdersResponse = {
      orders: fetchOrders[0],
      pagination: fetchOrders[1]
    }
    
    return response
  }
}
