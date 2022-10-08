import {
  Grid,
  Typography,
  List,
  ListItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  Card,
  TableCell,
  Link,
  Button,
  CircularProgress,
} from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import { Store } from "../utils/Store";
import useStyles from "../utils/styles";
import Layout from "../components/Layout";
import NextLink from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import CheckoutWizard from "../components/CheckoutWizard";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import { getError } from "../utils/error";
import axios from "axios";
import Cookies from "js-cookie";

const OrderScreen = () => {
  const classes = useStyles();
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const [loading, setLoading] = useState(false);
  const {
    userInfo,
    cart: { cartItems, shippingAddress, paymentMethod },
  } = state;
  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;
  const itemsPrice = cartItems.reduce(
    (init, item) => init + item.price * item.quantity,
    0
  );
  const shippingPrice = itemsPrice < 100000 ? 0 : 15000;
  const taxPrice = round2(itemsPrice * 0.1);
  const totalPrice = round2(itemsPrice + taxPrice + shippingPrice);
  useEffect(() => {
    if (!paymentMethod) {
      router.push("/payment");
    }
    if (cartItems.length === 0) {
      router.push("/cart");
    }
  }, []);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const handlePlaceOrder = async () => {
    closeSnackbar();
    try {
      setLoading(true);
      const { data } = await axios.post(
        "/api/orders",
        {
          orderItems: cartItems,
          paymentMethod,
          shippingAddress,
          itemsPrice,
          taxPrice,
          shippingPrice,
          totalPrice,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      dispatch({ type: "CART_CLEAR" });
      Cookies.remove("cartItems");
      setLoading(false);
      router.push(`/order/${data._id}`);
    } catch (e) {
      setLoading(false);
      enqueueSnackbar(getError(e), { variant: "error" });
    }
  };
  return (
    <Layout title="Preview Order">
      <CheckoutWizard activeStep={3} />
      <Typography component="h1" variant="h1">
        Place Order
      </Typography>
      <Grid container spacing={1}>
        <Grid item md={9} xs={12}>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography component="h2" variant="h2">
                  Shipping Address
                </Typography>
              </ListItem>
              <ListItem>
                {shippingAddress.fullname}
                {", "}
                {shippingAddress.address}
                {", "}
                {shippingAddress.city}
                {", "}
                {shippingAddress.country}
              </ListItem>
            </List>
          </Card>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography component="h2" variant="h2">
                  Payment Method
                </Typography>
              </ListItem>
              <ListItem>
                <strong>{paymentMethod}</strong>
              </ListItem>
            </List>
          </Card>
          <Card className={classes.section}>
            <ListItem>
              <Typography component="h2" variant="h2">
                Order Items
              </Typography>
            </ListItem>
            <ListItem>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Image</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cartItems.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          <NextLink href={`/product/${item.slug}`} passHref>
                            <Link>
                              <Image
                                src={item.image}
                                alt={item.name}
                                width="50"
                                height="50"
                              />
                            </Link>
                          </NextLink>
                        </TableCell>

                        <TableCell>
                          <NextLink href={`/product/${item.slug}`}>
                            <Link>
                              <Typography>{item.name}</Typography>
                            </Link>
                          </NextLink>
                        </TableCell>

                        <TableCell align="right">{item.quantity}</TableCell>

                        <TableCell align="right">
                          <Typography>
                            {item.price * item.quantity}vnd
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </ListItem>
          </Card>
        </Grid>
        <Grid item md={3} xs={12}>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography component="h2" variant="h2">
                  Order Summary
                </Typography>
              </ListItem>
              <ListItem>
                <Grid item xs={6}>
                  <Typography>
                    <strong>Items</strong>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography align="right">
                    <strong>{itemsPrice} vnd</strong>
                  </Typography>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid item xs={6}>
                  <Typography>
                    <strong>Tax</strong>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography align="right">
                    <strong>{taxPrice} vnd</strong>
                  </Typography>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid item xs={6}>
                  <Typography>
                    <strong>Shipping</strong>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography align="right">
                    <strong>{shippingPrice} vnd</strong>
                  </Typography>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid item xs={6}>
                  <Typography>
                    <strong>Total</strong>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography align="right">
                    <strong>{totalPrice} vnd</strong>
                  </Typography>
                </Grid>
              </ListItem>
              <ListItem>
                <Button
                  color="primary"
                  variant="contained"
                  fullWidth
                  onClick={handlePlaceOrder}
                >
                  Check out
                </Button>
              </ListItem>
              <ListItem>
                <Button
                  color="secondary"
                  variant="contained"
                  fullWidth
                  onClick={() => router.push("/payment")}
                >
                  Back
                </Button>
              </ListItem>
              {loading && (
                <ListItem>
                  <CircularProgress></CircularProgress>
                </ListItem>
              )}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default dynamic(Promise.resolve(OrderScreen), { ssr: false });
