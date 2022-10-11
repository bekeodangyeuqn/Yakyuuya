import nc from "next-connect";
import { onError } from "../../../utils/onError";
import { isAuth, isAdmin } from "../../../utils/auth";
import db from "../../../utils/db";
import Product from "../../../model/Product";

const handler = nc({
  onError,
});

handler.use(isAuth, isAdmin);

handler.get(async (req, res) => {
  await db.conn();
  const products = await Product.find({});
  await db.disconn();
  res.send(products);
});

export default handler;
