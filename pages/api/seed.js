import nc from "next-connect";
import db from "../../utils/db";
import Product from "../../model/Product";
import data from "../../utils/data";
import User from "../../model/User";

const handler = nc();

handler.get(async (req, res) => {
  await db.conn();
  await Product.deleteMany();
  await Product.insertMany(data.products);
  await User.deleteMany();
  await User.insertMany(data.users);
  await db.disconn();
  res.send({ message: "Seeded Sucessfully!" });
});

export default handler;
