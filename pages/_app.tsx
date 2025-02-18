import { FooterComponent } from "@/components/footer";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontSize: "18px", // 🔹 Aumenta o tamanho do texto
            padding: "16px", // 🔹 Adiciona mais espaçamento interno
            width: "400px", // 🔹 Define a largura do toast
            borderRadius: "10px", // 🔹 Deixa os cantos arredondados
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // 🔹 Adiciona sombra suave
          },
        }}
      />
      <Component {...pageProps} />
      <FooterComponent/>
      <div className="h-10"></div>
    </>
  );
}
