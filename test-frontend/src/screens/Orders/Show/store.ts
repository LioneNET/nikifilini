import { makeAutoObservable } from "mobx";
import { SingleOrder } from "~/screens/Orders/Show/types";
import client from "api/gql";
import { ORDER_QUERY } from "~/screens/Orders/Show/queries";

export default class OrdersShowStore {
  order: SingleOrder | null = null;
  id: string | null = null;
  initialized = false;

  constructor() {
    makeAutoObservable(this);
  }

  setOrder(order: SingleOrder): void {
    this.order = order;
  }
  
  async fetchOrder(id: string) {
    const resp = await client.query(ORDER_QUERY, {number: id}).toPromise();
    this.id = id
    const order = resp.data.order;
    this.setOrder(order);
  }
  
  initialize(id: string) {
    this.fetchOrder(id)
    if (this.initialized) return;
    this.initialized = true;
  }
}
