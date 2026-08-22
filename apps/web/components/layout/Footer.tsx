import { PageContainer } from "./PageContainer";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full border-t border-[#1f1f1f] bg-black">
      <PageContainer className="py-4 sm:py-5">
        <p className="text-center text-xs text-slate-500 sm:text-sm">
          © {year} Stockfolio. All rights reserved.
        </p>
      </PageContainer>
    </footer>
  );
}
