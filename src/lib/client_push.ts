import OneSignal from "react-onesignal";

export const pushClient = (uid: string) => {
  if (!window.OneSignal) {
    OneSignal.init({
      appId: import.meta.env.VITE_REACT_APP_ONESIGNAL_ID,
      notifyButton: {
        enable: true,
        size: "small",
      },
      promptOptions: {
        slidedown: {
          prompts: [
            {
              autoPrompt: true,
              delay: {
                pageViews: 1,
                timeDelay: 10,
              },
            },
          ],
        },
      },

      allowLocalhostAsSecureOrigin: true,
    })
      .then(() => OneSignal.login(uid))
      .catch((e) => console.log(e));
  }
};
