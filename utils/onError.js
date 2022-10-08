import db from "./db";

const onError = async (err, req, res, next) => {
  await db.disconn();
  res.status(500).send({ message: err.toString() });
};

export { onError };
