import nc from "next-connect";
import Order from "../../../model/Order";
import Product from "../../../model/Product";
import User from "../../../model/User";
import { onError } from "../../../utils/onError";
import db from "../../../utils/db";
import { isAuth } from "../../../utils/auth";

const handler = nc({
  onError,
});

handler.use(isAuth);

handler.get(async (req, res) => {
  await db.conn();
  const ordersCount = await Order.countDocuments();
  const productsCount = await Product.countDocuments();
  const usersCount = await User.countDocuments();
  const ordersPriceGroup = await Order.aggregate([
    {
      $group: {
        _id: null,
        sales: { $sum: "$totalPrice" },
      },
    },
  ]);
  const ordersPrice =
    ordersPriceGroup.length > 0 ? ordersPriceGroup[0].sales : 0;
  const salesData = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        totalSales: { $sum: "$totalPrice" },
      },
    },
  ]);
  res.send({ ordersCount, productsCount, usersCount, ordersPrice, salesData });
});

export default handler;
