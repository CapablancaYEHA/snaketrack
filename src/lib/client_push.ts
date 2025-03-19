import { useEffect, useState } from "preact/hooks";
import OneSignal from "react-onesignal";

const id = import.meta.env.VITE_REACT_APP_ONESIGNAL_ID;

export function UseOneSignal(uid) {
  const [isInit, setInit] = useState(false);

  useEffect(() => {
    if (uid) {
      if (!isInit) {
        setInit(true);
        OneSignal.init({
          appId: id,
          autoRegister: true,
          notifyButton: {
            enable: false,
            size: "small",
          },
          promptOptions: {
            slidedown: {
              prompts: [
                // {
                //   autoPrompt: true,
                //   delay: {
                //     pageViews: 1,
                //     timeDelay: 10,
                //   },
                // },
                {
                  type: "push",
                  autoPrompt: true,
                  title: "Пук",
                  delay: { pageViews: 0, timeDelay: 0 },
                },
              ],
            },
          },
          welcomeNotification: { title: "С-с-с-спасибо!", message: "Сообщим только о важном и приятном" },
          allowLocalhostAsSecureOrigin: true,
        })
          .then(() => {
            OneSignal.login(uid);
            OneSignal.Notifications.requestPermission();
          })
          .catch((e) => {
            setInit(false);
            console.log(e);
          });
      }
    }
  }, [uid, isInit]);
}
