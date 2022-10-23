import nc from "next-connect";
import { isAdmin, isAuth } from "../../../../utils/auth";
import Product from "../../../../model/Product";
import db from "../../../../utils/db";

const handler = nc();
handler.use(isAuth, isAdmin);

handler.get(async (req, res) => {
  await db.conn();
  const products = await Product.find({});
  await db.disconn();
  res.send(products);
});

handler.post(async (req, res) => {
  await db.conn();
  const newProduct = new Product({
    name: "sample name",
    slug: "sample-slug-" + Math.random(),
    image: "/images/glove1.jpg",
    price: 0,
    category: "sample category",
    brand: "sample brand",
    countInStock: 0,
    description: "sample description",
    rating: 0,
    numReviews: 0,
  });

  const product = await newProduct.save();
  await db.disconn();
  res.send({ message: "Product Created", product });
});

export default handler;
