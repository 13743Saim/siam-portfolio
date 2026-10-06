import Portfolio from "../components/Portfolio";
import { getPortfolioContent } from "../lib/supabase-server";

export default async function Home() {
  let content;
  try {
    content = await getPortfolioContent();
  } catch {
    content = undefined;
  }

  return <Portfolio content={content} />;
}
