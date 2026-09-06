import {
  EyeIcon,
  MagnifyingGlassIcon,
  MicrophoneIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react/ssr"

export const features = [
  {
    icon: MagnifyingGlassIcon,
    title: "Your own Microsoft 365",
    body: "Files, SharePoint, mail, calendar and Teams, through Microsoft's own index. Every answer cites its source.",
  },
  {
    icon: EyeIcon,
    title: "Sees what you see",
    body: "Every search runs as the person asking. Their permissions are the boundary. Nothing is copied out.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Runs in your tenant",
    body: "One azd up into your own subscription, spend ceiling included. Tokens, not seats.",
  },
  {
    icon: MicrophoneIcon,
    title: "Speak or type",
    body: "Tap to talk and hear it read back. Same conversation on a phone.",
  },
]

export const questions = [
  "Where's the Q3 budget?",
  "Did legal reply yet?",
  "Who's in the 3pm?",
  "Was the outage resolved?",
]

export const steps = [
  {
    title: "Install",
    body: "Run azd up, choose the apps, consent once.",
  },
  {
    title: "Sign in",
    body: "The Microsoft account you already have. Nothing to set up.",
  },
  {
    title: "Ask",
    body: "Out loud or typed. It says where the answer came from.",
  },
]

export const roadmap = [
  "The chat panel, typed",
  "Sign-in with Microsoft Entra",
  "Search over your Microsoft 365 through Graph",
  "Voice: transcription in, sentence-chunked speech out",
  "Self-service install: azd up, Bicep templates, a Dockerfile",
  "The end-to-end browser suite",
]
