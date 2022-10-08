import nc from "next-connect";
import Product from "../../../../model/Product";
import db from "../../../../utils/db";

const handler = nc();

handler.get(async (req, res) => {
  await db.conn();
  const product = await Product.findById(req.query.id);
  await db.disconn();
  res.send(product);
});

export default handler;
