"use client";

import { useMemo, useState } from "react";

export default function About() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [kabupaten, setKabupaten] = useState("");
  const [sheetData, setSheetData] = useState<any>([]);
  const [KecamatanSelect, setKecamatanSelect] = useState("");

  // create a function that remove whitespace from a string except space between words
  const removeWhitespace = (str: string) => {
    if (typeof str !== "string") return str;
    return str.replace(/^\s+|\s+$/gm, "");
  };

  // create a function that capitalize the first character of each words in a string
  const capitalize = (str: string) => {
    if (typeof str !== "string") return str;
    // check if string is only one word
    if (str.split(" ").length === 1)
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const kecamatan = useMemo(() => {
    const kecamatanData = sheetData.map((item: any) =>
      removeWhitespace(item.__EMPTY_1)
    );
    return Array.from([...new Set(kecamatanData)]);
  }, [sheetData]);

  const filteredSheetData = useMemo(() => {
    if (!KecamatanSelect) {
      return sheetData.filter((item: any) => {
        if (item.__EMPTY === "" || item.__EMPTY === "Kabupaten / Kota")
          return false;
        return true;
      });
    } else {
      // filter sheet data where __EMPTY is not undefined and __EMPTY_1 is equal to KecamatanSelect
      return sheetData.filter(
        (item: any) => item.__EMPTY_1 === KecamatanSelect
      );
    }
  }, [KecamatanSelect, sheetData]);

  const desa = useMemo(() => {
    const desaData = filteredSheetData.map((item: any) =>
      removeWhitespace(item.__EMPTY_2)
    );
    return Array.from([...new Set(desaData)]);
  }, [filteredSheetData]);

  // const jumlahPinjamByDesa = useMemo(() => {
  //   const data = [];
  //   desa.forEach((item: any) => {
  //     const data = filteredSheetData.reduce((acc: any, cur: any) => {
  //       if (acc[item]) {

  //       } else {
  //         acc[item] =
  //       }
  //     }, {})
  //   });
  // }, [desa]);

  const handleFetchSheetData = async (kab: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`/api/excel/${kab}`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setSheetData(data.data);
  };

  const handleFileChange = async (e: any) => {
    setFile(e.target.files[0]);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    const res = await fetch("/api/excel", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    handleFetchSheetData(data.sheetNames[0], e.target.files[0]);
    setData(data.sheetNames);
  };

  const handleKabupatenChange = async (e: any) => {
    setKecamatanSelect("");
    if (!file) return;
    setKabupaten(e.target.value);
    handleFetchSheetData(e.target.value, file);
  };

  const handleKecamatanChange = (e: any) => {
    setKecamatanSelect(e.target.value);
  };

  const jumlahPinjamDariBarang = filteredSheetData.reduce(
    (acc: any, cur: any) => {
      const desaExist = acc.find((obj: any) => obj.desa === cur.__EMPTY_2);
      if (desaExist) {
        const barangExist = desaExist.barang.find(
          (obj: any) => obj.nama === cur.__EMPTY_6
        );
        if (barangExist) {
          barangExist.jumlah += cur.__EMPTY_7;
        } else {
          desaExist.barang.push({
            nama: cur.__EMPTY_6,
            jumlah: cur.__EMPTY_7,
          });
        }
      } else {
        acc.push({
          desa: cur.__EMPTY_2,
          barang: [
            {
              nama: cur.__EMPTY_6,
              jumlah: cur.__EMPTY_7,
            },
          ],
        });
      }
      return acc;
    },
    []
  );

  return (
    <div className="max-w-7xl flex flex-col gap-5">
      <input
        type="file"
        name="excel"
        id="excel"
        onChange={handleFileChange}
        className="text-white bg-transparent border border-white rounded-lg p-2"
      />
      <form className="flex flex-col gap-3">
        <label htmlFor="Kabupaten" className="text-white text-2xl">
          Pilih kabupaten
        </label>
        <select
          name="Kabupaten"
          id="Kabupaten"
          disabled={data.length === 0}
          onChange={handleKabupatenChange}
        >
          {data &&
            data.map((item: string, index: number) => (
              <option key={item + index} value={item}>
                {item}
              </option>
            ))}
        </select>
        <label htmlFor="Kecamatan" className="text-white text-2xl">
          Pilih kecamtan
        </label>
        <select
          name="kecamatan"
          id="kecamatan"
          onChange={handleKecamatanChange}
          disabled={data.length === 0}
        >
          {kecamatan.length > 0 &&
            kecamatan.map((item: any, index: number) => {
              if (index === 1) return;
              return (
                <option key={item + index} value={item}>
                  {capitalize(item)}
                </option>
              );
            })}
        </select>
      </form>
      {KecamatanSelect && (
        <div className="text-white text-lg">
          <h1>
            Kecamatan : <span className="font-bold">{KecamatanSelect}</span>
          </h1>
          <div className="flex gap-2">
            <h1>Desa : </h1>
            <ul>
              {jumlahPinjamDariBarang.map((item: any) => {
                return (
                  <li key={item.desa} className="flex gap-2">
                    <div className="w-[10rem]">{item.desa}</div>:
                    <div>
                      {item.barang.map((barang: any) => {
                        return (
                          <p
                            key={barang.nama}
                            className="flex items-center border-b pb-2 mb-4"
                          >
                            <span className="w-[20rem]">{barang.nama}</span>
                            <span className="text-2xl">{barang.jumlah}</span>
                          </p>
                        );
                      })}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
      <div className="border p-2">
        {sheetData.length > 0 ? (
          <div>
            <table className="table-auto">
              <thead className="text-white text-lg">
                <tr>
                  <th>No</th>
                  <th>
                    {kabupaten !== "inhil"
                      ? sheetData[1].__EMPTY
                      : "Kabupaten / Kota"}
                  </th>
                  <th>
                    {kabupaten !== "inhil"
                      ? sheetData[1].__EMPTY_1
                      : "Kecamatan"}
                  </th>
                  <th>
                    {kabupaten !== "inhil"
                      ? sheetData[1].__EMPTY_2
                      : "Desa / Kelurahan"}
                  </th>
                  <th>
                    {kabupaten !== "inhil"
                      ? sheetData[1].__EMPTY_3
                      : "Nama Kel. Tani / UPJA"}
                  </th>
                  <th>
                    {kabupaten !== "inhil"
                      ? sheetData[1].__EMPTY_4
                      : "Nama Ketua Kel. Tani / UPJA"}
                  </th>
                  <th>
                    {kabupaten !== "inhil" ? sheetData[1].__EMPTY_5 : "No. HP"}
                  </th>
                  <th>
                    {kabupaten !== "inhil"
                      ? sheetData[1].__EMPTY_6
                      : "Nama Barang"}
                  </th>
                  <th>
                    {kabupaten !== "inhil"
                      ? sheetData[1].__EMPTY_7
                      : "Jumlah (Unit)"}
                  </th>
                  <th>
                    {kabupaten !== "inhil"
                      ? sheetData[1].__EMPTY_8
                      : "Kode Barang"}
                  </th>
                  <th>
                    {kabupaten !== "inhil"
                      ? sheetData[1].__EMPTY_9
                      : "Tahun Anggaran"}
                  </th>
                  <th>
                    {kabupaten !== "inhil"
                      ? sheetData[1].__EMPTY_10
                      : "Tahun Anggaran"}
                  </th>
                </tr>
              </thead>
              <tbody className="text-white text-base text-center">
                {filteredSheetData.map((item: any, index: number) => {
                  return (
                    <tr key={index} className="border-b mb-2">
                      <td>{index + 1}</td>
                      <td>{item.__EMPTY}</td>
                      <td>{item.__EMPTY_1}</td>
                      <td>{item.__EMPTY_2}</td>
                      <td>{item.__EMPTY_3}</td>
                      <td>{item.__EMPTY_4}</td>
                      <td>{item.__EMPTY_5}</td>
                      <td>{item.__EMPTY_6}</td>
                      <td>{item.__EMPTY_7}</td>
                      <td>{item.__EMPTY_8}</td>
                      <td>{item.__EMPTY_9}</td>
                      <td>{item.__EMPTY_10}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
