import {
  Grid,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Link,
  Button,
  Card,
  List,
  ListItem,
} from "@material-ui/core";
import React, { useContext } from "react";
import Layout from "../components/Layout";
import { Store } from "../utils/Store";
import NextLink from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import axios from "axios";
import { useRouter } from "next/router";

function CartScreen() {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;
  const updateCartHandler = async (item, quantity) => {
    const { data } = await axios.get(`/api/products/${item._id}`);
    if (data.countInStock < quantity) {
      window.alert("Product not available");
      return;
    }
    dispatch({ type: "ADD_CART_ITEM", payload: { ...item, quantity } });
  };
  const removeItemHandler = (item) => {
    dispatch({ type: "REMOVE_CART_ITEM", payload: item });
  };
  const goShippingHandler = () => {
    router.push("/shipping");
  };
  return (
    <Layout title="Shopping Cart">
      <Typography component="h1" variant="h1">
        Shopping Cart
      </Typography>
      {cartItems.length <= 0 ? (
        <div>
          Cart is empty. <NextLink href="/">Go Shopping</NextLink>
        </div>
      ) : (
        <Grid container spacing={1}>
          <Grid item md={9} xs={12}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Image</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Action</TableCell>
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

                      <TableCell align="right">
                        <Select
                          value={item.quantity}
                          onChange={(e) =>
                            updateCartHandler(item, e.target.value)
                          }
                        >
                          {[...Array(item.countInStock).keys()].map((x) => (
                            <MenuItem key={x + 1} value={x + 1}>
                              {x + 1}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>

                      <TableCell align="right">
                        <Typography>{item.price}usd</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          color="secondary"
                          variant="contained"
                          onClick={() => removeItemHandler(item)}
                        >
                          x
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid item md={3} xs={12}>
            <Card>
              <List>
                <ListItem>
                  <Typography component="h1" variant="h1">
                    Subtotal ({cartItems.reduce((t, c) => t + c.quantity, 0)}{" "}
                    item) :{" "}
                    {cartItems.reduce((t, c) => t + c.quantity * c.price, 0)}{" "}
                    usd
                  </Typography>
                </ListItem>
                <ListItem>
                  <Button
                    color="primary"
                    variant="contained"
                    fullWidth
                    onClick={goShippingHandler}
                  >
                    Check out
                  </Button>
                </ListItem>
              </List>
            </Card>
          </Grid>
        </Grid>
      )}
    </Layout>
  );
}

export default dynamic(() => Promise.resolve(CartScreen), { ssr: false });
