import { IM_Fell_DW_Pica, Inter,Poppins } from "next/font/google";
import localFont from "next/font/local"

const inter = Inter({ subsets: ["latin"] });

const imfell400 = IM_Fell_DW_Pica({
  subsets: ["latin"],
  weight: "400",
  style: "normal",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: "700",
  style: "normal",
});

const poppinsNormal = Poppins({
  subsets: ["latin"],
  weight: ["100","200","300","400","500","600","700","800","900"],
  style: "normal",
});

const ringbearer = localFont({
  src:[{path:"./../app/fonts/ringbearer.medium.ttf",weight:"100"}]
})


export {inter,imfell400,ringbearer,poppins,poppinsNormal};