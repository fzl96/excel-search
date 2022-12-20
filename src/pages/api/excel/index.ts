import formidable from "formidable";
import { NextApiRequest, NextApiResponse } from "next";
import XLSX from "xlsx";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // parse the request using formidable and get the file
    const form = new formidable.IncomingForm();
    form.parse(req);
    form.on("file", (field, file) => {
      // check if the file is an excel file
      if (
        file.mimetype !==
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        return res.status(400).json({ message: "File is not an excel file" });
      }
      // read the file
      const workbook = XLSX.readFile(file.filepath);
      // get the first sheet
      const sheetNames = workbook.SheetNames;

      return res.json({ sheetNames });
    });
  } else if (req.method === "GET") {
    res.json({ message: "GET" });
  }
}
