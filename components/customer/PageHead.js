import Head from "next/head";

export default function PageHead({ title, description }) {
  return (
    <Head>
      <title>{title}</title>
      {description ? <meta name="description" content={description} /> : null}
      <meta name="theme-color" content="#32120d" />
    </Head>
  );
}
