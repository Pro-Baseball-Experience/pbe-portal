import { COOKIE_CONFIG, POST } from "@/lib/http/constants";
import { useCookie } from "@/lib/http/hooks/useCookie";
import { useMutation } from "@/lib/http/hooks/useMutation";
import {
  Alert,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  Input,
  Link,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { successToastOptions } from "../toast/toastOptions";

type DrawerId = "bug" | "feature";
type GithubIssueData = {
  title: string;
  body: string;
  label: "bug" | "story" | null;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const bugFormSchema = z.object({
  description: z.string(),
  reproductionSteps: z.string().optional(),
  operatingSystem: z.string().optional(),
  browser: z.string().optional(),
  device: z.string().optional(),
});

type BugFormValues = z.infer<typeof bugFormSchema>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const featureFormSchema = z.object({
  description: z.string(),
  desiredFunctionality: z.string().optional(),
});

type FeatureFormValues = z.infer<typeof featureFormSchema>;

type DrawerData = {
  id: DrawerId;
  header: "Report a Bug" | "Suggest a Feature";
  form: React.ReactNode;
};

export default function Footer() {
  const [drawerId, setDrawerId] = useState<DrawerId | null>(null);
  const [uid] = useCookie(COOKIE_CONFIG.userId);

  const toast = useToast();
  const { mutate: createGithubIssue } = useMutation<
    { newIssueUrl: string },
    GithubIssueData
  >({
    mutationFn: (requestData: GithubIssueData) =>
      axios({
        method: POST,
        url: "/api/v3/github/issue",
        data: requestData,
      }),
    onSuccess: (data) => {
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

  const onClose = () => {
    setDrawerId(null);
  };

  const submitTicket = async (issueData: BugFormValues | FeatureFormValues) => {
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

  const BugForm = () => {
    const {
      handleSubmit,
      register,
      formState: { errors },
    } = useForm<BugFormValues>();

    const hasErrors: boolean = Object.values(errors).some(Boolean);

    const submitBug: SubmitHandler<BugFormValues> = async (data) => {
      await submitTicket(data);
    };

    return (
      <form onSubmit={handleSubmit(submitBug)}>
        <FormControl>
          <Input {...register("description")} />
        </FormControl>
        <Input {...register("reproductionSteps")} />
        <Input {...register("operatingSystem")} />
        <Input {...register("browser")} />
        <Input {...register("device")} />
        {hasErrors && (
          <Alert status="error">
            <ul>
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </Alert>
        )}
        <Button type="submit">Submit Bug</Button>
        <Button type="button" onClick={onClose}>
          Cancel
        </Button>
      </form>
    );
  };

  const bugDrawerData: DrawerData = {
    id: "bug",
    header: "Report a Bug",
    form: <BugForm />,
  } as const;

  const FeatureForm = () => {
    const {
      handleSubmit,
      register,
      formState: { errors },
    } = useForm<FeatureFormValues>();

    const hasErrors: boolean = Object.values(errors).some(Boolean);
    const submitFeature: SubmitHandler<FeatureFormValues> = async (data) => {
      await submitTicket(data);
    };

    return (
      <form onSubmit={handleSubmit(submitFeature)}>
        <Input {...register("description")} />
        <Input {...register("desiredFunctionality")} />
        {hasErrors && (
          <Alert status="error">
            <ul>
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </Alert>
        )}
        <Button type="submit">Submit Feature</Button>
        <Button type="button" onClick={onClose}>
          Cancel
        </Button>
      </form>
    );
  };

  const featureDrawerData: DrawerData = {
    id: "feature",
    header: "Suggest a Feature",
    form: <FeatureForm />,
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
      <Drawer placement="bottom" isOpen={drawerId !== null} onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            {drawerId === "bug" && bugDrawerData.header}
            {drawerId === "feature" && featureDrawerData.header}
          </DrawerHeader>
          <DrawerBody>
            {drawerId === "bug" && bugDrawerData.form}
            {drawerId === "feature" && featureDrawerData.form}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
