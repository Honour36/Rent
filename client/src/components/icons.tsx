/**
 * Icon adapter: every icon the app used to import from "@/components/icons" is
 * re-exported here from @heroicons/react/24/outline instead, under the
 * SAME name, so call sites don't need to change at all - only the import
 * source (`from "@/components/icons"` -> `from "@/components/icons"`).
 *
 * Both the plain name and the "*Icon"-suffixed name lucide-react also
 * exports for the same glyph are included, since different files in this
 * codebase used either form.
 *
 * A handful of lucide icons have no exact Heroicons equivalent - those are
 * mapped to the closest available icon (noted inline). This is a visual
 * approximation for those specific glyphs, not a functional change.
 *
 * Heroicons are stroke/fill "currentColor"-based, same as lucide, so they
 * automatically pick up whatever text color Tailwind's theme/dark-mode
 * classes set - no extra theming work needed for them to "work in all
 * themes".
 */
import type { ComponentType, SVGProps } from "react";
import {
  AcademicCapIcon,
  AdjustmentsHorizontalIcon,
  ArchiveBoxIcon,
  ArrowDownIcon,
  ArrowDownLeftIcon,
  ArrowDownRightIcon,
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  ArrowRightStartOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ArrowUpIcon,
  ArrowUpRightIcon,
  ArrowUpTrayIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  ArrowsUpDownIcon,
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
  Bars3Icon,
  BanknotesIcon,
  BeakerIcon,
  BellIcon,
  BellSlashIcon,
  BoltIcon,
  BookOpenIcon,
  BriefcaseIcon,
  BuildingLibraryIcon,
  BuildingOfficeIcon,
  BuildingOffice2Icon,
  CalendarDateRangeIcon,
  CalendarDaysIcon,
  CalendarIcon,
  ChartBarIcon,
  ChatBubbleLeftIcon,
  ChatBubbleOvalLeftIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  Cog6ToothIcon,
  CommandLineIcon,
  ComputerDesktopIcon,
  CpuChipIcon,
  CreditCardIcon,
  CubeIcon,
  CurrencyDollarIcon,
  DevicePhoneMobileIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  DocumentCheckIcon,
  DocumentDuplicateIcon,
  DocumentIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  EllipsisVerticalIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  FaceSmileIcon,
  FireIcon,
  FlagIcon,
  FolderIcon,
  ForwardIcon,
  FunnelIcon,
  GlobeAltIcon,
  HashtagIcon,
  HomeIcon,
  InboxIcon,
  InformationCircleIcon,
  KeyIcon,
  LanguageIcon,
  LightBulbIcon,
  LinkIcon,
  ListBulletIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  MegaphoneIcon,
  MinusIcon,
  MoonIcon,
  NoSymbolIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  PencilIcon,
  PencilSquareIcon,
  PhoneIcon,
  PlusCircleIcon,
  PlusIcon,
  PresentationChartLineIcon,
  PrinterIcon,
  QrCodeIcon,
  QuestionMarkCircleIcon,
  QueueListIcon,
  ReceiptPercentIcon,
  RectangleGroupIcon,
  ScaleIcon,
  ServerIcon,
  ShareIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SparklesIcon,
  StarIcon,
  SunIcon,
  TableCellsIcon,
  TagIcon,
  TrashIcon,
  TruckIcon,
  UserCircleIcon,
  UserGroupIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
  ViewColumnsIcon,
  ViewfinderCircleIcon,
  WalletIcon,
  WrenchIcon,
  XCircleIcon,
  XMarkIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

/** Type used in place of lucide-react's `LucideIcon` for typing icon props. */
export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

/** Heroicons has no plain circle glyph - used as a small radio/status dot. */
function Circle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

// ─── Direct / near-direct matches ─────────────────────────────────────────────
export { AcademicCapIcon as BookOpenCheck };
export { AdjustmentsHorizontalIcon as Settings2 };
export { AdjustmentsHorizontalIcon as SlidersHorizontal };
export { ArchiveBoxIcon as Archive };
export { ArrowDownIcon as ArrowDown };
export { ArrowDownLeftIcon as ArrowDownLeft };
export { ArrowDownRightIcon as ArrowDownRight };
export { ArrowDownTrayIcon as Download };
export { ArrowDownTrayIcon as Save };
export { ArrowLeftIcon as ArrowLeft };
export { ArrowPathIcon as Loader2 };
export { ArrowPathIcon as Loader2Icon };
export { ArrowPathIcon as LoaderIcon };
export { ArrowPathIcon as RefreshCw };
export { ArrowRightIcon as ArrowRight };
export { ArrowRightStartOnRectangleIcon as LogOut };
export { ArrowTopRightOnSquareIcon as ExternalLink };
export { ArrowTrendingDownIcon as TrendingDown };
export { ArrowTrendingUpIcon as TrendingUp };
export { ArrowTrendingUpIcon as TrendingUpIcon };
export { ArrowUpIcon as ArrowUp };
export { ArrowUpRightIcon as ArrowUpRight };
export { ArrowUpTrayIcon as Upload };
export { ArrowUturnLeftIcon as RotateCcw };
export { ArrowUturnRightIcon as RotateCw };
export { ArrowsUpDownIcon as ArrowUpDown };
export { Bars3BottomLeftIcon as PanelLeftIcon };
export { Bars3BottomRightIcon as PanelRightClose };
export { Bars3BottomRightIcon as PanelRightOpen };
export { Bars3Icon as GripVertical };
export { Bars3Icon as GripVerticalIcon };
export { BanknotesIcon as HandCoins };
export { BellIcon as Bell };
export { BellSlashIcon as BellOff };
export { BoltIcon as Activity };
export { BoltIcon as Zap };
export { BookOpenIcon as BookOpen };
export { BookOpenIcon as BookText };
export { BriefcaseIcon as BriefcaseBusiness };
export { BuildingLibraryIcon as Landmark };
export { BuildingOfficeIcon as Building };
export { BuildingOffice2Icon as Building2 };
export { CalendarDateRangeIcon as CalendarRange };
export { CalendarDaysIcon as CalendarDays };
export { CalendarIcon as Calendar };
export { CalendarIcon as Calendar1 };
export { CalendarIcon as CalendarIcon };
export { CalendarIcon as CalendarOff };
export { CheckBadgeIcon as BadgeCheck };
export { CheckCircleIcon as CheckCircle };
export { CheckCircleIcon as CheckCircle2 };
export { CheckCircleIcon as CheckSquare };
export { CheckCircleIcon as CircleCheckIcon };
export { CheckIcon as Check };
export { CheckIcon as CheckIcon };
export { ChatBubbleLeftIcon as MessageSquarePlus };
export { ChatBubbleLeftIcon as Quote };
export { ChatBubbleOvalLeftIcon as MessageCircle };
export { ChevronDoubleLeftIcon as ChevronsLeft };
export { ChevronDoubleRightIcon as ChevronsRight };
export { ChevronDownIcon as ChevronDown };
export { ChevronDownIcon as ChevronDownIcon };
export { ChevronLeftIcon as ChevronLeft };
export { ChevronLeftIcon as ChevronLeftIcon };
export { ChevronRightIcon as ChevronRight };
export { ChevronRightIcon as ChevronRightIcon };
export { ChevronUpDownIcon as ChevronsUpDown };
export { ChevronUpIcon as ChevronUpIcon };
export { Circle };
export { ClipboardDocumentCheckIcon as ClipboardCheck };
export { ClipboardDocumentListIcon as ClipboardList };
export { ClockIcon as Clock };
export { ClockIcon as Clock3 };
export { ClockIcon as Clock3Icon };
export { ClockIcon as Timer };
export { Cog6ToothIcon as Cog };
export { Cog6ToothIcon as Settings };
export { Cog6ToothIcon as UserCog };
export { CommandLineIcon as Command };
export { CommandLineIcon as Keyboard };
export { ComputerDesktopIcon as Monitor };
export { CreditCardIcon as CreditCard };
export { CubeIcon as Box };
export { CubeIcon as Container };
export { CubeIcon as PackageCheck };
export { CubeIcon as PackageX };
export { CurrencyDollarIcon as BadgeDollarSign };
export { CurrencyDollarIcon as DollarSign };
export { CurrencyDollarIcon as SaudiRiyal };
export { DocumentArrowDownIcon as FileDown };
export { DocumentArrowUpIcon as FileUp };
export { DocumentCheckIcon as FileCheck };
export { DocumentDuplicateIcon as Copy };
export { DocumentIcon as File };
export { DocumentTextIcon as FileText };
export { EllipsisHorizontalIcon as Ellipsis };
export { EllipsisHorizontalIcon as MoreHorizontal };
export { EllipsisHorizontalIcon as MoreHorizontalIcon };
export { EllipsisVerticalIcon as EllipsisVertical };
export { EllipsisVerticalIcon as EllipsisVerticalIcon };
export { EllipsisVerticalIcon as MoreVertical };
export { EnvelopeIcon as Mail };
export { EnvelopeOpenIcon as MailCheck };
export { ExclamationCircleIcon as AlertCircle };
export { ExclamationCircleIcon as BadgeAlert };
export { ExclamationCircleIcon as CircleAlertIcon };
export { ExclamationTriangleIcon as AlertTriangle };
export { ExclamationTriangleIcon as AlertTriangleIcon };
export { ExclamationTriangleIcon as TriangleAlert };
export { ExclamationTriangleIcon as TriangleAlertIcon };
export { EyeIcon as Eye };
export { EyeSlashIcon as EyeOff };
export { FolderIcon as Folder };
export { ForwardIcon as Forward };
export { FunnelIcon as Filter };
export { FunnelIcon as ListFilter };
export { GlobeAltIcon as Globe };
export { GlobeAltIcon as Orbit };
export { HashtagIcon as Hash };
export { HomeIcon as Home };
export { InboxIcon as Inbox };
export { InformationCircleIcon as Info };
export { InformationCircleIcon as InfoIcon };
export { KeyIcon as KeyRound };
export { LinkIcon as Link2 };
export { LockClosedIcon as Lock };
export { MapPinIcon as MapPin };
export { MapPinIcon as Pin };
export { MagnifyingGlassIcon as Search };
export { MagnifyingGlassIcon as SearchIcon };
export { MegaphoneIcon as Megaphone };
export { MinusIcon as MinusIcon };
export { MoonIcon as Moon };
export { NoSymbolIcon as CircleOff };
export { PaperAirplaneIcon as Plane };
export { PaperAirplaneIcon as Send };
export { PaperAirplaneIcon as Ship };
export { PencilIcon as Edit2 };
export { PencilIcon as PenLine };
export { PencilIcon as Pencil };
export { PencilSquareIcon as PenSquare };
export { PhoneIcon as Phone };
export { PlusCircleIcon as PlusCircle };
export { PlusIcon as Plus };
export { PresentationChartLineIcon as LineChart };
export { PrinterIcon as Printer };
export { QuestionMarkCircleIcon as CircleHelp };
export { QuestionMarkCircleIcon as HelpCircle };
export { QueueListIcon as Rows3 };
export { ReceiptPercentIcon as Receipt };
export { ReceiptPercentIcon as ReceiptText };
export { ServerIcon as Server };
export { ShareIcon as Share2 };
export { ShieldCheckIcon as ShieldCheck };
export { ShoppingBagIcon as ShoppingBag };
export { SparklesIcon as Sparkles };
export { SparklesIcon as Waves };
export { Squares2X2Icon as Grid };
export { StarIcon as Star };
export { SunIcon as Sun };
export { TrashIcon as Trash2 };
export { TruckIcon as Truck };
export { UserCircleIcon as CircleUser };
export { UserCircleIcon as SquareUserRound };
export { UserCircleIcon as UserRound };
export { UserGroupIcon as UsersRound };
export { UserIcon as User };
export { UserPlusIcon as UserCheck };
export { UserPlusIcon as UserPlus };
export { UsersIcon as Users };
export { ViewfinderCircleIcon as Focus };
export { WalletIcon as Wallet };
export { WalletIcon as WalletMinimal };
export { WrenchIcon as Wrench };
export { XCircleIcon as OctagonXIcon };
export { XCircleIcon as XCircle };
export { XMarkIcon as X };
export { XMarkIcon as XIcon };

// ─── Second pass: names only found once multi-line imports were parsed correctly ──
export { ClockIcon as AlarmClock };
export { NoSymbolIcon as Ban };
export { BanknotesIcon as Banknote };
export { CpuChipIcon as Bot };
export { BriefcaseIcon as Briefcase };
export { ChartBarIcon as ChartBar };
export { ChevronDoubleLeftIcon as ChevronsLeftIcon };
export { ChevronDoubleRightIcon as ChevronsRightIcon };
export { ArrowPathIcon as CircleDashed };
export { PresentationChartLineIcon as CircleGauge };
export { BeakerIcon as Droplet };
export { BeakerIcon as Droplets };
export { FlagIcon as Flag };
export { FireIcon as Flame };
export { TruckIcon as Forklift };
export { ClockIcon as History };
export { ViewColumnsIcon as Kanban };
export { Squares2X2Icon as LayoutDashboard };
export { RectangleGroupIcon as LayoutTemplate };
export { LightBulbIcon as Lightbulb };
export { LinkIcon as Link };
export { ListBulletIcon as List };
export { EnvelopeOpenIcon as MailOpen };
export { ChatBubbleLeftIcon as MessageSquare };
export { MinusIcon as Minus };
export { CubeIcon as Package };
export { PaperClipIcon as Paperclip };
export { PhoneIcon as PhoneCall };
export { PlusIcon as PlusIcon };
export { QrCodeIcon as QrCode };
export { ArrowUturnLeftIcon as Reply };
export { ArrowUturnLeftIcon as ReplyAll };
export { PaperAirplaneIcon as SendHorizontal };
export { DevicePhoneMobileIcon as Smartphone };
export { FaceSmileIcon as Smile };
export { SparklesIcon as Snowflake };
export { CommandLineIcon as SquareTerminal };
export { TableCellsIcon as Table2 };
export { TagIcon as Tag };
export { CommandLineIcon as Terminal };
export { FireIcon as Thermometer };
export { SunIcon as ThermometerSun };
export { LanguageIcon as Type };
export { ScaleIcon as Weight };
