/*
 * Storybook Picture-Book theme — routes.
 * Mobile-first PWA: bottom-tab pages + reader/tracker subpages.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Home from "@/pages/Home";
import About from "@/pages/About";
import HandbookIndex from "@/pages/HandbookIndex";
import SectionReader from "@/pages/SectionReader";
import HundredThings from "@/pages/HundredThings";
import Checklists from "@/pages/Checklists";
import Singapore from "@/pages/Singapore";
import TrackersHub from "@/pages/TrackersHub";
import TrackerPage from "@/pages/TrackerPage";
import Memories from "@/pages/Memories";
import NotFound from "@/pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/handbook" component={HandbookIndex} />
      <Route path="/handbook/100-things" component={HundredThings} />
      <Route path="/handbook/checklists" component={Checklists} />
      <Route path="/handbook/:slug" component={SectionReader} />
      <Route path="/singapore" component={Singapore} />
      <Route path="/trackers" component={TrackersHub} />
      <Route path="/trackers/:id" component={TrackerPage} />
      <Route path="/memories" component={Memories} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="top-center" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
