import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    try {
      const files = fs.readdirSync(
        path.join(process.cwd(), "/public", "/uploads")
      );
      const pathToFile = path.join(process.cwd(), "/public", "/uploads");
      res.status(200).json({ path: pathToFile, files });
    } catch (error) {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};
