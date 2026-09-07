import {
  ArrowsClockwiseIcon,
  CalendarBlankIcon,
  ChatsCircleIcon,
  CloudIcon,
  EnvelopeSimpleIcon,
  EyeIcon,
  FileTextIcon,
  FolderSimpleIcon,
  MagnifyingGlassIcon,
  MicrophoneIcon,
  PackageIcon,
  QuotesIcon,
  ShieldCheckIcon,
  SignInIcon,
  TranslateIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/ssr"

export const apps = [
  { icon: FolderSimpleIcon, label: "SharePoint" },
  { icon: CloudIcon, label: "OneDrive" },
  { icon: EnvelopeSimpleIcon, label: "Mail" },
  { icon: CalendarBlankIcon, label: "Calendar" },
  { icon: ChatsCircleIcon, label: "Teams" },
  { icon: UsersThreeIcon, label: "People" },
]

export const examples = [
  {
    ask: "Where's the Q3 budget?",
    answer: "Finance › Planning, updated Tuesday by Priya.",
    source: { icon: FolderSimpleIcon, label: "Q3-budget.xlsx" },
  },
  {
    ask: "Did legal reply yet?",
    answer: "Yes, at 4:12pm. Two changes to clause 7.",
    source: { icon: EnvelopeSimpleIcon, label: "Re: MSA draft" },
  },
  {
    ask: "Who's in the 3pm?",
    answer: "Priya, Sam and Lena, in room 4B.",
    source: { icon: CalendarBlankIcon, label: "Vendor review" },
  },
  {
    ask: "Was the outage resolved?",
    answer: "Yes, at 11:40. A certificate had expired.",
    source: { icon: ChatsCircleIcon, label: "#ops" },
  },
  {
    ask: "Où est le budget Q3 ?",
    answer: "Dans Finance › Planning, mis à jour mardi par Priya.",
    source: { icon: FolderSimpleIcon, label: "Q3-budget.xlsx" },
  },
]

export const features = [
  {
    icon: MagnifyingGlassIcon,
    title: "Your own Microsoft 365",
    body: "Searches through Microsoft's own index. Nothing crawled, nothing indexed elsewhere, nothing copied out.",
  },
  {
    icon: EyeIcon,
    title: "Sees what you see",
    body: "Every search runs as the person asking. Their permissions are the boundary. Every answer cites its source.",
  },
  {
    icon: FileTextIcon,
    title: "Reads only what it needs",
    body: "A snippet first. Then the passages of a document that bear on the question, two documents at most. Spreadsheets are queried, never downloaded.",
  },
  {
    icon: TranslateIcon,
    title: "English and French",
    body: "Ask in either, typed or out loud, and hear the answer in the same one. Even when the document is in the other.",
  },
  {
    icon: MicrophoneIcon,
    title: "Speak or type",
    body: "Tap to talk and hear it read back as it is written. Same conversation on a phone.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Runs in your tenant",
    body: "One azd up into your own subscription, spend ceiling included. Tokens, not seats.",
  },
]

export const steps = [
  {
    icon: PackageIcon,
    title: "Install",
    body: "Run azd up, choose the apps, consent once.",
  },
  {
    icon: SignInIcon,
    title: "Sign in",
    body: "The Microsoft account you already have. Nothing to set up.",
  },
  {
    icon: QuotesIcon,
    title: "Ask",
    body: "Out loud or typed. It says where the answer came from.",
  },
  {
    icon: ArrowsClockwiseIcon,
    title: "Update",
    body: "Pull a release, run azd deploy. Your data stays put.",
  },
]

export const figures = [
  { value: "0.1¢", label: "a typed question" },
  { value: "0.5¢", label: "a spoken answer" },
  { value: "0", label: "seats to buy" },
  { value: "0", label: "copies of your data" },
]

export const figuresCaption =
  "Azure's retail prices, paid in your own subscription."

export const roadmap = [
  "The chat panel, typed",
  "Sign-in with Microsoft Entra",
  "Search over your Microsoft 365 through Graph",
  "Voice: transcription in, sentence-chunked speech out",
  "Self-service install: azd up, Bicep templates, a Dockerfile",
  "The end-to-end browser suite",
]
