import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  let locale = "en";
  try {
    const cookieStore = await cookies();
    const cookieVal =
      cookieStore.get("NEXT_LOCALE")?.value ||
      cookieStore.get("the_coin_store_lang")?.value;
    if (cookieVal === "km" || cookieVal === "en") {
      locale = cookieVal;
    }
  } catch {
    // If running in a context where cookies() is not available, default to 'en'
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
