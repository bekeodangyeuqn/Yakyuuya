import nc from "next-connect";
import db from "../../../utils/db";
import Order from "../../../model/Order";
import { onError } from "../../../utils/onError";
import { isAuth } from "../../../utils/auth";

const handler = nc({
  onError,
});

handler.use(isAuth);

handler.post(async (req, res) => {
  await db.conn();
  const newOrder = new Order({
    ...req.body,
    user: req.user._id,
  });
  const order = await newOrder.save();
  res.status(201).send(order);
});

export default handler;
