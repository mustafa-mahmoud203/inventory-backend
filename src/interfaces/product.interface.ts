interface IProduct {
  name: string;
  price: number;
  quantity: number;
  threshold: number;
  sold?: number;
  imageUrl: string;
}

export default IProduct;
