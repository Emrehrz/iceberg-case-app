export interface Agent {
  _id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface Property {
  _id: string;
  title: string;
  address: string;
  type: string;
  price: number;
  listingAgentId: string;
  createdAt: string;
}
