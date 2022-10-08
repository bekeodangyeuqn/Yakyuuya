import nc from "next-connect";
import db from "../../../utils/db";
import Product from "../../../model/Product";

const handler = nc();

handler.get(async (req, res) => {
  await db.conn();
  const products = await Product.find({});
  await db.disconn();
  res.send(products);
});

export default handler;
