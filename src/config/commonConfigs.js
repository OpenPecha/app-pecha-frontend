const fontConfig = {
  en: {
    title: {
      fontSize: "30px",
      fontFamily: "Roboto",
    },
    subtitle: {
      fontSize: "20px",
      fontFamily: "Roboto",
    },
    content: {
      fontSize: "17px",
      fontFamily: "Roboto",
    },
    subcontent: {
      fontSize: "14px",
      fontFamily: "Roboto",
    },
  },
  "bo-IN": {
    title: {
      fontSize: "30px",
      fontFamily: "Monlam-uni-ouchan2-ttf",
    },
    subtitle: {
      fontSize: "20px",
      fontFamily: "Monlam-bodyig-semi-bold-italic-ttf",
    },
    content: {
      fontSize: "17px",
      fontFamily: "Monlam-bodyig-semi-bold-ttf",
    },
    subcontent: {
      fontSize: "14px",
      fontFamily: "Monlam-bodyig-regular-ttf",
    },
  },
};

export const setFontVariables = (language) => {
  const root = document.getElementById("root");
  const fonts = fontConfig[language] || fontConfig["en"];
  Object.entries(fonts).forEach(([key, styles]) => {
    root?.style.setProperty(`--${ key }-font-size`, styles.fontSize);
    root?.style.setProperty(`--${ key }-font-family`, styles.fontFamily);
  });
};
