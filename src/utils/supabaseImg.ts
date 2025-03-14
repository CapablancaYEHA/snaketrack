import imageCompression from "browser-image-compression";
import { notif } from "./notif";

const options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 600,
  useWebWorker: true,
  initialQuality: 0.7,
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
    });
  }
};

export const calcImgUrl = (fullPath: string) => `${import.meta.env.VITE_REACT_APP_SUPABASE_URL}/storage/v1/object/public/${fullPath}`;
