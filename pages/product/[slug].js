import React, { useEffect, useState } from "react";
import {
  Typography,
  Link,
  Grid,
  List,
  ListItem,
  Card,
  Button,
  TextField,
  CircularProgress,
} from "@material-ui/core";
import NextLink from "next/link";
import Image from "next/image";
import Layout from "../../components/Layout";
import useStyles from "../../utils/styles";
import db from "../../utils/db";
import Product from "../../model/Product";
import axios from "axios";
import { useContext } from "react";
import { Store } from "../../utils/Store";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import { getError } from "../../utils/error";
import Rating from "@material-ui/lab/Rating";

const ProductScreen = (props) => {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const classes = useStyles();
  const { product } = props;
  const { userInfo } = state;
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const submitHandler = async (e) => {
    e.preventDefault();
    closeSnackbar();
    setLoading(true);
    try {
      await axios.post(
        `/api/products/${product._id}/reviews`,
        {
          rating,
          comment,
        },
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      fetchReviews();
      setLoading(false);
      enqueueSnackbar("Review submit successfully", { variant: "success" });
    } catch (e) {
      setLoading(false);
      enqueueSnackbar(getError(e), { variant: "error" });
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/api/products/${product._id}/reviews`);
      setReviews(data);
    } catch (e) {
      enqueueSnackbar(getError(e), { variant: "error" });
    }
  };
  useEffect(() => {
    fetchReviews();
  }, []);
  if (!product) {
    return <h1>Product not found</h1>;
  }
  const addToCartHandler = async () => {
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
    <Layout title={product.name} description={product.description}>
      <div className={classes.section}>
        <NextLink href="/">
          <Link>
            <Typography>back to products</Typography>
          </Link>
        </NextLink>
      </div>
      <Grid container spacing={1}>
        <Grid item md={5} xs={12}>
          <Image
            src={product.image}
            alt={product.name}
            width={640}
            height={640}
            layout="responsive"
            priority
          />
        </Grid>
        <Grid item md={3} xs={12}>
          <List>
            <ListItem>
              <Typography component="h1" variant="h1">
                {product.name}
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>Category: {product.category}</Typography>
            </ListItem>
            <ListItem>
              <Typography>Brand: {product.brand}</Typography>
            </ListItem>
            <ListItem>
              <Rating value={product.rating} readOnly></Rating>
              <Link href="#reviews">
                <Typography>({product.numReviews} reviews)</Typography>
              </Link>
            </ListItem>
            <ListItem>
              <Typography>
                Rating: {Math.round(product.rating * 100) / 100} stars (
                {product.numReviews} reviews)
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>Description: {product.description}</Typography>
            </ListItem>
          </List>
        </Grid>
        <Grid item md={3} xs={12}>
          <Card>
            <List>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    Price
                  </Grid>
                  <Grid item xs={6}>
                    ${product.price}
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    Status:
                  </Grid>
                  <Grid item xs={6}>
                    {product.countInStock ? "In stock" : "Unavailable"}
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={addToCartHandler}
                >
                  Add to cart
                </Button>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
      <List>
        <ListItem>
          <Typography variant="h2" id="reviews" name="reviews">
            Customer Reviews
          </Typography>
        </ListItem>
        {reviews.length === 0 && <ListItem>No review</ListItem>}
        {reviews.map((review) => (
          <ListItem key={review._id}>
            <Grid container>
              <Grid item className={classes.reviewItem}>
                <Typography>
                  <strong>{review.name}</strong>
                </Typography>
                <Typography>
                  <strong>{review.createdAt.substring(0, 10)}</strong>
                </Typography>
              </Grid>
              <Grid item>
                <Rating value={review.rating} readOnly></Rating>
                <Typography>{review.comment}</Typography>
              </Grid>
            </Grid>
          </ListItem>
        ))}
        {userInfo ? (
          <ListItem>
            <form onSubmit={submitHandler} className={classes.form}>
              <List>
                <ListItem>
                  <Typography variant="h2">Leave your review</Typography>
                </ListItem>
                <ListItem>
                  <TextField
                    label="Enter comment"
                    name="review"
                    variant="outlined"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    fullWidth
                    multiline
                  ></TextField>
                </ListItem>
                <ListItem>
                  <Rating
                    name="simple-controlled"
                    value={Number(rating)}
                    onChange={(e) => setRating(e.target.value)}
                  ></Rating>
                </ListItem>
                <ListItem>
                  <Button
                    color="primary"
                    fullWidth
                    type="submit"
                    variant="contained"
                  >
                    Submit
                  </Button>
                </ListItem>
                <ListItem>{loading && <CircularProgress />}</ListItem>
              </List>
            </form>
          </ListItem>
        ) : (
          <ListItem>
            <Typography>
              PLease{" "}
              <Link href={`/login?redirect=/product/${product.slug}`}>
                login
              </Link>
              {""}to review
            </Typography>
          </ListItem>
        )}
      </List>
    </Layout>
  );
};

export default ProductScreen;

export async function getServerSideProps(context) {
  const { params } = context;
  const { slug } = params;
  await db.conn();
  const product = await Product.findOne({ slug }, "-reviews").lean();
  await db.disconn();
  return {
    props: {
      product: db.convertDocToString(product),
    },
  };
}
