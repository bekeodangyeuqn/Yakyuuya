import nc from "next-connect";
import { onError } from "../../../utils/onError";
import { isAuth, isAdmin } from "../../../utils/auth";
import db from "../../../utils/db";
import Order from "../../../model/Order";

const handler = nc({
  onError,
});

handler.use(isAuth, isAdmin);

handler.get(async (req, res) => {
  await db.conn();
  const orders = await Order.find({}).populate("user", "name");
  await db.disconn();
  res.send(orders);
});

export default handler;
