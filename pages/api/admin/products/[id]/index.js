import nc from "next-connect";
import db from "../../../../../utils/db";
import { isAdmin, isAuth } from "../../../../../utils/auth";
import { onError } from "../../../../../utils/onError";
import Product from "../../../../../model/Product";

const handler = nc({
  onError,
});

handler.use(isAuth, isAdmin);

handler.get(async (req, res) => {
  await db.conn();
  const product = await Product.findById(req.query.id);
  await db.disconn();
  res.send(product);
});

handler.put(async (req, res) => {
  await db.conn();
  const product = await Product.findById(req.query.id);
  if (product) {
    product.name = req.body.name;
    product.slug = req.body.slug;
    product.price = req.body.price;
    product.category = req.body.category;
    product.image = req.body.image;
    product.brand = req.body.brand;
    product.countInStock = req.body.countInStock;
    product.description = req.body.description;
    await product.save();
    await db.disconn();
    res.send({ message: "Product Updated Successfully" });
  } else {
    await db.disconn();
    res.status(404).send({ message: "Product Not Found" });
  }
});

export default handler;
