import imageCompression from "browser-image-compression";
import { notif } from "./notif";

const options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 900,
  useWebWorker: true,
  initialQuality: 0.8,
};

export const compressImage = async (pic: File, handleChange, handleState) => {
  try {
    const rar = await imageCompression(pic, options);
    let shit = await imageCompression.getDataUrlFromFile(rar);
    await handleChange(rar);
    handleState(shit);
  } catch (e) {
    notif({
      c: "red",
      t: "Ошибка загрузки файла",
      m: e?.message,
      code: e.code || e.statusCode,
    });
  }
};

export const compressMulti = async (pic: File, handleChange, handleState) => {
  try {
    const rar = await imageCompression(pic, options);
    let shit = await imageCompression.getDataUrlFromFile(rar);
    await handleChange(rar);
    handleState((s) => [...(s ?? []), shit]);
  } catch (e) {
    notif({
      c: "red",
      t: "Ошибка загрузки файла",
      m: e?.message,
      code: e.code || e.statusCode,
    });
  }
};

export const calcImgUrl = (fullPath: string) => `${import.meta.env.VITE_REACT_APP_SUPABASE_URL}/storage/v1/object/public/${fullPath}`;

export const toDataUrl = async (url) => {
  if (!url) return null;

  const data = await fetch(url);
  const blob = await data.blob();
  let step = new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      resolve(base64data);
    };
    reader.onerror = reject;
  });
  let param = await step;
  return imageCompression.getFilefromDataUrl(param as string, "фото которое уже было");
};
