import formidable from "formidable";
import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

const readFile = (
  req: NextApiRequest,
  saveLocally: boolean
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  const options: formidable.Options = {};
  if (saveLocally) {
    options.uploadDir = path.join(process.cwd(), "/public", "/uploads");
    options.filename = (name, extension, path, form) => {
      return Date.now().toString() + "_" + path.originalFilename;
    };
  }

  const form = formidable(options);
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    });
  });
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    try {
      fs.readdirSync(path.join(process.cwd(), "/public", "/uploads"));
    } catch (error) {
      fs.mkdirSync(path.join(process.cwd(), "/public", "/uploads"));
    }
    await readFile(req, true);
    res.status(200).json({ message: "File uploaded successfully" });
  } else if (req.method === "GET") {
    console.log("Check point");
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
