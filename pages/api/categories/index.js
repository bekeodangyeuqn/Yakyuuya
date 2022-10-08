import nc from "next-connect";
import Product from "../../../model/Product";
import db from "../../../utils/db";
import { onError } from "../../../utils/onError";
const handler = nc({
  onError,
});

handler.get(async (req, res) => {
  await db.conn();
  const categories = await Product.find().distinct("category");
  await db.disconn();
  res.send(categories);
  await db.disconn();
});

export default handler;
