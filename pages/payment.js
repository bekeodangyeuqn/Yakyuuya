import {
  FormControl,
  RadioGroup,
  FormControlLabel,
  Typography,
  ListItem,
  List,
  Radio,
  Button,
} from "@material-ui/core";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import React, { useContext, useEffect, useState } from "react";
import CheckoutWizard from "../components/CheckoutWizard";
import Layout from "../components/Layout";
import { Store } from "../utils/Store";
import useStyles from "../utils/styles";

const Payment = () => {
  const classes = useStyles();
  const [paymentMethod, setPaymentMethod] = useState("");
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const {
    cart: { shippingAddress },
  } = state;
  useEffect(() => {
    if (!shippingAddress.address) {
      router.push("/shipping");
    } else {
      setPaymentMethod(Cookies.get("paymentMethod"));
    }
  }, []);
  const handleSubmit = (e) => {
    closeSnackbar();
    e.preventDefault();
    if (!paymentMethod) {
      enqueueSnackbar("Payment menthod is required", { variant: "error" });
    } else {
      dispatch({ type: "SAVE_PAYMENT_METHOD", payload: paymentMethod });
      Cookies.set("paymentMethod", paymentMethod);
      router.push("/placeorder");
    }
  };
  return (
    <Layout title="Payment Method">
      <CheckoutWizard activeStep={2} />
      <form className={classes.form} onSubmit={handleSubmit}>
        <Typography variant="h1" component="h1">
          Payment Method
        </Typography>
        <List>
          <ListItem>
            <FormControl component="fieldset">
              <RadioGroup
                aria-label="Payment Method"
                name="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel
                  value="paypal"
                  control={<Radio />}
                  label="Paypal"
                />
                <FormControlLabel
                  value="stripe"
                  control={<Radio />}
                  label="Stripe"
                />
                <FormControlLabel
                  value="cast"
                  control={<Radio />}
                  label="Cast"
                />
              </RadioGroup>
            </FormControl>
          </ListItem>
          <ListItem>
            <Button color="primary" variant="contained" fullWidth type="submit">
              Continue
            </Button>
          </ListItem>
          <ListItem>
            <Button
              color="secondary"
              variant="contained"
              fullWidth
              type="submit"
              onClick={() => router.push("/shipping")}
            >
              Back
            </Button>
          </ListItem>
        </List>
      </form>
    </Layout>
  );
};

export default Payment;
