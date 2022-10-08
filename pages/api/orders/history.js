import nc from "next-connect";
import db from "../../../utils/db";
import Order from "../../../model/Order";
import { isAuth } from "../../../utils/auth";

const handler = nc();

handler.use(isAuth);

handler.get(async (req, res) => {
  await db.conn();
  const orders = await Order.find({ user: req.user._id });
  res.send(orders);
});

export default handler;
