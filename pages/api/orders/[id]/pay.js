import nc from "next-connect";
import db from "../../../../utils/db";
import Order from "../../../../model/Order";
import { isAuth } from "../../../../utils/auth";

const handler = nc();

handler.use(isAuth);

handler.get(async (req, res) => {
  await db.conn();
  const order = await Order.findById(req.query.id);
  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.query.id,
      email_address: req.query.payer.email_address,
      status: req.query.status,
    };
    const paidOrder = await order.save();
    await db.disconn();
    res.send({ status: "Order paid", order: paidOrder });
  } else {
    await db.disconn();
    res.status(404).send({ message: "Order not found" });
  }
});

export default handler;
