import nc from "next-connect";
import db from "../../../../utils/db";
import Order from "../../../../model/Order";
import { onError } from "../../../../utils/onError";
import { isAuth } from "../../../../utils/auth";

const handler = nc({
  onError,
});

handler.use(isAuth);

handler.put(async (req, res) => {
  await db.conn();
  const order = await Order.findById(req.query.id);
  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    const deliveredOrder = await order.save();
    await db.disconn();
    res.send({ message: "order delivered", order: deliveredOrder });
  } else {
    await db.disconn();
    res.status(404).send({ message: "order not found" });
  }
});

export default handler;
