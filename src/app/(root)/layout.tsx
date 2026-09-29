import LocaleLayout from "../[locale]/layout";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <LocaleLayout params={Promise.resolve({ locale: "ko" })}>{children}</LocaleLayout>;
}
