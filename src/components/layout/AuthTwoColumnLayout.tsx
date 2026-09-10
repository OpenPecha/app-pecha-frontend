import React from "react";
import clsx from "clsx";

import { Badge } from "@/components/ui/badge";
import webuddhist_logo from "/img/light_mode_logo.svg";
import { Link } from "react-router-dom";

type AuthTwoColumnLayoutProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  badgeText?: string;
  features?: string[];
  containerClassName?: string;
  sidebarClassName?: string;
  mainClassName?: string;
};

const defaultFeatures = [
  "OpenSource",
  "AI Chat",
  "Community Discussion",
  "Simplified Text Relation",
  "Multi Language Support",
];

const AuthTwoColumnLayout: React.FC<AuthTwoColumnLayoutProps> = ({
  children,
  title = "WeBuddhist Study Platform",
  description = "Connects users to Buddhist scriptures in various languages. Search a verse to explore its origins, interpretations, and related texts. Engage with the community by sharing insights and learning from others through sheets and topics. ",
  badgeText = "Buddhism in your own words",
  features = defaultFeatures,
  containerClassName,
  sidebarClassName,
  mainClassName,
}) => {
  return (
    <div
      className={clsx(
        "flex h-dvh w-full items-center justify-center bg-white",
        containerClassName,
      )}
    >
      <div className="flex h-full w-full flex-col md:flex-row">
        <aside
          className={clsx(
            "hidden w-full flex-1 flex-col justify-between space-y-6 px-8 py-10 md:flex",
            sidebarClassName,
          )}
        >
          <div className="flex flex-1 flex-col justify-center space-y-6">
            <div className="flex items-start">
              <Link to="/">
                <img
                  src={webuddhist_logo}
                  alt="WeBuddhist"
                  className="h-fit w-20"
                />
              </Link>
            </div>
            <div className="flex w-full flex-col space-y-2 text-start">
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-medium en-serif-text">{title}</p>
                <Badge
                  variant="outline"
                  className="text-sm text-muted-foreground"
                >
                  {badgeText}
                </Badge>
              </div>
              <div className="flex w-full max-w-xl">
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 text-muted-foreground">
            {features.map((feature, index) => (
              <span key={feature} className="flex items-center">
                <p className="text-sm text-muted-foreground">{feature}</p>
                {index < features.length - 1 && (
                  <span
                    className="mx-2 text-muted-foreground"
                    aria-hidden="true"
                  >
                    •
                  </span>
                )}
              </span>
            ))}
          </div>
        </aside>
        <main
          className={clsx(
            "flex w-full flex-1 items-center justify-center px-6 py-10 bg-navbar md:px-10",
            mainClassName,
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AuthTwoColumnLayout;
