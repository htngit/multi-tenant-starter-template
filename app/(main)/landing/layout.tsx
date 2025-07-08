import { Footer } from "@/components/footer";
import { LandingPageHeader } from "@/components/landing-page-header";

export default function LandingLayout(props: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingPageHeader
        items={[
          { title: "Home", href: "/" },
          { title: "Fitur", href: "/landing#features" },
          { title: "Harga", href: "/landing#pricing" },
          { title: "Github", href: "https://github.com/stack-auth/stack-template", external: true },
        ]}
      />
      <main className="flex-1">{props.children}</main>
      <Footer
        builtBy="XalesIn Team"
        builtByLink="https://xalesin.com/"
        githubLink="https://github.com/stack-auth/stack-template"
        twitterLink="https://twitter.com/xalesin"
        linkedinLink="linkedin.com/company/xalesin"
      />
    </div>
  );
}