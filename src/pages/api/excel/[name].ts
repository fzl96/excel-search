import formidable from "formidable";
import { NextApiRequest, NextApiResponse } from "next";
import XLSX from "xlsx";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { name } = req.query;
  if (req.method === "POST") {
    const form = new formidable.IncomingForm();
    form.parse(req);
    form.on("file", async (field, file) => {
      if (
        file.mimetype !==
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        res.end();
        return res.status(400).json({ message: "File is not an excel file" });
      }
      // read the file
      const workbook = XLSX.readFile(file.filepath);
      const worksheet = workbook.Sheets[name as string];
      const data = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      return res.status(201).json({ data });
    });
  }
}
