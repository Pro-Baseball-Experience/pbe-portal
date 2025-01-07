import * as jwt from "jsonwebtoken";

export const signToken = (uid: number) =>
  jwt.sign({ userId: uid }, process.env.SECRET ?? "", {
    expiresIn: "15m",
  });
