import { COOKIE_CONFIG, POST } from "@/lib/http/constants";
import { useCookie } from "@/lib/http/hooks/useCookie";
import { useMutation } from "@/lib/http/hooks/useMutation";
import {
  Button,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerRoot,
  DrawerTrigger,
  Link,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";

type DrawerId = "bug" | "feature";
type GithubIssueData = {
  title: string;
  body: string;
  label: "bug" | "story" | null;
};

type DrawerData = {
  id: DrawerId;
  header: "Report a Bug" | "Suggest a Feature";
  form: React.ReactNode | null;
};

export default function Footer() {
  const [drawerId, setDrawerId] = useState<DrawerId | null>(null);
  const [uid] = useCookie(COOKIE_CONFIG.userId);

  const { mutate: createGithubIssue } = useMutation<void, GithubIssueData>({
    mutationFn: (requestData: GithubIssueData) =>
      axios({
        method: POST,
        url: "/api/v3/github/issue",
        data: requestData,
      }),
    onSuccess: ({ data }) => {
      toast({
        title: "Ticket Submitted",
        description: data?.payload?.newIssueUrl ?? null,
        ...successToastOptions,
      });
      setDrawerId(null);
    },
  });

  const openDrawer = (source: DrawerId) => {
    setDrawerId(source);
  };

  const submitGithubIssue = async (
    issueData: BugFormValues | FeatureFormValues
  ) => {
    const bugCreator: string = uid ? `by ${uid}` : " anonymously";

    const requestData: GithubIssueData = {
      title: "",
      body: "",
      label: null,
    };

    if ("reproductionSteps" in issueData) {
      requestData.title = `Bug Report (Submitted ${bugCreator})`;
      requestData.label = "bug";
      requestData.body = `## Description
${issueData.description}
    
## Reproduction Steps
${issueData.reproductionSteps}
    
## Operating System
${issueData.operatingSystem}
    
## Browser
${issueData.browser}
    
## Device
${issueData.device}`;
    } else if ("desiredFunctionality" in issueData) {
      requestData.title = `Feature Request (Submitted ${bugCreator})`;
      requestData.label = "story";
      requestData.body = `## Description
${issueData.description}
    
## Desired Functionality
${issueData.desiredFunctionality}`;
    } else {
      return;
    }

    createGithubIssue(requestData);
  };

  const bugDrawerData: DrawerData = {
    id: "bug",
    header: "Report a Bug",
    form: null,
  } as const;

  const featureDrawerData: DrawerData = {
    id: "feature",
    header: "Suggest a Feature",
    form: null,
  } as const;

  return (
    <>
      <footer className="absolute bottom-0 flex h-16 w-full items-center justify-center bg-black text-grey100">
        <div className="font-mont text-xs">
          &copy;&nbsp;{new Date().getFullYear()}&nbsp;|&nbsp;
          <span className="hidden sm:inline">
            {"Made with ♥︎ by the SHL Dev Team"}&nbsp;|&nbsp;
          </span>
          <Link href="https://simulationhockey.com/index.php" isExternal>
            Visit Forum
          </Link>
          &nbsp;|&nbsp;
          <Link onClick={() => openDrawer("bug")}>{bugDrawerData.header}</Link>
          &nbsp;|&nbsp;
          <Link onClick={() => openDrawer("feature")}>
            {featureDrawerData.header}
          </Link>
        </div>
      </footer>
      <DrawerRoot
        placement="bottom"
        open={drawerId !== null}
        onOpenChange={() => setDrawerId(null)}
      >
        <DrawerBackdrop />
        <DrawerTrigger asChild>
          <Button>Drawer Button</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerCloseTrigger />
          <DrawerHeader className="bg-primary text-secondary">
            {drawerId === "bug" && bugDrawerData.header}
            {drawerId === "feature" && featureDrawerData.header}
          </DrawerHeader>
          <DrawerBody className="bg-primary text-secondary">
            {drawerId === "bug" && bugDrawerData.form}
            {drawerId === "feature" && featureDrawerData.form}
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>
    </>
  );
}
