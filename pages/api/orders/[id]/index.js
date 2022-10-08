import nc from "next-connect";
import db from "../../../../utils/db";
import Order from "../../../../model/Order";
import { isAuth } from "../../../../utils/auth";

const handler = nc();

handler.use(isAuth);

handler.get(async (req, res) => {
  await db.conn();
  const order = await Order.findById(req.query.id);
  await db.disconn();
  res.send(order);
});

export default handler;
