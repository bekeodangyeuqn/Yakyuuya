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
  CircularProgress,
  Button,
} from "@material-ui/core";
import React, { useContext, useEffect, useReducer } from "react";
import { Store } from "../../utils/Store";
import useStyles from "../../utils/styles";
import Layout from "../../components/Layout";
import NextLink from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { getError } from "../../utils/error";
import axios from "axios";
import { usePayPalScriptReducer, PayPalButtons } from "@paypal/react-paypal-js";
import { useSnackbar } from "notistack";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, order: action.payload, error: "" };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "PAY_RESET":
      return { ...state, loadingPay: false, successPay: false, errorPay: "" };
    case "PAY_REQUEST":
      return { ...state, loadingPay: true };
    case "PAY_SUCCESS":
      return { ...state, loadingPay: false, successPay: true };
    case "PAY_ERROR":
      return { ...state, loadingPay: false, errorPay: action.payload };
    case "DELIVER_RESET":
      return {
        ...state,
        loadingDeliver: false,
        successDeliver: false,
        errorDeliver: "",
      };
    case "DELIVER_REQUEST":
      return { ...state, loadingDeliver: true, errorDeliver: "" };
    case "DELIVER_SUCCESS":
      return { ...state, loadingDeliver: false, successDeliver: true };
    case "DELIVER_ERROR":
      return { ...state, loadingDeliver: false, errorDeliver: action.payload };
    default:
      state;
  }
};

function Order({ params }) {
  const orderId = params.id;
  const classes = useStyles();
  const router = useRouter();
  const { state } = useContext(Store);
  const { userInfo } = state;
  console.log(userInfo);
  const [
    { loading, error, order, successPay, loadingDeliver, successDeliver },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: "",
    order: {},
    successPay: false,
    loadingDeliver: false,
    successDeliver: false,
  });
  const {
    shippingAddress,
    paymentMethod,
    orderItems,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    isPaid,
    paidAt,
    isDelivered,
    deliveredAt,
  } = order;
  const [{ isPending }, payPalDispatch] = usePayPalScriptReducer();
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    if (!userInfo) {
      router.push("/login");
    }
    const fetchOrder = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        });
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (e) {
        dispatch({ type: "FETCH_ERROR", payload: getError(e) });
      }
    };
    if (
      !order._id ||
      successPay ||
      successDeliver ||
      (order && order._id !== orderId)
    ) {
      fetchOrder();
      if (successPay) {
        dispatch({ type: "PAY_RESET" });
      }
      if (successDeliver) {
        dispatch({ type: "DELIVER_RESET" });
      } else {
        const loadPayPalScript = async () => {
          const { data: clientId } = await axios.get("/api/key/paypal", {
            headers: { authorization: `Bearer ${userInfo.token}` },
          });
          payPalDispatch({
            type: "resetOptions",
            value: {
              "client-id": clientId,
              currency: "USD",
            },
          });
          payPalDispatch({ type: "setLoadingStatus", value: "pending" });
        };
        loadPayPalScript();
      }
    }
  }, [order, successPay, successDeliver]);
  const createOrder = (data, actions) => {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: {
              value: totalPrice,
            },
          },
        ],
      })
      .then((orderID) => {
        return orderID;
      });
  };

  const onApporve = (data, actions) => {
    return actions.order.capture().then(async function (details) {
      try {
        dispatch({ type: "PAY_REQUEST" });
        const { data } = await axios.put(
          `api/orders/${order._id}/pay`,
          details,
          {
            headers: { authorization: `Bearer ${userInfo.token}` },
          }
        );
        dispatch({ type: "PAY_SUCCESS", payload: data });
        enqueueSnackbar("Order is paid", { variant: "success" });
      } catch (e) {
        dispatch({ type: "PAY_ERROR", payload: getError(e) });
        enqueueSnackbar(getError(e), { variant: "error" });
      }
    });
  };

  function onError(err) {
    enqueueSnackbar(getError(err), { variant: "error" });
  }

  async function deliverOrderHandler() {
    try {
      dispatch({ type: "DELIVER_REQUEST" });
      const { data } = await axios.put(
        `/api/orders/${order._id}/deliver`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: "DELIVER_SUCCESS", payload: data });
      enqueueSnackbar("Order is delivered", { variant: "success" });
    } catch (err) {
      dispatch({ type: "DELIVER_FAIL", payload: getError(err) });
      enqueueSnackbar(getError(err), { variant: "error" });
    }
  }

  return (
    <Layout title="Preview Order">
      <Typography component="h1" variant="h1">
        Order {orderId}
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography className={classes.error}>{error}</Typography>
      ) : (
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
                <ListItem>
                  {isDelivered
                    ? `Delivered at ${deliveredAt}`
                    : "Is not delivered"}
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
                <ListItem>
                  {isPaid ? `Paid at ${paidAt}` : "Is not paid"}
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
                      {orderItems.map((item) => (
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
                              {item.price * item.quantity}usd
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
                      <strong>{itemsPrice} usd</strong>
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
                      <strong>{taxPrice} usd</strong>
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
                {!isPaid &&
                  paymentMethod === "paypal" &&
                  order.user === userInfo._id && (
                    <ListItem>
                      {isPending ? (
                        <CircularProgress />
                      ) : (
                        <div className={classes.fullWidth}>
                          <PayPalButtons
                            createOrder={createOrder}
                            onApporve={onApporve}
                            onError={onError}
                          ></PayPalButtons>
                        </div>
                      )}
                    </ListItem>
                  )}
                {userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                  <ListItem>
                    {loadingDeliver && <CircularProgress />}
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={deliverOrderHandler}
                    >
                      Deliver Order
                    </Button>
                  </ListItem>
                )}
              </List>
            </Card>
          </Grid>
        </Grid>
      )}
    </Layout>
  );
}

export async function getServerSideProps({ params }) {
  return { props: { params } };
}

export default dynamic(() => Promise.resolve(Order), { ssr: false });
