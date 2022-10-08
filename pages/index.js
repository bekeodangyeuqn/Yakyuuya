import { Grid } from "@material-ui/core";
import { useRouter } from "next/router";
import { useContext } from "react";
import Layout from "../components/Layout";
import Product from "../model/Product";
import db from "../utils/db";
import { Store } from "../utils/Store";
import axios from "axios";
import ProductItem from "../components/ProductItem";

export default function Home(props) {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const { products } = props;
  const addToCartHandler = async (product) => {
    const existItem = state.cart.cartItems.find(
      (item) => item._id === product._id
    );
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      window.alert("Product not available");
      return;
    }
    dispatch({ type: "ADD_CART_ITEM", payload: { ...product, quantity } });
    router.push("/cart");
  };
  return (
    <Layout>
      <div>
        <h1>Products</h1>
        <Grid container spacing={3}>
          {products.map((product) => {
            return (
              <Grid item md={4} key={product.name}>
                <ProductItem
                  product={product}
                  addToCartHandler={addToCartHandler}
                />
              </Grid>
            );
          })}
        </Grid>
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  await db.conn();
  const products = await Product.find({}, "-reviews").lean();
  await db.disconn();
  return {
    props: {
      products: products.map(db.convertDocToString),
    },
  };
}
